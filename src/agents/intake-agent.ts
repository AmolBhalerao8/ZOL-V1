/**
 * Intake agent — orchestrates tools for call intake processing.
 * Flow: extract_call_details → upsert_customer → calculate_quote → send_quote_email → book_followup
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { runOrchestrator } from './orchestrator'
import { extractCallDetailsTool } from './tools/extract-call-details'
import { calculateQuoteTool } from './tools/calculate-quote'
import { upsertCustomerTool } from './tools/upsert-customer'
import { sendQuoteEmailTool } from './tools/send-quote-email'
import { bookFollowupTool } from './tools/book-followup'
import type { ShopContext, OrchestratorResult } from './types'
import type { BusinessHours, PricingConfig, Customer } from '@/lib/supabase/types'
import { decrypt } from '@/lib/crypto/encrypt'

async function buildShopContext(shopId: string, callId: string): Promise<ShopContext> {
  const admin = createAdminClient()

  const [shopRes, customersRes, callRes] = await Promise.all([
    admin.from('shops').select('*').eq('id', shopId).single(),
    admin.from('customers').select('*').eq('shop_id', shopId).order('created_at', { ascending: false }).limit(50),
    admin.from('calls').select('*').eq('id', callId).single(),
  ])

  if (shopRes.error || !shopRes.data) throw new Error(`Shop ${shopId} not found`)

  const shop = shopRes.data
  let googleTokens: { accessToken?: string; refreshToken?: string } = {}

  if (shop.google_refresh_token_encrypted) {
    try {
      const refreshToken = decrypt(shop.google_refresh_token_encrypted)
      googleTokens = { refreshToken }
    } catch {
      // Encryption key may not be configured yet
    }
  }

  return {
    shopId: shop.id,
    shopName: shop.name,
    pricingConfig: (shop.pricing_config as PricingConfig) ?? {},
    businessHours: (shop.business_hours as BusinessHours) ?? {},
    recentCustomers: (customersRes.data ?? []) as Customer[],
    currentCall: callRes.data
      ? {
          id: callRes.data.id,
          vapi_call_id: callRes.data.vapi_call_id,
          transcript: callRes.data.transcript,
          started_at: callRes.data.started_at,
          ended_at: callRes.data.ended_at,
          status: callRes.data.status,
        }
      : undefined,
    googleTokens,
  }
}

export async function runIntakeAgent(
  shopId: string,
  callId: string
): Promise<OrchestratorResult> {
  const admin = createAdminClient()

  // Create the agent_run record
  const { data: runRecord, error: runErr } = await admin
    .from('agent_runs')
    .insert({
      shop_id: shopId,
      trigger_type: 'call_ended',
      trigger_ref_id: callId,
      input: { shopId, callId },
      status: 'running',
    })
    .select('id')
    .single()

  if (runErr || !runRecord) {
    throw new Error(`Failed to create agent run: ${runErr?.message}`)
  }

  const ctx = await buildShopContext(shopId, callId)

  return runOrchestrator({
    runId: runRecord.id,
    ctx,
    input: {
      shopId,
      callId,
      transcript: ctx.currentCall?.transcript ?? '',
      shopName: ctx.shopName,
    },
    tools: [
      extractCallDetailsTool,
      upsertCustomerTool,
      calculateQuoteTool,
      sendQuoteEmailTool,
      bookFollowupTool,
    ],
  })
}
