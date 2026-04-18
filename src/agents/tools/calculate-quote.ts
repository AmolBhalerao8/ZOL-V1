import { getOpenAIClient } from '@/lib/openai/client'
import type {
  Tool,
  CalculateQuoteInput,
  CalculateQuoteOutput,
  LineItem,
  ShopContext,
  ToolResult,
} from '../types'

export const calculateQuoteTool: Tool<CalculateQuoteInput, CalculateQuoteOutput> = {
  name: 'calculate_quote',
  description:
    'Calculate a repair quote with line items based on the issue description and shop pricing config.',
  inputSchema: {
    type: 'object',
    properties: {
      issueDescription: { type: 'string' },
      carMake: { type: 'string' },
      carModel: { type: 'string' },
      carYear: { type: 'number' },
    },
    required: ['issueDescription'],
  },

  async execute(
    input: CalculateQuoteInput,
    ctx: ShopContext
  ): Promise<ToolResult<CalculateQuoteOutput>> {
    const openai = getOpenAIClient()
    const { pricingConfig, shopName } = ctx

    const pricingContext = JSON.stringify({
      laborRate: pricingConfig.labor_rate ?? 120,
      partsMarkup: pricingConfig.parts_markup ?? 0.3,
      taxRate: pricingConfig.tax_rate ?? 0.0875,
      commonServices: pricingConfig.common_services ?? [],
    })

    const systemPrompt = `You are a quoting assistant for ${shopName}, a mechanic shop.
Generate a realistic repair quote based on the issue described.
Use the shop's pricing config: ${pricingContext}
Return ONLY valid JSON — no markdown, no explanation.`

    const vehicle = [input.carYear, input.carMake, input.carModel]
      .filter(Boolean)
      .join(' ')

    const userPrompt = `Issue: ${input.issueDescription}
Vehicle: ${vehicle || 'unknown'}

Return JSON with this shape:
{
  "lineItems": [{ "description": string, "qty": number, "unit_price": number }],
  "subtotal": number,
  "tax": number,
  "total": number,
  "notes": string
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      response_format: { type: 'json_object' },
    })

    const raw = completion.choices[0]?.message?.content ?? '{}'
    const parsed = JSON.parse(raw) as {
      lineItems?: LineItem[]
      subtotal?: number
      tax?: number
      total?: number
      notes?: string
    }

    const lineItems = parsed.lineItems ?? []
    const subtotal = parsed.subtotal ?? lineItems.reduce((s, l) => s + l.qty * l.unit_price, 0)
    const taxRate = pricingConfig.tax_rate ?? 0.0875
    const tax = parsed.tax ?? parseFloat((subtotal * taxRate).toFixed(2))
    const total = parsed.total ?? parseFloat((subtotal + tax).toFixed(2))

    return {
      status: 'success',
      output: {
        lineItems,
        subtotal,
        tax,
        total,
        notes: parsed.notes ?? '',
      },
    }
  },
}
