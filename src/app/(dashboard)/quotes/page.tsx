import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { QuoteCard } from '@/components/quotes/QuoteCard'
import { FileText } from 'lucide-react'

export default async function QuotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shop } = await supabase
    .from('shops').select('id').eq('owner_user_id', user.id).maybeSingle()
  if (!shop) redirect('/create-shop')

  const { data: quotes } = await supabase
    .from('quotes')
    .select('*, customers(name)')
    .eq('shop_id', shop.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3">
        <FileText className="h-6 w-6 text-purple-600" />
        <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
        <span className="text-sm text-gray-500">({quotes?.length ?? 0})</span>
      </div>

      {!quotes?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-24">
          <FileText className="h-12 w-12 text-gray-300" />
          <p className="mt-4 text-lg font-medium text-gray-400">No quotes yet</p>
          <p className="text-sm text-gray-400">Quotes are generated automatically after every call</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {quotes.map((quote) => (
            <QuoteCard key={quote.id} quote={quote as Parameters<typeof QuoteCard>[0]['quote']} />
          ))}
        </div>
      )}
    </div>
  )
}
