import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { ShopContext } from '@/agents/types'

// Mock OpenAI
vi.mock('@/lib/openai/client', () => ({
  getOpenAIClient: () => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                lineItems: [
                  { description: 'Oil change', qty: 1, unit_price: 89.99 },
                  { description: 'Filter replacement', qty: 1, unit_price: 25.00 },
                ],
                subtotal: 114.99,
                tax: 10.06,
                total: 125.05,
                notes: 'Includes 5qt synthetic oil',
              })
            }
          }]
        })
      }
    }
  })
}))

const { calculateQuoteTool } = await import('@/agents/tools/calculate-quote')

const mockCtx: ShopContext = {
  shopId: 'shop-1',
  shopName: "Dave's Auto",
  pricingConfig: { labor_rate: 120, parts_markup: 0.3, tax_rate: 0.0875 },
  businessHours: {},
  recentCustomers: [],
  googleTokens: {},
}

describe('calculateQuoteTool', () => {
  it('returns line items and totals', async () => {
    const result = await calculateQuoteTool.execute(
      { issueDescription: 'Oil change needed', carMake: 'Toyota', carModel: 'Camry', carYear: 2020 },
      mockCtx
    )

    expect(result.status).toBe('success')
    expect(result.output.lineItems.length).toBeGreaterThan(0)
    expect(result.output.total).toBeGreaterThan(0)
    expect(result.output.subtotal).toBeGreaterThan(0)
  })

  it('tool has correct name and schema', () => {
    expect(calculateQuoteTool.name).toBe('calculate_quote')
    expect(calculateQuoteTool.inputSchema).toBeDefined()
  })
})
