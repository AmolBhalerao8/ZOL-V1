import { describe, it, expect, vi } from 'vitest'
import type { ShopContext } from '@/agents/types'

vi.mock('@/lib/openai/client', () => ({
  getOpenAIClient: () => ({
    chat: {
      completions: {
        create: vi.fn().mockResolvedValue({
          choices: [{
            message: {
              content: JSON.stringify({
                personName: 'John Smith',
                personPhone: '+14155551234',
                personEmail: 'john@example.com',
                carMake: 'Ford',
                carModel: 'F-150',
                carYear: 2019,
                carPlate: 'ABC123',
                issueDescription: 'Engine making knocking noise',
                estimatedSeverity: 'high',
              })
            }
          }]
        })
      }
    }
  })
}))

const { extractCallDetailsTool } = await import('@/agents/tools/extract-call-details')

const mockCtx: ShopContext = {
  shopId: 'shop-1',
  shopName: "Dave's Auto",
  pricingConfig: {},
  businessHours: {},
  recentCustomers: [],
  googleTokens: {},
}

describe('extractCallDetailsTool', () => {
  it('extracts structured data from transcript', async () => {
    const transcript = `
      Agent: Thank you for calling Dave's Auto. How can I help?
      Caller: Hi, I'm John Smith. My Ford F-150 is making a knocking noise.
      Agent: What year is the truck?
      Caller: 2019. License plate ABC123.
      Agent: Can I get your callback number?
      Caller: Sure, 415-555-1234. Email is john@example.com.
    `

    const result = await extractCallDetailsTool.execute({ transcript, shopName: "Dave's Auto" }, mockCtx)

    expect(result.status).toBe('success')
    expect(result.output.personName).toBe('John Smith')
    expect(result.output.personPhone).toBe('+14155551234')
    expect(result.output.carMake).toBe('Ford')
    expect(result.output.estimatedSeverity).toBe('high')
  })

  it('tool has correct name', () => {
    expect(extractCallDetailsTool.name).toBe('extract_call_details')
  })
})
