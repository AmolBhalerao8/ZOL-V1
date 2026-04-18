import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency, statusColor } from '@/lib/utils'
import type { Call, Quote, AgentRun } from '@/lib/supabase/types'

interface RecentActivityProps {
  calls: Call[]
  quotes: Quote[]
  runs: AgentRun[]
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
    active: 'default',
    completed: 'success',
    done: 'success',
    failed: 'destructive',
    running: 'warning',
    sent: 'default',
    accepted: 'success',
    rejected: 'destructive',
    draft: 'secondary',
  }
  return <Badge variant={colors[status] ?? 'secondary'}>{status}</Badge>
}

export function RecentActivity({ calls, quotes, runs }: RecentActivityProps) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Calls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {calls.length === 0 && <p className="text-sm text-gray-500">No calls yet</p>}
          {calls.map((call) => (
            <Link key={call.id} href={`/calls/${call.id}`} className="block rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900 truncate">
                  {call.vapi_call_id ?? call.id.slice(0, 8)}
                </span>
                <StatusBadge status={call.status} />
              </div>
              <p className="mt-1 text-xs text-gray-500">{formatDate(call.created_at)}</p>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Quotes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {quotes.length === 0 && <p className="text-sm text-gray-500">No quotes yet</p>}
          {quotes.map((quote) => (
            <Link key={quote.id} href={`/quotes/${quote.id}`} className="block rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">{formatCurrency(quote.total)}</span>
                <StatusBadge status={quote.status} />
              </div>
              <p className="mt-1 text-xs text-gray-500">{formatDate(quote.created_at)}</p>
            </Link>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Agent Runs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {runs.length === 0 && <p className="text-sm text-gray-500">No runs yet</p>}
          {runs.map((run) => (
            <Link key={run.id} href={`/runs/${run.id}`} className="block rounded-lg border border-gray-100 p-3 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">{run.trigger_type}</span>
                <StatusBadge status={run.status} />
              </div>
              <p className="mt-1 text-xs text-gray-500">{formatDate(run.started_at)}</p>
            </Link>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
