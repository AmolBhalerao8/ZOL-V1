import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CustomerDetail } from '@/components/customers/CustomerDetail'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: customer } = await supabase
    .from('customers').select('*').eq('id', id).maybeSingle()
  if (!customer) notFound()

  const [callsRes, quotesRes] = await Promise.all([
    supabase.from('calls').select('*').eq('customer_id', id).order('created_at', { ascending: false }).limit(10),
    supabase.from('quotes').select('*').eq('customer_id', id).order('created_at', { ascending: false }).limit(10),
  ])

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/customers"><ArrowLeft className="h-4 w-4" /> Back</Link>
        </Button>
      </div>

      <CustomerDetail customer={customer} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Call History</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {!callsRes.data?.length && <p className="text-sm text-gray-400">No calls</p>}
            {callsRes.data?.map((call) => (
              <Link key={call.id} href={`/calls/${call.id}`} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50">
                <span className="text-sm text-gray-600 font-mono">{call.vapi_call_id?.slice(0, 12) ?? call.id.slice(0, 12)}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={call.status === 'completed' ? 'success' : 'secondary'}>{call.status}</Badge>
                  <span className="text-xs text-gray-400">{formatDate(call.created_at)}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Quote History</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {!quotesRes.data?.length && <p className="text-sm text-gray-400">No quotes</p>}
            {quotesRes.data?.map((quote) => (
              <Link key={quote.id} href={`/quotes/${quote.id}`} className="flex items-center justify-between rounded-lg border border-gray-100 p-3 hover:bg-gray-50">
                <span className="text-sm font-bold text-gray-900">{formatCurrency(quote.total)}</span>
                <div className="flex items-center gap-2">
                  <Badge variant={quote.status === 'accepted' ? 'success' : quote.status === 'rejected' ? 'destructive' : 'secondary'}>{quote.status}</Badge>
                  <span className="text-xs text-gray-400">{formatDate(quote.created_at)}</span>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
