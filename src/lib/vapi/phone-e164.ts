/**
 * Normalize phone input toward E.164 for Vapi fallbackDestination (requires +country code).
 */

export function normalizeToE164(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null
  const t = raw.trim()
  if (t.startsWith('+')) {
    const digits = t.slice(1).replace(/\D/g, '')
    if (digits.length < 10 || digits.length > 15) return null
    return `+${digits}`
  }
  const digits = t.replace(/\D/g, '')
  if (digits.length === 10) return `+1${digits}`
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`
  if (digits.length >= 10 && digits.length <= 15) return `+${digits}`
  return null
}
