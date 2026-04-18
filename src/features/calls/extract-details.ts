/**
 * Extracts structured data from a completed call and writes to call_extractions table.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { extractCallDetailsTool } from '@/agents/tools/extract-call-details'
import type { ExtractCallDetailsOutput } from '@/agents/types'
import type { ShopContext } from '@/agents/types'

export async function extractAndStoreCallDetails(
  callId: string,
  ctx: ShopContext
): Promise<ExtractCallDetailsOutput | null> {
  if (!ctx.currentCall?.transcript) return null

  const result = await extractCallDetailsTool.execute(
    { transcript: ctx.currentCall.transcript, shopName: ctx.shopName },
    ctx
  )

  if (result.status !== 'success') return null

  const admin = createAdminClient()
  await admin.from('call_extractions').insert({
    call_id: callId,
    car_details: {
      make: result.output.carMake,
      model: result.output.carModel,
      year: result.output.carYear,
      plate: result.output.carPlate,
    },
    issue_description: result.output.issueDescription,
    estimated_severity: result.output.estimatedSeverity,
    person_name: result.output.personName,
    person_phone: result.output.personPhone,
    person_email: result.output.personEmail,
  })

  return result.output
}
