/**
 * Quote agent — generates and sends a quote manually for a specific customer.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { runOrchestrator } from './orchestrator'
import { calculateQuoteTool } from './tools/calculate-quote'
import { sendQuoteEmailTool } from './tools/send-quote-email'
import type { ShopContext, OrchestratorResult } from './types'
import type { BusinessHours, PricingConfig, Customer } from '@/lib/supabase/types'
import { decrypt } from '@/lib/crypto/encrypt'

export async function runQuoteAgent(params: {
  shopId: string
  customerId: string
  issueDescription: string
  carMake?: string
  carModel?: string
  carYear?: number
}): Promise<OrchestratorResult> {
  const admin = createAdminClient()

  const [shopRes, customerRes, customersRes] = await Promise.all([
    admin.from('shops').select('*').eq('id', params.shopId).single(),
    admin.from('customers').select('*').eq('id', params.customerId).single(),
    admin.from('customers').select('*').eq('shop_id', params.shopId).limit(50),
  ])

  if (shopRes.error || !shopRes.data) throw new Error('Shop not found')
  const shop = shopRes.data

  let googleTokens: { accessToken?: string; refreshToken?: string } = {}
  if (shop.google_refresh_token_encrypted) {
    try {
      googleTokens = { refreshToken: decrypt(shop.google_refresh_token_encrypted) }
    } catch { /* not configured */ }
  }

  const ctx: ShopContext = {
    shopId: shop.id,
    shopName: shop.name,
    pricingConfig: (shop.pricing_config as PricingConfig) ?? {},
    businessHours: (shop.business_hours as BusinessHours) ?? {},
    recentCustomers: (customersRes.data ?? []) as Customer[],
    googleTokens,
  }

  const { data: runRecord, error: runErr } = await admin
    .from('agent_runs')
    .insert({
      shop_id: params.shopId,
      trigger_type: 'manual',
      trigger_ref_id: params.customerId,
      input: params,
      status: 'running',
    })
    .select('id')
    .single()

  if (runErr || !runRecord) throw new Error('Failed to create agent run')

  return runOrchestrator({
    runId: runRecord.id,
    ctx,
    input: {
      ...params,
      toEmail: customerRes.data?.email ?? '',
      customerName: customerRes.data?.name ?? '',
    },
    tools: [calculateQuoteTool, sendQuoteEmailTool],
  })
}
