import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CallCard } from '@/components/calls/CallCard'
import { Phone } from 'lucide-react'

export default async function CallsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shop } = await supabase
    .from('shops').select('id').eq('owner_user_id', user.id).maybeSingle()
  if (!shop) redirect('/create-shop')

  const { data: calls } = await supabase
    .from('calls')
    .select('*')
    .eq('shop_id', shop.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Phone className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Calls</h1>
        <span className="text-sm text-gray-500">({calls?.length ?? 0})</span>
      </div>

      {!calls?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-24">
          <Phone className="h-12 w-12 text-gray-300" />
          <p className="mt-4 text-lg font-medium text-gray-400">No calls yet</p>
          <p className="text-sm text-gray-400">Calls will appear here after your phone line is provisioned</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {calls.map((call) => <CallCard key={call.id} call={call} />)}
        </div>
      )}
    </div>
  )
}
