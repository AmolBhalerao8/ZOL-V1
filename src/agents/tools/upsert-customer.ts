import { createAdminClient } from '@/lib/supabase/admin'
import type {
  Tool,
  UpsertCustomerInput,
  UpsertCustomerOutput,
  ShopContext,
  ToolResult,
} from '../types'

export const upsertCustomerTool: Tool<UpsertCustomerInput, UpsertCustomerOutput> = {
  name: 'upsert_customer',
  description:
    'Find an existing customer by phone or email, or create a new one. Returns the customer ID.',
  inputSchema: {
    type: 'object',
    properties: {
      shopId: { type: 'string' },
      name: { type: 'string' },
      phone: { type: 'string' },
      email: { type: 'string' },
      vehicleMake: { type: 'string' },
      vehicleModel: { type: 'string' },
      vehicleYear: { type: 'number' },
      plate: { type: 'string' },
    },
    required: ['shopId'],
  },

  async execute(
    input: UpsertCustomerInput,
    _ctx: ShopContext
  ): Promise<ToolResult<UpsertCustomerOutput>> {
    const admin = createAdminClient()

    // Try to find existing customer by phone or email
    let existingId: string | null = null

    if (input.phone) {
      const { data } = await admin
        .from('customers')
        .select('id')
        .eq('shop_id', input.shopId)
        .eq('phone', input.phone)
        .maybeSingle()
      existingId = (data as { id: string } | null)?.id ?? null
    }

    if (!existingId && input.email) {
      const { data } = await admin
        .from('customers')
        .select('id')
        .eq('shop_id', input.shopId)
        .eq('email', input.email)
        .maybeSingle()
      existingId = (data as { id: string } | null)?.id ?? null
    }

    if (existingId) {
      // Update with any new info
      const updatePayload: Record<string, unknown> = {}
      if (input.name) updatePayload.name = input.name
      if (input.email) updatePayload.email = input.email
      if (input.vehicleMake) updatePayload.vehicle_make = input.vehicleMake
      if (input.vehicleModel) updatePayload.vehicle_model = input.vehicleModel
      if (input.vehicleYear) updatePayload.vehicle_year = input.vehicleYear
      if (input.plate) updatePayload.plate = input.plate

      if (Object.keys(updatePayload).length > 0) {
        await admin.from('customers').update({
          name: input.name ?? undefined,
          email: input.email ?? undefined,
          vehicle_make: input.vehicleMake ?? undefined,
          vehicle_model: input.vehicleModel ?? undefined,
          vehicle_year: input.vehicleYear ?? undefined,
          plate: input.plate ?? undefined,
        }).eq('id', existingId)
      }

      return {
        status: 'success',
        output: { customerId: existingId, isNew: false },
      }
    }

    // Create new customer
    const { data: newCustomer, error } = await admin
      .from('customers')
      .insert({
        shop_id: input.shopId,
        name: input.name ?? null,
        phone: input.phone ?? null,
        email: input.email ?? null,
        vehicle_make: input.vehicleMake ?? null,
        vehicle_model: input.vehicleModel ?? null,
        vehicle_year: input.vehicleYear ?? null,
        plate: input.plate ?? null,
      })
      .select()
      .single()

    if (error || !newCustomer) {
      return {
        status: 'error',
        output: { customerId: '', isNew: false },
        error: error?.message ?? 'Failed to create customer',
      }
    }

    return {
      status: 'success',
      output: { customerId: newCustomer.id, isNew: true },
    }
  },
}
