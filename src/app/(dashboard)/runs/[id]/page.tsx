import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { RunTraceViewer } from '@/components/runs/RunTraceViewer'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { AgentStepRecord } from '@/agents/types'

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: run } = await supabase
    .from('agent_runs').select('*').eq('id', id).maybeSingle()
  if (!run) notFound()

  const steps = (run.steps as unknown as AgentStepRecord[]) ?? []

  const statusVariants: Record<string, 'default' | 'success' | 'destructive' | 'warning'> = {
    running: 'warning', done: 'success', failed: 'destructive',
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost" size="sm">
          <Link href="/runs"><ArrowLeft className="h-4 w-4" /> Back</Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 capitalize">
              {run.trigger_type.replace('_', ' ')} Run
            </h1>
            <Badge variant={statusVariants[run.status] ?? 'secondary'}>{run.status}</Badge>
          </div>
          <p className="text-sm text-gray-500 mt-1">{formatDate(run.started_at)}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RunTraceViewer steps={steps} status={run.status} error={run.error} />
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-sm">Input</CardTitle></CardHeader>
            <CardContent>
              <pre className="text-xs text-gray-700 bg-gray-50 rounded p-3 overflow-x-auto max-h-60">
                {JSON.stringify(run.input, null, 2)}
              </pre>
            </CardContent>
          </Card>
          {run.result && (
            <Card>
              <CardHeader><CardTitle className="text-sm">Result</CardTitle></CardHeader>
              <CardContent>
                <pre className="text-xs text-gray-700 bg-gray-50 rounded p-3 overflow-x-auto max-h-60">
                  {JSON.stringify(run.result, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
