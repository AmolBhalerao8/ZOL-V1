import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function RootPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check if user has a shop
  const { data: shop } = await supabase
    .from('shops')
    .select('id, onboarding_status')
    .eq('owner_user_id', user.id)
    .maybeSingle()

  if (!shop) redirect('/create-shop')

  if (shop.onboarding_status === 'pending') redirect('/create-shop')
  if (shop.onboarding_status === 'google_connected') redirect('/provision-phone')

  redirect('/dashboard')
}
