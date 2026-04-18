import { describe, it, expect, vi } from 'vitest'

// Mock Supabase admin client
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: { id: 'shop-123', name: "Dave's Auto", vapi_phone_number_id: 'ph_abc' },
            error: null,
          })
        })
      })
    })
  })
}))

const { identifyShopByPhoneNumberId } = await import('@/features/calls/identify-shop')

describe('identifyShopByPhoneNumberId', () => {
  it('returns a shop when found', async () => {
    const shop = await identifyShopByPhoneNumberId('ph_abc')
    expect(shop).not.toBeNull()
    expect(shop?.id).toBe('shop-123')
  })
})
