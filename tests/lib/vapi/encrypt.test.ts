import { describe, it, expect, beforeEach } from 'vitest'
import { randomBytes } from 'crypto'

// Set test encryption key before importing the module
const testKey = randomBytes(32).toString('base64')
process.env.ENCRYPTION_KEY = testKey

// Dynamic import to pick up env var
const { encrypt, decrypt } = await import('@/lib/crypto/encrypt')

describe('encrypt / decrypt', () => {
  it('round-trips a string', () => {
    const original = 'my-super-secret-refresh-token'
    const ciphertext = encrypt(original)
    expect(ciphertext).not.toBe(original)
    expect(decrypt(ciphertext)).toBe(original)
  })

  it('produces different ciphertexts for the same plaintext (random IV)', () => {
    const text = 'hello world'
    const c1 = encrypt(text)
    const c2 = encrypt(text)
    expect(c1).not.toBe(c2)
    expect(decrypt(c1)).toBe(text)
    expect(decrypt(c2)).toBe(text)
  })

  it('throws on tampered ciphertext', () => {
    const ciphertext = encrypt('secret')
    const buf = Buffer.from(ciphertext, 'base64')
    buf[buf.length - 1] ^= 0xff  // flip last byte
    const tampered = buf.toString('base64')
    expect(() => decrypt(tampered)).toThrow()
  })
})
