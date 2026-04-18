import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { StatsBar } from '@/components/dashboard/StatsBar'
import { RecentActivity } from '@/components/dashboard/RecentActivity'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shop } = await supabase
    .from('shops')
    .select('id')
    .eq('owner_user_id', user.id)
    .maybeSingle()

  if (!shop) redirect('/create-shop')

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [callsTodayRes, quotesWeekRes, customersRes, recentCallsRes, recentQuotesRes, recentRunsRes] =
    await Promise.all([
      supabase.from('calls').select('id', { count: 'exact', head: true }).eq('shop_id', shop.id).gte('created_at', todayStart),
      supabase.from('quotes').select('id, total', { count: 'exact' }).eq('shop_id', shop.id).eq('status', 'sent').gte('created_at', weekStart),
      supabase.from('customers').select('id', { count: 'exact', head: true }).eq('shop_id', shop.id),
      supabase.from('calls').select('*').eq('shop_id', shop.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('quotes').select('*').eq('shop_id', shop.id).order('created_at', { ascending: false }).limit(5),
      supabase.from('agent_runs').select('*').eq('shop_id', shop.id).order('started_at', { ascending: false }).limit(5),
    ])

  const estimatedRevenue = quotesWeekRes.data?.reduce((s, q) => s + (q.total ?? 0), 0) ?? 0

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Welcome back — here&apos;s what&apos;s happening</p>
      </div>

      <StatsBar
        callsToday={callsTodayRes.count ?? 0}
        quotesSentThisWeek={quotesWeekRes.count ?? 0}
        totalCustomers={customersRes.count ?? 0}
        estimatedRevenue={estimatedRevenue}
      />

      <RecentActivity
        calls={recentCallsRes.data ?? []}
        quotes={recentQuotesRes.data ?? []}
        runs={recentRunsRes.data ?? []}
      />
    </div>
  )
}
