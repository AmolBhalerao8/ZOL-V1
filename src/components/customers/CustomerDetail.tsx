import { Car, Mail, Phone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'
import type { Customer } from '@/lib/supabase/types'

interface CustomerDetailProps {
  customer: Customer
}

export function CustomerDetail({ customer }: CustomerDetailProps) {
  const vehicle = [customer.vehicle_year, customer.vehicle_make, customer.vehicle_model]
    .filter(Boolean)
    .join(' ')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{customer.name ?? 'Unknown Customer'}</CardTitle>
        <p className="text-sm text-gray-500">Customer since {formatDate(customer.created_at)}</p>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4">
          {customer.phone && (
            <div className="flex items-start gap-2">
              <Phone className="mt-0.5 h-4 w-4 text-gray-400" />
              <div>
                <dt className="text-xs text-gray-500">Phone</dt>
                <dd className="text-sm font-medium">{customer.phone}</dd>
              </div>
            </div>
          )}
          {customer.email && (
            <div className="flex items-start gap-2">
              <Mail className="mt-0.5 h-4 w-4 text-gray-400" />
              <div>
                <dt className="text-xs text-gray-500">Email</dt>
                <dd className="text-sm font-medium">{customer.email}</dd>
              </div>
            </div>
          )}
          {vehicle && (
            <div className="col-span-2 flex items-start gap-2">
              <Car className="mt-0.5 h-4 w-4 text-gray-400" />
              <div>
                <dt className="text-xs text-gray-500">Vehicle</dt>
                <dd className="text-sm font-medium">
                  {vehicle}
                  {customer.plate && <span className="ml-2 text-gray-500">({customer.plate})</span>}
                </dd>
              </div>
            </div>
          )}
          {customer.notes && (
            <div className="col-span-2">
              <dt className="text-xs text-gray-500 mb-1">Notes</dt>
              <dd className="text-sm text-gray-700 whitespace-pre-wrap">{customer.notes}</dd>
            </div>
          )}
        </dl>
      </CardContent>
    </Card>
  )
}
