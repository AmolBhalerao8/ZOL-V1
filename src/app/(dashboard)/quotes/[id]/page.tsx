import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LineItemsTable } from '@/components/quotes/LineItemsTable'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import { ArrowLeft } from 'lucide-react'
import type { LineItem } from '@/agents/types'

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: quote } = await supabase
    .from('quotes')
    .select('*, customers(name, email, phone)')
    .eq('id', id)
    .maybeSingle()

  if (!quote) notFound()

  const customer = quote.customers as { name?: string; email?: string; phone?: string } | null
  const lineItems = (quote.line_items ?? []) as unknown as LineItem[]

  const statusVariants: Record<string, 'default' | 'success' | 'destructive' | 'secondary'> = {
    draft: 'secondary', sent: 'default', accepted: 'success', rejected: 'destructive',
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/quotes"><ArrowLeft className="h-4 w-4" /> Back</Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">Quote</h1>
            <Badge variant={statusVariants[quote.status] ?? 'secondary'}>{quote.status}</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">Created {formatDate(quote.created_at)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>Line Items</CardTitle></CardHeader>
            <CardContent>
              <LineItemsTable
                lineItems={lineItems}
                subtotal={quote.subtotal}
                tax={quote.tax}
                total={quote.total}
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Customer</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-gray-500">Name</p>
              <p className="text-sm font-medium">{customer?.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Email</p>
              <p className="text-sm">{customer?.email ?? '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Phone</p>
              <p className="text-sm">{customer?.phone ?? '—'}</p>
            </div>
            {quote.sent_at && (
              <div>
                <p className="text-xs text-gray-500">Sent via</p>
                <p className="text-sm capitalize">{quote.sent_via ?? 'email'} • {formatDate(quote.sent_at)}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
