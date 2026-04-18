import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { scheduleFollowup } from '@/features/followups/schedule-followup'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as {
    shopId?: string
    customerId?: string
    customerName?: string
    customerEmail?: string
    scheduledAt?: string
    type?: 'call' | 'email' | 'service_reminder'
    notes?: string
  }

  if (!body.shopId || !body.customerId || !body.scheduledAt || !body.type) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Verify ownership
  const { data: shop } = await supabase
    .from('shops').select('id').eq('id', body.shopId).eq('owner_user_id', user.id).maybeSingle()
  if (!shop) return NextResponse.json({ error: 'Shop not found' }, { status: 404 })

  try {
    const followupId = await scheduleFollowup({
      shopId: body.shopId,
      customerId: body.customerId,
      customerName: body.customerName ?? '',
      customerEmail: body.customerEmail,
      scheduledAt: body.scheduledAt,
      type: body.type,
      notes: body.notes,
    })
    return NextResponse.json({ followupId })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
