'use client'

import { useSearchParams } from 'next/navigation'
import { CheckCircle, AlertTriangle } from 'lucide-react'

export function GoogleStatusBanner() {
  const params = useSearchParams()
  const connected = params.get('google_connected')
  const error = params.get('google_error')

  if (connected) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800">
        <CheckCircle className="h-4 w-4 shrink-0" />
        Google account connected successfully. Gmail and Calendar are now active.
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        Google connection failed: {decodeURIComponent(error)}
      </div>
    )
  }

  return null
}
