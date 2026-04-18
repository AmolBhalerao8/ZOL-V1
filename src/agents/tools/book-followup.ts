import { createAdminClient } from '@/lib/supabase/admin'
import { createCalendarEvent } from '@/lib/google/calendar-client'
import type {
  Tool,
  BookFollowupInput,
  BookFollowupOutput,
  ShopContext,
  ToolResult,
} from '../types'

export const bookFollowupTool: Tool<BookFollowupInput, BookFollowupOutput> = {
  name: 'book_followup',
  description:
    'Create a follow-up record in the DB and optionally a Google Calendar event.',
  inputSchema: {
    type: 'object',
    properties: {
      shopId: { type: 'string' },
      customerId: { type: 'string' },
      customerName: { type: 'string' },
      customerEmail: { type: 'string' },
      scheduledAt: { type: 'string', description: 'ISO 8601 datetime' },
      type: { type: 'string', enum: ['call', 'email', 'service_reminder'] },
      notes: { type: 'string' },
    },
    required: ['shopId', 'customerId', 'customerName', 'scheduledAt', 'type'],
  },

  async execute(
    input: BookFollowupInput,
    ctx: ShopContext
  ): Promise<ToolResult<BookFollowupOutput>> {
    const admin = createAdminClient()

    let calendarEventId: string | null = null

    // Try to create calendar event (requires Google to be connected)
    if (ctx.googleTokens.refreshToken) {
      try {
        const startTime = input.scheduledAt
        const endTime = new Date(new Date(startTime).getTime() + 30 * 60 * 1000).toISOString()

        calendarEventId = await createCalendarEvent(input.shopId, {
          summary: `Follow-up: ${input.customerName}`,
          description: input.notes ?? `${input.type} follow-up with ${input.customerName}`,
          startTime,
          endTime,
          attendeeEmail: input.customerEmail,
        })
      } catch (err) {
        console.warn('[book_followup] Calendar event creation failed:', err)
        // Non-fatal — still create the DB record
      }
    }

    const { data: followup, error } = await admin
      .from('followups')
      .insert({
        shop_id: input.shopId,
        customer_id: input.customerId,
        scheduled_at: input.scheduledAt,
        type: input.type,
        notes: input.notes ?? null,
        status: 'pending',
        calendar_event_id: calendarEventId,
      })
      .select('id')
      .single()

    if (error || !followup) {
      return {
        status: 'error',
        output: { followupId: '', calendarEventId: null },
        error: error?.message ?? 'Failed to create followup',
      }
    }

    return {
      status: 'success',
      output: { followupId: followup.id, calendarEventId },
    }
  },
}
