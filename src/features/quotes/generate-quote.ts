import { createAdminClient } from '@/lib/supabase/admin'
import type { LineItem } from '@/agents/types'
import type { Json } from '@/lib/supabase/types'

export interface GenerateQuoteParams {
  shopId: string
  customerId: string
  callId?: string
  lineItems: LineItem[]
  subtotal: number
  tax: number
  total: number
}

export async function saveQuote(params: GenerateQuoteParams): Promise<string> {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('quotes')
    .insert({
      shop_id: params.shopId,
      customer_id: params.customerId,
      call_id: params.callId ?? null,
      line_items: params.lineItems as unknown as Json,
      subtotal: params.subtotal,
      tax: params.tax,
      total: params.total,
      status: 'draft',
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(`Failed to save quote: ${error?.message}`)
  }

  return data.id
}
