import { getOpenAIClient } from '@/lib/openai/client'
import type {
  Tool,
  ExtractCallDetailsInput,
  ExtractCallDetailsOutput,
  ShopContext,
  ToolResult,
} from '../types'

export const extractCallDetailsTool: Tool<ExtractCallDetailsInput, ExtractCallDetailsOutput> = {
  name: 'extract_call_details',
  description:
    'Extract structured customer and vehicle information from a call transcript using GPT-4o.',
  inputSchema: {
    type: 'object',
    properties: {
      transcript: { type: 'string', description: 'Full call transcript' },
      shopName: { type: 'string', description: 'Name of the mechanic shop' },
    },
    required: ['transcript', 'shopName'],
  },

  async execute(
    input: ExtractCallDetailsInput,
    _ctx: ShopContext
  ): Promise<ToolResult<ExtractCallDetailsOutput>> {
    const openai = getOpenAIClient()

    const systemPrompt = `You are a data extraction assistant for a mechanic shop called "${input.shopName}".
Extract structured information from the call transcript. Return ONLY valid JSON — no markdown, no explanation.
If a field is not mentioned, set it to null.`

    const userPrompt = `Transcript:
${input.transcript}

Return JSON with this exact shape:
{
  "personName": string | null,
  "personPhone": string | null,
  "personEmail": string | null,
  "carMake": string | null,
  "carModel": string | null,
  "carYear": number | null,
  "carPlate": string | null,
  "issueDescription": string | null,
  "estimatedSeverity": "low" | "medium" | "high" | null
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(raw) as ExtractCallDetailsOutput

    return { status: 'success', output: parsed }
  },
}
