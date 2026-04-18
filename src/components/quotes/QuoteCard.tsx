import Link from 'next/link'
import { FileText, Send } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Quote } from '@/lib/supabase/types'

interface QuoteCardProps {
  quote: Quote & { customers?: { name?: string | null } | null }
}

const statusVariants: Record<string, 'default' | 'success' | 'destructive' | 'secondary' | 'warning'> = {
  draft: 'secondary',
  sent: 'default',
  accepted: 'success',
  rejected: 'destructive',
}

export function QuoteCard({ quote }: QuoteCardProps) {
  return (
    <Link href={`/quotes/${quote.id}`}>
      <Card className="hover:border-blue-300 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-purple-50 p-2">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {quote.customers?.name ?? 'Unknown customer'}
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(quote.total)}
                </p>
              </div>
            </div>
            <Badge variant={statusVariants[quote.status] ?? 'secondary'}>{quote.status}</Badge>
          </div>
          {quote.sent_at && (
            <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
              <Send className="h-3 w-3" />
              <span>Sent {formatDate(quote.sent_at)}</span>
            </div>
          )}
          {!quote.sent_at && (
            <p className="mt-3 text-xs text-gray-400">{formatDate(quote.created_at)}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
