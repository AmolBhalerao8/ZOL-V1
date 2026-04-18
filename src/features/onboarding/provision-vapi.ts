'use server'

import { provisionShop } from '@/lib/vapi/provisioning'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function provisionVapiAction(formData: FormData) {
  const shopId = formData.get('shopId') as string
  if (!shopId) return { error: 'Missing shop ID' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  try {
    const result = await provisionShop(shopId)
    return { success: true, phoneNumber: result.phoneNumber }
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Failed to provision phone number',
    }
  }
}
