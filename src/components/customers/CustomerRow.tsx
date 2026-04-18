import Link from 'next/link'
import { Car } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { Customer } from '@/lib/supabase/types'

interface CustomerRowProps {
  customer: Customer
  totalQuoted?: number
  lastContact?: string
}

export function CustomerRow({ customer, totalQuoted = 0, lastContact }: CustomerRowProps) {
  const vehicle = [customer.vehicle_year, customer.vehicle_make, customer.vehicle_model]
    .filter(Boolean)
    .join(' ')

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      <td className="px-4 py-3">
        <Link href={`/customers/${customer.id}`} className="font-medium text-blue-600 hover:underline">
          {customer.name ?? '—'}
        </Link>
        <p className="text-xs text-gray-500">{customer.phone ?? customer.email ?? '—'}</p>
      </td>
      <td className="px-4 py-3">
        {vehicle ? (
          <div className="flex items-center gap-2">
            <Car className="h-4 w-4 text-gray-400 shrink-0" />
            <span className="text-sm text-gray-700">{vehicle}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-500">{formatDate(lastContact ?? customer.created_at)}</td>
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatCurrency(totalQuoted)}</td>
    </tr>
  )
}
