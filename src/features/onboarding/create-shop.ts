'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import type { BusinessHours, PricingConfig, Json } from '@/lib/supabase/types'

const CreateShopSchema = z.object({
  name: z.string().min(2, 'Shop name must be at least 2 characters'),
  humanRedirectNumber: z.string().optional(),
  laborRate: z.coerce.number().min(0).default(120),
  partsMarkup: z.coerce.number().min(0).max(1).default(0.3),
  taxRate: z.coerce.number().min(0).max(0.5).default(0.0875),
})

export async function createShopAction(_prevState: unknown, formData: FormData) {
  const raw = {
    name: formData.get('name'),
    humanRedirectNumber: formData.get('humanRedirectNumber') || undefined,
    laborRate: formData.get('laborRate'),
    partsMarkup: formData.get('partsMarkup'),
    taxRate: formData.get('taxRate'),
  }

  const parsed = CreateShopSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid input' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const pricingConfig: PricingConfig = {
    labor_rate: parsed.data.laborRate,
    parts_markup: parsed.data.partsMarkup,
    tax_rate: parsed.data.taxRate,
    common_services: [],
  }

  const defaultBusinessHours: BusinessHours = {
    mon: { open: '08:00', close: '17:00' },
    tue: { open: '08:00', close: '17:00' },
    wed: { open: '08:00', close: '17:00' },
    thu: { open: '08:00', close: '17:00' },
    fri: { open: '08:00', close: '17:00' },
  }

  const { data, error } = await supabase
    .from('shops')
    .insert({
      name: parsed.data.name,
      owner_user_id: user.id,
      human_redirect_number: parsed.data.humanRedirectNumber ?? null,
      pricing_config: pricingConfig as unknown as Json,
      business_hours: defaultBusinessHours as unknown as Json,
      onboarding_status: 'pending',
    })
    .select()
    .single()

  if (error) return { error: error.message }

  redirect(`/connect-google?shopId=${data.id}`)
}
