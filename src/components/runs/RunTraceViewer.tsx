import { CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDuration } from '@/lib/utils'
import type { AgentStepRecord } from '@/agents/types'

interface RunTraceViewerProps {
  steps: AgentStepRecord[]
  status: string
  error?: string | null
}

function StepIcon({ status }: { status: string }) {
  if (status === 'success') return <CheckCircle className="h-5 w-5 text-green-500" />
  if (status === 'error') return <XCircle className="h-5 w-5 text-red-500" />
  return <Clock className="h-5 w-5 text-yellow-500" />
}

export function RunTraceViewer({ steps, status, error }: RunTraceViewerProps) {
  return (
    <div className="space-y-4">
      {steps.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-8">No steps recorded yet</p>
      )}

      {steps.map((step, i) => (
        <Card key={i} className={step.status === 'error' ? 'border-red-200' : ''}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                {step.step}
              </div>
              <StepIcon status={step.status} />
              <div className="flex-1">
                <CardTitle className="text-sm font-mono">{step.tool}</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{formatDuration(step.duration_ms)}</span>
                <Badge variant={step.status === 'success' ? 'success' : 'destructive'}>
                  {step.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid gap-3 lg:grid-cols-2">
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Input</p>
                <pre className="text-xs text-gray-700 bg-gray-50 rounded-md p-3 overflow-x-auto max-h-40">
                  {JSON.stringify(step.input, null, 2)}
                </pre>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Output</p>
                <pre className="text-xs text-gray-700 bg-gray-50 rounded-md p-3 overflow-x-auto max-h-40">
                  {step.error
                    ? `ERROR: ${step.error}`
                    : JSON.stringify(step.output, null, 2)}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-red-700">Run failed</p>
            <p className="mt-1 text-sm text-red-600 font-mono">{error}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
