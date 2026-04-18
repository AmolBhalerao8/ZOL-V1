import { createAdminClient } from '@/lib/supabase/admin'
import type { Customer } from '@/lib/supabase/types'

export interface UpsertParams {
  shopId: string
  name?: string
  phone?: string
  email?: string
  vehicleMake?: string
  vehicleModel?: string
  vehicleYear?: number
  plate?: string
}

export async function upsertCustomer(params: UpsertParams): Promise<Customer> {
  const admin = createAdminClient()

  // Deduplicate by phone or email
  let existing: Customer | null = null

  if (params.phone) {
    const { data } = await admin
      .from('customers')
      .select('*')
      .eq('shop_id', params.shopId)
      .eq('phone', params.phone)
      .maybeSingle()
    existing = data
  }

  if (!existing && params.email) {
    const { data } = await admin
      .from('customers')
      .select('*')
      .eq('shop_id', params.shopId)
      .eq('email', params.email)
      .maybeSingle()
    existing = data
  }

  if (existing) {
    const { data, error } = await admin
      .from('customers')
      .update({
        name: params.name ?? existing.name,
        email: params.email ?? existing.email,
        vehicle_make: params.vehicleMake ?? existing.vehicle_make,
        vehicle_model: params.vehicleModel ?? existing.vehicle_model,
        vehicle_year: params.vehicleYear ?? existing.vehicle_year,
        plate: params.plate ?? existing.plate,
      })
      .eq('id', existing.id)
      .select('*')
      .single()

    if (error || !data) throw new Error(`Update failed: ${error?.message}`)
    return data
  }

  const { data, error } = await admin
    .from('customers')
    .insert({
      shop_id: params.shopId,
      name: params.name ?? null,
      phone: params.phone ?? null,
      email: params.email ?? null,
      vehicle_make: params.vehicleMake ?? null,
      vehicle_model: params.vehicleModel ?? null,
      vehicle_year: params.vehicleYear ?? null,
      plate: params.plate ?? null,
    })
    .select('*')
    .single()

  if (error || !data) throw new Error(`Insert failed: ${error?.message}`)
  return data
}
