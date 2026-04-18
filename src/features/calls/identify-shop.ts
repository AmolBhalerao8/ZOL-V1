/**
 * Identifies which shop a Vapi webhook belongs to
 * by looking up vapi_phone_number_id in the shops table.
 * Uses admin client — this runs in webhook route (unauthenticated).
 */

import { createAdminClient } from '@/lib/supabase/admin'
import type { Shop } from '@/lib/supabase/types'

export async function identifyShopByPhoneNumberId(
  vapiPhoneNumberId: string
): Promise<Shop | null> {
  const admin = createAdminClient()

  const { data, error } = await admin
    .from('shops')
    .select('*')
    .eq('vapi_phone_number_id', vapiPhoneNumberId)
    .maybeSingle()

  if (error) {
    console.error('[identify-shop] DB error:', error)
    return null
  }

  return data
}
