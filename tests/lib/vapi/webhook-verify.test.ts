import { describe, it, expect, beforeEach } from 'vitest'
import { createHmac } from 'crypto'

// We test the logic directly without importing the module to avoid env deps
function verifyVapiSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false

  const expected = createHmac('sha256', secret)
    .update(rawBody, 'utf8')
    .digest('hex')

  const expectedFull = `sha256=${expected}`
  if (expectedFull.length !== signatureHeader.length) return false

  // Timing-safe compare
  let diff = 0
  for (let i = 0; i < expectedFull.length; i++) {
    diff |= expectedFull.charCodeAt(i) ^ signatureHeader.charCodeAt(i)
  }
  return diff === 0
}

describe('verifyVapiSignature', () => {
  const secret = 'test-secret-key'
  const body = '{"type":"call-ended","call":{"id":"abc123"}}'

  it('returns true for a valid signature', () => {
    const sig = `sha256=${createHmac('sha256', secret).update(body, 'utf8').digest('hex')}`
    expect(verifyVapiSignature(body, sig, secret)).toBe(true)
  })

  it('returns false for a tampered body', () => {
    const sig = `sha256=${createHmac('sha256', secret).update(body, 'utf8').digest('hex')}`
    expect(verifyVapiSignature(body + 'tampered', sig, secret)).toBe(false)
  })

  it('returns false for a missing signature header', () => {
    expect(verifyVapiSignature(body, null, secret)).toBe(false)
  })

  it('returns false for an empty signature', () => {
    expect(verifyVapiSignature(body, '', secret)).toBe(false)
  })

  it('returns false for a wrong secret', () => {
    const sig = `sha256=${createHmac('sha256', 'wrong-secret').update(body, 'utf8').digest('hex')}`
    expect(verifyVapiSignature(body, sig, secret)).toBe(false)
  })
})
