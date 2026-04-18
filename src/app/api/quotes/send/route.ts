import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendQuoteById } from '@/features/quotes/send-quote'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { quoteId } = await req.json() as { quoteId?: string }
  if (!quoteId) return NextResponse.json({ error: 'Missing quoteId' }, { status: 400 })

  // Verify ownership via shop
  const { data: quote } = await supabase
    .from('quotes').select('shop_id').eq('id', quoteId).maybeSingle()
  if (!quote) return NextResponse.json({ error: 'Quote not found' }, { status: 404 })

  try {
    await sendQuoteById(quoteId)
    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 })
  }
}
