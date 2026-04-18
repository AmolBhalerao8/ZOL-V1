import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { provisionShop } from '@/lib/vapi/provisioning'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { shopId } = await req.json() as { shopId?: string }
  if (!shopId) {
    return NextResponse.json({ error: 'Missing shopId' }, { status: 400 })
  }

  // Verify ownership
  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('id', shopId)
    .eq('owner_user_id', user.id)
    .maybeSingle()

  if (!shop) {
    return NextResponse.json({ error: 'Shop not found' }, { status: 404 })
  }

  try {
    const result = await provisionShop(shopId)
    return NextResponse.json(result)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Provisioning failed'
    console.error('[onboarding/provision]', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
