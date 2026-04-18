/**
 * Logs an interaction (call, quote, followup) as a note on the customer.
 * Appends to customer.notes for a lightweight CRM activity log.
 */

import { createAdminClient } from '@/lib/supabase/admin'

export async function logInteraction(
  customerId: string,
  type: string,
  detail: string
): Promise<void> {
  const admin = createAdminClient()

  const { data: customer } = await admin
    .from('customers')
    .select('notes')
    .eq('id', customerId)
    .single()

  const timestamp = new Date().toISOString()
  const entry = `[${timestamp}] ${type}: ${detail}`
  const newNotes = customer?.notes ? `${customer.notes}\n${entry}` : entry

  await admin
    .from('customers')
    .update({ notes: newNotes })
    .eq('id', customerId)
}
