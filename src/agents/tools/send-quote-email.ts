import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/google/gmail-client'
import type {
  Tool,
  SendQuoteEmailInput,
  SendQuoteEmailOutput,
  LineItem,
  ShopContext,
  ToolResult,
} from '../types'

function buildQuoteHtml(params: {
  customerName: string
  shopName: string
  lineItems: LineItem[]
  subtotal: number
  tax: number
  total: number
}): string {
  const { customerName, shopName, lineItems, subtotal, tax, total } = params

  const rows = lineItems
    .map(
      (li) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee">${li.description}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${li.qty}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${li.unit_price.toFixed(2)}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">$${(li.qty * li.unit_price).toFixed(2)}</td>
        </tr>`
    )
    .join('')

  return `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;color:#1a1a1a;max-width:600px;margin:0 auto;padding:24px">
  <h1 style="color:#2563eb">${shopName}</h1>
  <h2 style="font-weight:normal">Repair Quote</h2>
  <p>Hi ${customerName || 'there'},</p>
  <p>Thank you for calling ${shopName}. Here's your repair quote based on your vehicle's issue:</p>
  <table style="width:100%;border-collapse:collapse;margin:24px 0">
    <thead>
      <tr style="background:#f3f4f6">
        <th style="padding:8px;text-align:left">Service</th>
        <th style="padding:8px;text-align:center">Qty</th>
        <th style="padding:8px;text-align:right">Unit Price</th>
        <th style="padding:8px;text-align:right">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
    <tfoot>
      <tr><td colspan="3" style="padding:8px;text-align:right"><strong>Subtotal</strong></td><td style="padding:8px;text-align:right">$${subtotal.toFixed(2)}</td></tr>
      <tr><td colspan="3" style="padding:8px;text-align:right">Tax</td><td style="padding:8px;text-align:right">$${tax.toFixed(2)}</td></tr>
      <tr style="background:#f3f4f6"><td colspan="3" style="padding:8px;text-align:right"><strong>Total</strong></td><td style="padding:8px;text-align:right"><strong>$${total.toFixed(2)}</strong></td></tr>
    </tfoot>
  </table>
  <p style="color:#6b7280;font-size:14px">This is an estimate. Final pricing may vary based on parts availability and actual diagnosis. Please call us to schedule your appointment.</p>
  <p>— The ${shopName} Team</p>
</body>
</html>`
}

export const sendQuoteEmailTool: Tool<SendQuoteEmailInput, SendQuoteEmailOutput> = {
  name: 'send_quote_email',
  description: 'Send a formatted quote email to the customer via the shop\'s Gmail account.',
  inputSchema: {
    type: 'object',
    properties: {
      shopId: { type: 'string' },
      customerId: { type: 'string' },
      quoteId: { type: 'string' },
      toEmail: { type: 'string' },
      customerName: { type: 'string' },
      lineItems: { type: 'array' },
      subtotal: { type: 'number' },
      tax: { type: 'number' },
      total: { type: 'number' },
      shopName: { type: 'string' },
    },
    required: ['shopId', 'customerId', 'quoteId', 'toEmail', 'lineItems', 'subtotal', 'tax', 'total', 'shopName'],
  },

  async execute(
    input: SendQuoteEmailInput,
    _ctx: ShopContext
  ): Promise<ToolResult<SendQuoteEmailOutput>> {
    const admin = createAdminClient()

    const bodyHtml = buildQuoteHtml({
      customerName: input.customerName,
      shopName: input.shopName,
      lineItems: input.lineItems,
      subtotal: input.subtotal,
      tax: input.tax,
      total: input.total,
    })

    const gmailMessageId = await sendEmail(input.shopId, {
      to: input.toEmail,
      subject: `Your Repair Quote from ${input.shopName} — $${input.total.toFixed(2)}`,
      bodyHtml,
      fromName: input.shopName,
    })

    const sentAt = new Date().toISOString()

    await admin
      .from('quotes')
      .update({
        status: 'sent',
        sent_via: 'email',
        gmail_message_id: gmailMessageId,
        sent_at: sentAt,
      })
      .eq('id', input.quoteId)

    return {
      status: 'success',
      output: { gmailMessageId, sentAt },
    }
  },
}
