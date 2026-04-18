/**
 * Provisions Vapi resources for a shop:
 * 1. Buy a US phone number
 * 2. Create an assistant with shop-specific system prompt
 * 3. Link the assistant to the phone number
 * 4. Update the shops row with Vapi IDs
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { purchasePhoneNumber, createAssistant, linkAssistantToPhoneNumber } from './client'
import type { BusinessHours, PricingConfig } from '@/lib/supabase/types'

function buildSystemPrompt(params: {
  shopName: string
  businessHours: BusinessHours
  humanRedirectNumber: string
  pricingConfig: PricingConfig
}): string {
  const { shopName, humanRedirectNumber } = params

  return `You are the AI receptionist for ${shopName}, an auto mechanic shop.

Your job is to handle after-hours calls professionally and helpfully.

WHEN TO HANDLE THE CALL:
- Outside business hours: handle the call fully
- During business hours: politely redirect to ${humanRedirectNumber || 'our staff'}

WHAT TO COLLECT FROM EVERY CALLER:
1. Full name
2. Best callback phone number
3. Email address (for quote delivery)
4. Vehicle: year, make, model, license plate
5. Description of the issue or service needed
6. Urgency level

CONVERSATION STYLE:
- Warm, professional, and efficient
- Ask one question at a time
- Confirm details back to the caller
- Reassure them their information will be reviewed and someone will follow up

CLOSING:
Once you have all the information, thank the caller, confirm you'll pass the details to the team, and let them know they'll receive a quote via email. End the call politely.

IMPORTANT: Never make up prices, estimates, or availability. You are collecting information only.`
}

export async function provisionShop(shopId: string): Promise<{
  phoneNumber: string
  vapiPhoneNumberId: string
  vapiAssistantId: string
}> {
  const admin = createAdminClient()

  // 1. Fetch shop
  const { data: shop, error: shopErr } = await admin
    .from('shops')
    .select('*')
    .eq('id', shopId)
    .single()

  if (shopErr || !shop) {
    throw new Error(`Shop not found: ${shopId}`)
  }

  const systemPrompt = buildSystemPrompt({
    shopName: shop.name,
    businessHours: (shop.business_hours as BusinessHours) ?? {},
    humanRedirectNumber: shop.human_redirect_number ?? '',
    pricingConfig: (shop.pricing_config as PricingConfig) ?? {},
  })

  // 2. Buy phone number
  const phoneNumberRes = await purchasePhoneNumber({ areaCode: '415' })

  // 3. Create assistant
  const assistantRes = await createAssistant({
    name: `${shop.name} AI Receptionist`,
    systemPrompt,
  })

  // 4. Link assistant to phone number
  const webhookUrl = process.env.VAPI_WEBHOOK_URL ?? ''
  await linkAssistantToPhoneNumber(phoneNumberRes.id, assistantRes.id, webhookUrl)

  // 5. Update shop in DB
  const { error: updateErr } = await admin
    .from('shops')
    .update({
      vapi_phone_number_id: phoneNumberRes.id,
      vapi_assistant_id: assistantRes.id,
      phone_number: phoneNumberRes.number,
      onboarding_status: 'phone_provisioned',
    })
    .eq('id', shopId)

  if (updateErr) {
    throw new Error(`Failed to update shop after provisioning: ${updateErr.message}`)
  }

  return {
    phoneNumber: phoneNumberRes.number,
    vapiPhoneNumberId: phoneNumberRes.id,
    vapiAssistantId: assistantRes.id,
  }
}
