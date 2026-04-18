import Link from 'next/link'
import { Phone, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { Call } from '@/lib/supabase/types'

interface CallCardProps {
  call: Call
}

const statusVariants: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
  active: 'warning',
  completed: 'success',
  failed: 'destructive',
}

export function CallCard({ call }: CallCardProps) {
  return (
    <Link href={`/calls/${call.id}`}>
      <Card className="hover:border-blue-300 transition-colors cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-blue-50 p-2">
                <Phone className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 font-mono">
                  {call.vapi_call_id?.slice(0, 12) ?? call.id.slice(0, 12)}…
                </p>
                <p className="text-xs text-gray-500 capitalize">{call.direction}</p>
              </div>
            </div>
            <Badge variant={statusVariants[call.status] ?? 'secondary'}>{call.status}</Badge>
          </div>
          <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
            <Clock className="h-3 w-3" />
            <span>{formatDate(call.created_at)}</span>
          </div>
          {call.transcript && (
            <p className="mt-2 text-xs text-gray-500 line-clamp-2">{call.transcript}</p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
