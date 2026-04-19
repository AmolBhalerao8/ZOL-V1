import { describe, it, expect } from 'vitest'
import { normalizeToE164 } from '@/lib/vapi/phone-e164'

describe('normalizeToE164', () => {
  it('passes through +1 US', () => {
    expect(normalizeToE164('+14155552671')).toBe('+14155552671')
  })
  it('adds +1 for 10-digit US', () => {
    expect(normalizeToE164('4155552671')).toBe('+14155552671')
  })
  it('strips formatting', () => {
    expect(normalizeToE164('(415) 555-2671')).toBe('+14155552671')
  })
  it('returns null for empty', () => {
    expect(normalizeToE164('')).toBeNull()
  })
})
