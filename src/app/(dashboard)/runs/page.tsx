import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Activity } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { AgentRun } from '@/lib/supabase/types'
import type { AgentStepRecord } from '@/agents/types'

export default async function RunsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: shop } = await supabase
    .from('shops').select('id').eq('owner_user_id', user.id).maybeSingle()
  if (!shop) redirect('/create-shop')

  const { data: runs } = await supabase
    .from('agent_runs')
    .select('*')
    .eq('shop_id', shop.id)
    .order('started_at', { ascending: false })
    .limit(50)

  const statusVariants: Record<string, 'default' | 'success' | 'destructive' | 'warning' | 'secondary'> = {
    running: 'warning', done: 'success', failed: 'destructive',
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-3">
        <Activity className="h-6 w-6 text-orange-600" />
        <h1 className="text-2xl font-bold text-gray-900">Agent Runs</h1>
        <span className="text-sm text-gray-500">({runs?.length ?? 0})</span>
      </div>

      {!runs?.length ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-24">
          <Activity className="h-12 w-12 text-gray-300" />
          <p className="mt-4 text-lg font-medium text-gray-400">No agent runs yet</p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Trigger</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Steps</th>
                  <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Started</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {runs.map((run: AgentRun) => {
                  const steps = (run.steps as unknown as AgentStepRecord[]) ?? []
                  return (
                    <tr key={run.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <Link href={`/runs/${run.id}`} className="text-sm font-medium text-blue-600 hover:underline capitalize">
                          {run.trigger_type.replace('_', ' ')}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariants[run.status] ?? 'secondary'}>{run.status}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{steps.length} steps</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(run.started_at)}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
