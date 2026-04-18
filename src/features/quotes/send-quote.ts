import { createAdminClient } from '@/lib/supabase/admin'
import { sendEmail } from '@/lib/google/gmail-client'

export async function sendQuoteById(quoteId: string): Promise<void> {
  const admin = createAdminClient()

  const { data: quote, error } = await admin
    .from('quotes')
    .select('*, customers(*), shops(name, google_email)')
    .eq('id', quoteId)
    .single()

  if (error || !quote) throw new Error(`Quote ${quoteId} not found`)

  const customer = quote.customers as { email?: string; name?: string } | null
  const shop = quote.shops as { name?: string } | null

  if (!customer?.email) throw new Error('Customer has no email address')

  const lineItems = (quote.line_items as Array<{ description: string; qty: number; unit_price: number }>) ?? []

  const rows = lineItems.map(li =>
    `<tr><td>${li.description}</td><td>${li.qty}</td><td>$${li.unit_price.toFixed(2)}</td></tr>`
  ).join('')

  const bodyHtml = `<h2>Quote from ${shop?.name ?? 'Your Mechanic'}</h2>
<table border="1" cellpadding="8"><tr><th>Service</th><th>Qty</th><th>Price</th></tr>${rows}</table>
<p><strong>Total: $${quote.total.toFixed(2)}</strong></p>`

  const gmailMessageId = await sendEmail(quote.shop_id, {
    to: customer.email,
    subject: `Your Repair Quote — $${quote.total.toFixed(2)}`,
    bodyHtml,
    fromName: shop?.name,
  })

  await admin.from('quotes').update({
    status: 'sent',
    sent_via: 'email',
    gmail_message_id: gmailMessageId,
    sent_at: new Date().toISOString(),
  }).eq('id', quoteId)
}
