/**
 * Outreach agent — processes pending follow-ups and sends reminders.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { runOrchestrator } from './orchestrator'
import { bookFollowupTool } from './tools/book-followup'
import type { ShopContext, OrchestratorResult } from './types'
import type { BusinessHours, PricingConfig, Customer } from '@/lib/supabase/types'
import { decrypt } from '@/lib/crypto/encrypt'

export async function runOutreachAgent(
  shopId: string,
  customerId: string,
  followupType: 'call' | 'email' | 'service_reminder',
  scheduledAt: string
): Promise<OrchestratorResult> {
  const admin = createAdminClient()

  const [shopRes, customersRes, customerRes] = await Promise.all([
    admin.from('shops').select('*').eq('id', shopId).single(),
    admin.from('customers').select('*').eq('shop_id', shopId).limit(50),
    admin.from('customers').select('*').eq('id', customerId).single(),
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
      shop_id: shopId,
      trigger_type: 'scheduled',
      trigger_ref_id: customerId,
      input: { shopId, customerId, followupType, scheduledAt },
      status: 'running',
    })
    .select('id')
    .single()

  if (runErr || !runRecord) throw new Error('Failed to create agent run')

  return runOrchestrator({
    runId: runRecord.id,
    ctx,
    input: {
      shopId,
      customerId,
      customerName: customerRes.data?.name ?? '',
      customerEmail: customerRes.data?.email ?? undefined,
      scheduledAt,
      type: followupType,
      notes: `Scheduled ${followupType} follow-up`,
    },
    tools: [bookFollowupTool],
  })
}
