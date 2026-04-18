import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date))
}

export function formatDateShort(date: string | null | undefined): string {
  if (!date) return '—'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`
}

export function statusColor(status: string): string {
  const map: Record<string, string> = {
    active: 'text-blue-600 bg-blue-50',
    completed: 'text-green-600 bg-green-50',
    failed: 'text-red-600 bg-red-50',
    running: 'text-yellow-600 bg-yellow-50',
    done: 'text-green-600 bg-green-50',
    draft: 'text-gray-600 bg-gray-100',
    sent: 'text-blue-600 bg-blue-50',
    accepted: 'text-green-600 bg-green-50',
    rejected: 'text-red-600 bg-red-50',
    pending: 'text-yellow-600 bg-yellow-50',
    success: 'text-green-600 bg-green-50',
    error: 'text-red-600 bg-red-50',
  }
  return map[status] ?? 'text-gray-600 bg-gray-100'
}
