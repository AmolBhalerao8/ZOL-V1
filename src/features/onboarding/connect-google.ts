'use server'

import { getAuthorizationUrl } from '@/lib/google/oauth'
import { redirect } from 'next/navigation'

export async function connectGoogleAction(_prevState: unknown, formData: FormData) {
  const shopId = formData.get('shopId') as string
  if (!shopId) return { error: 'Missing shop ID' }

  let url: string
  try {
    url = getAuthorizationUrl(shopId)
  } catch (err) {
    return {
      error: err instanceof Error ? err.message : 'Failed to generate Google OAuth URL',
    }
  }

  redirect(url)
}
