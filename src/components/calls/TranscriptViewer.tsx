import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CallExtraction } from '@/lib/supabase/types'
import type { CarDetails } from '@/lib/supabase/types'

interface TranscriptViewerProps {
  transcript: string | null
  extraction?: CallExtraction | null
}

const severityVariants: Record<string, 'default' | 'warning' | 'destructive'> = {
  low: 'default',
  medium: 'warning',
  high: 'destructive',
}

export function TranscriptViewer({ transcript, extraction }: TranscriptViewerProps) {
  const carDetails = extraction?.car_details as CarDetails | null

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          {transcript ? (
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed max-h-[600px] overflow-y-auto">
              {transcript}
            </pre>
          ) : (
            <p className="text-sm text-gray-400">No transcript available</p>
          )}
        </CardContent>
      </Card>

      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-base">Extracted Details</CardTitle>
        </CardHeader>
        <CardContent>
          {extraction ? (
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Customer</dt>
                <dd className="mt-1 text-sm text-gray-900">{extraction.person_name ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Phone</dt>
                <dd className="mt-1 text-sm text-gray-900">{extraction.person_phone ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{extraction.person_email ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vehicle</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {[carDetails?.year, carDetails?.make, carDetails?.model].filter(Boolean).join(' ') || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Issue</dt>
                <dd className="mt-1 text-sm text-gray-700">{extraction.issue_description ?? '—'}</dd>
              </div>
              {extraction.estimated_severity && (
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Severity</dt>
                  <dd className="mt-1">
                    <Badge variant={severityVariants[extraction.estimated_severity] ?? 'default'}>
                      {extraction.estimated_severity}
                    </Badge>
                  </dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="text-sm text-gray-400">No extraction data yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
