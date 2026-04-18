import { Phone, FileText, Users, DollarSign } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface StatsBarProps {
  callsToday: number
  quotesSentThisWeek: number
  totalCustomers: number
  estimatedRevenue: number
}

export function StatsBar({ callsToday, quotesSentThisWeek, totalCustomers, estimatedRevenue }: StatsBarProps) {
  const stats = [
    { label: 'Calls Today', value: callsToday, icon: Phone, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Quotes This Week', value: quotesSentThisWeek, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Customers', value: totalCustomers, icon: Users, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Est. Revenue', value: formatCurrency(estimatedRevenue), icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="flex items-center gap-4 p-6">
            <div className={`rounded-xl p-3 ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
