import { NextRequest, NextResponse } from 'next/server'
import { verifyVapiSignature } from '@/lib/vapi/webhook-verify'
import { identifyShopByPhoneNumberId } from '@/features/calls/identify-shop'
import { createAdminClient } from '@/lib/supabase/admin'
import { enqueueAgentJob } from '@/lib/cloud-tasks/enqueue'
import type { VapiWebhookPayload } from '@/lib/vapi/types'
import type { Json } from '@/lib/supabase/types'

export async function POST(req: NextRequest) {
  const rawBody = await req.text()
  const signature = req.headers.get('x-vapi-signature')

  if (!verifyVapiSignature(rawBody, signature)) {
    console.error('[vapi/webhook] Invalid signature')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let payload: VapiWebhookPayload
  try {
    payload = JSON.parse(rawBody) as VapiWebhookPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  console.log(JSON.stringify({
    level: 'info',
    message: 'Vapi webhook received',
    type: payload.type,
    callId: payload.call?.id,
    phoneNumberId: payload.phoneNumberId,
  }))

  const shop = await identifyShopByPhoneNumberId(payload.phoneNumberId)
  if (!shop) {
    console.warn('[vapi/webhook] Unknown phoneNumberId:', payload.phoneNumberId)
    return NextResponse.json({ ok: true })
  }

  const admin = createAdminClient()

  switch (payload.type) {
    case 'call-started': {
      await admin.from('calls').upsert({
        shop_id: shop.id,
        vapi_call_id: payload.call.id,
        direction: 'inbound',
        status: 'active',
        started_at: payload.call.startedAt ?? new Date().toISOString(),
        raw_payload: payload as unknown as Json,
      }, { onConflict: 'vapi_call_id' })
      break
    }

    case 'transcript': {
      // Append transcript update
      const newTranscript = payload.transcript ?? payload.artifact?.transcript ?? ''
      if (newTranscript) {
        await admin
          .from('calls')
          .update({ transcript: newTranscript })
          .eq('vapi_call_id', payload.call.id)
      }
      break
    }

    case 'call-ended':
    case 'end-of-call-report': {
      const finalTranscript =
        payload.transcript ??
        payload.artifact?.transcript ??
        payload.messages?.map((m) => `${m.role}: ${m.message}`).join('\n') ??
        null

      // Update call record
      const { data: callRecord } = await admin
        .from('calls')
        .update({
          status: 'completed',
          transcript: finalTranscript,
          ended_at: payload.call.endedAt ?? new Date().toISOString(),
          raw_payload: payload as unknown as Json,
        })
        .eq('vapi_call_id', payload.call.id)
        .select('id')
        .maybeSingle()

      // Enqueue agent job (non-blocking)
      if (callRecord?.id) {
        try {
          await enqueueAgentJob({
            shopId: shop.id,
            callId: callRecord.id,
            triggerType: 'call_ended',
          })
          console.log(JSON.stringify({
            level: 'info',
            message: 'Agent job enqueued',
            shopId: shop.id,
            callId: callRecord.id,
          }))
        } catch (err) {
          console.error('[vapi/webhook] Failed to enqueue agent job:', err)
          // Non-fatal — call is still recorded
        }
      }
      break
    }
  }

  return NextResponse.json({ ok: true })
}
