import { formatCurrency } from '@/lib/utils'
import type { LineItem } from '@/agents/types'

interface LineItemsTableProps {
  lineItems: LineItem[]
  subtotal: number
  tax: number
  total: number
}

export function LineItemsTable({ lineItems, subtotal, tax, total }: LineItemsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 text-left">
            <th className="pb-3 font-medium text-gray-500">Service</th>
            <th className="pb-3 font-medium text-gray-500 text-center">Qty</th>
            <th className="pb-3 font-medium text-gray-500 text-right">Unit Price</th>
            <th className="pb-3 font-medium text-gray-500 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {lineItems.map((item, i) => (
            <tr key={i}>
              <td className="py-3 text-gray-900">{item.description}</td>
              <td className="py-3 text-center text-gray-700">{item.qty}</td>
              <td className="py-3 text-right text-gray-700">{formatCurrency(item.unit_price)}</td>
              <td className="py-3 text-right font-medium text-gray-900">
                {formatCurrency(item.qty * item.unit_price)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="border-t border-gray-200">
          <tr>
            <td colSpan={3} className="pt-3 text-right text-gray-500">Subtotal</td>
            <td className="pt-3 text-right text-gray-900">{formatCurrency(subtotal)}</td>
          </tr>
          <tr>
            <td colSpan={3} className="py-1 text-right text-gray-500">Tax</td>
            <td className="py-1 text-right text-gray-900">{formatCurrency(tax)}</td>
          </tr>
          <tr className="font-bold">
            <td colSpan={3} className="pt-3 text-right text-gray-900">Total</td>
            <td className="pt-3 text-right text-gray-900 text-lg">{formatCurrency(total)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
