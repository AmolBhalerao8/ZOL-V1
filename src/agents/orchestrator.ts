/**
 * Agent orchestrator — PLAN → TOOL_CALL → OBSERVE → FINISH loop.
 *
 * 1. PLAN  — GPT-4o receives ShopContext + input + available tools, returns tool call sequence
 * 2. TOOL_CALL — executes each tool via typed interface
 * 3. OBSERVE — writes step result to agent_runs.steps
 * 4. Loop until finish_reason = stop OR max 10 iterations
 * 5. FINISH — write final result + status to DB
 */

import type OpenAI from 'openai'
import { getOpenAIClient } from '@/lib/openai/client'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Tool, ShopContext, AgentStepRecord, OrchestratorResult } from './types'
import type { Json } from '@/lib/supabase/types'

const MAX_ITERATIONS = 10

type AnyTool = Tool<unknown, unknown>

function buildSystemPrompt(ctx: ShopContext): string {
  return `You are ZOL, an agentic AI orchestrator for ${ctx.shopName} mechanic shop.
You receive a trigger (e.g. a completed call) and must coordinate tools to:
1. Extract structured customer + vehicle data from the transcript
2. Upsert the customer record
3. Generate a repair quote
4. Send the quote via email
5. Book a follow-up

Shop context:
- Shop ID: ${ctx.shopId}
- Shop Name: ${ctx.shopName}
- Pricing: ${JSON.stringify(ctx.pricingConfig)}
- Recent customers: ${ctx.recentCustomers.length} on file

Call tools one at a time. Use outputs from previous calls as inputs to subsequent calls.
When all necessary work is done, stop.`
}

function toolsToOpenAIFormat(tools: AnyTool[]): OpenAI.ChatCompletionTool[] {
  return tools.map((t) => ({
    type: 'function' as const,
    function: {
      name: t.name,
      description: t.description,
      parameters: t.inputSchema,
    },
  }))
}

export async function runOrchestrator(params: {
  runId: string
  ctx: ShopContext
  input: Record<string, unknown>
  tools: AnyTool[]
}): Promise<OrchestratorResult> {
  const { runId, ctx, input, tools } = params
  const openai = getOpenAIClient()
  const admin = createAdminClient()

  const steps: AgentStepRecord[] = []
  const messages: OpenAI.ChatCompletionMessageParam[] = [
    { role: 'system', content: buildSystemPrompt(ctx) },
    { role: 'user', content: JSON.stringify(input) },
  ]

  const toolMap = new Map<string, AnyTool>(tools.map((t) => [t.name, t]))
  const openAITools = toolsToOpenAIFormat(tools)

  let stepNum = 0
  let finalResult: unknown = null

  try {
    for (let i = 0; i < MAX_ITERATIONS; i++) {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages,
        tools: openAITools,
        tool_choice: 'auto',
      })

      const choice = completion.choices[0]
      if (!choice) break

      const { finish_reason, message } = choice
      messages.push(message)

      if (finish_reason === 'stop' || !message.tool_calls?.length) {
        finalResult = message.content
        break
      }

      // Execute each tool call
      for (const toolCall of message.tool_calls) {
        if (toolCall.type !== 'function') continue
        const toolName = toolCall.function.name
        const toolInput = JSON.parse(toolCall.function.arguments) as Record<string, unknown>
        const tool = toolMap.get(toolName)
        stepNum++

        const stepStart = Date.now()

        // Log step BEFORE execution
        const stepRecord: AgentStepRecord = {
          step: stepNum,
          tool: toolName,
          input: toolInput,
          output: null,
          duration_ms: 0,
          status: 'success',
        }

        let toolOutput: unknown = null
        let toolError: string | undefined

        if (!tool) {
          toolError = `Unknown tool: ${toolName}`
          stepRecord.status = 'error'
          stepRecord.error = toolError
        } else {
          try {
            const result = await tool.execute(toolInput, ctx)
            toolOutput = result.output
            if (result.status === 'error') {
              toolError = result.error
              stepRecord.status = 'error'
              stepRecord.error = toolError
            } else {
              stepRecord.output = result.output
            }
          } catch (err) {
            toolError = err instanceof Error ? err.message : String(err)
            stepRecord.status = 'error'
            stepRecord.error = toolError
          }
        }

        stepRecord.duration_ms = Date.now() - stepStart
        stepRecord.output = toolOutput
        steps.push(stepRecord)

        // Append tool result to conversation
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: toolError
            ? JSON.stringify({ error: toolError })
            : JSON.stringify(toolOutput),
        })

        // Write step to DB incrementally
        await admin
          .from('agent_runs')
          .update({ steps: steps as unknown as Json })
          .eq('id', runId)
      }
    }

    // FINISH
    await admin
      .from('agent_runs')
      .update({
        status: 'done',
        steps: steps as unknown as Json,
        result: finalResult as Json,
        finished_at: new Date().toISOString(),
      })
      .eq('id', runId)

    return { status: 'done', steps, result: finalResult }
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err)

    await admin
      .from('agent_runs')
      .update({
        status: 'failed',
        steps: steps as unknown as Json,
        error: errorMsg,
        finished_at: new Date().toISOString(),
      })
      .eq('id', runId)

    return { status: 'failed', steps, result: null, error: errorMsg }
  }
}
