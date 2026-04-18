import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TranscriptViewer } from '@/components/calls/TranscriptViewer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'
import { ArrowLeft, Clock } from 'lucide-react'

export default async function CallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: call } = await supabase
    .from('calls').select('*').eq('id', id).maybeSingle()

  if (!call) notFound()

  const { data: extraction } = await supabase
    .from('call_extractions').select('*').eq('call_id', id).maybeSingle()

  const statusVariants: Record<string, 'default' | 'success' | 'destructive' | 'warning'> = {
    active: 'warning', completed: 'success', failed: 'destructive',
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/calls"><ArrowLeft className="h-4 w-4" /> Back</Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 font-mono">{call.vapi_call_id ?? id}</h1>
            <Badge variant={statusVariants[call.status] ?? 'secondary'}>{call.status}</Badge>
          </div>
          <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
            <Clock className="h-3 w-3" />
            <span>{formatDate(call.started_at ?? call.created_at)}</span>
            {call.ended_at && <span>→ {formatDate(call.ended_at)}</span>}
          </div>
        </div>
      </div>

      <TranscriptViewer transcript={call.transcript} extraction={extraction} />
    </div>
  )
}
