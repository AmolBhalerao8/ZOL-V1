/**
 * Verifies Vapi webhook HMAC-SHA256 signature.
 * Vapi signs the raw request body with VAPI_WEBHOOK_SECRET.
 */

import { createHmac, timingSafeEqual } from 'crypto'

export function verifyVapiSignature(
  rawBody: string,
  signatureHeader: string | null
): boolean {
  const secret = process.env.VAPI_WEBHOOK_SECRET
  if (!secret) {
    console.warn('[vapi/webhook-verify] VAPI_WEBHOOK_SECRET is not set — skipping verification')
    return true // Allow in dev when secret not configured
  }

  if (!signatureHeader) {
    return false
  }

  const expected = createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('hex')

  const expectedBuf = Buffer.from(`sha256=${expected}`, 'utf8')
  const actualBuf = Buffer.from(signatureHeader, 'utf8')

  if (expectedBuf.length !== actualBuf.length) {
    return false
  }

  return timingSafeEqual(expectedBuf, actualBuf)
}
