import { createAdminClient } from '@/lib/supabase/admin'
import { createCalendarEvent } from '@/lib/google/calendar-client'

export interface ScheduleFollowupParams {
  shopId: string
  customerId: string
  customerName: string
  customerEmail?: string
  scheduledAt: string
  type: 'call' | 'email' | 'service_reminder'
  notes?: string
}

export async function scheduleFollowup(params: ScheduleFollowupParams): Promise<string> {
  const admin = createAdminClient()

  let calendarEventId: string | null = null

  // Try calendar — non-fatal if it fails
  try {
    const endTime = new Date(
      new Date(params.scheduledAt).getTime() + 30 * 60 * 1000
    ).toISOString()

    calendarEventId = await createCalendarEvent(params.shopId, {
      summary: `Follow-up: ${params.customerName}`,
      description: params.notes,
      startTime: params.scheduledAt,
      endTime,
      attendeeEmail: params.customerEmail,
    })
  } catch (err) {
    console.warn('[schedule-followup] Calendar error:', err)
  }

  const { data, error } = await admin
    .from('followups')
    .insert({
      shop_id: params.shopId,
      customer_id: params.customerId,
      scheduled_at: params.scheduledAt,
      type: params.type,
      notes: params.notes ?? null,
      status: 'pending',
      calendar_event_id: calendarEventId,
    })
    .select('id')
    .single()

  if (error || !data) throw new Error(`Failed to schedule followup: ${error?.message}`)
  return data.id
}
