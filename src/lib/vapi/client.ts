/**
 * Vapi REST API wrapper.
 * Uses org-level VAPI_API_KEY from env.
 * Per-shop Vapi IDs are stored in the shops table.
 */

import type { VapiPhoneNumberResponse, VapiAssistantResponse } from './types'

const BASE_URL = 'https://api.vapi.ai'

function getApiKey(): string {
  const key = process.env.VAPI_API_KEY
  if (!key) throw new Error('VAPI_API_KEY is not set')
  return key
}

async function vapiRequest<T>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Vapi API error ${res.status} on ${method} ${path}: ${text}`)
  }

  return res.json() as Promise<T>
}

export async function purchasePhoneNumber(params: {
  areaCode?: string
  country?: string
}): Promise<VapiPhoneNumberResponse> {
  return vapiRequest<VapiPhoneNumberResponse>('POST', '/phone-number', {
    provider: 'vapi',
    numberDesiredAreaCode: params.areaCode ?? '415',
    fallbackDestination: { type: 'number', number: '' },
  })
}

export async function createAssistant(params: {
  name: string
  systemPrompt: string
}): Promise<VapiAssistantResponse> {
  return vapiRequest<VapiAssistantResponse>('POST', '/assistant', {
    name: params.name,
    model: {
      provider: 'openai',
      model: 'gpt-4o',
      systemPrompt: params.systemPrompt,
    },
    voice: {
      provider: '11labs',
      voiceId: 'rachel',
    },
    firstMessage: 'Thank you for calling. How can I help you today?',
    endCallFunctionEnabled: true,
  })
}

export async function linkAssistantToPhoneNumber(
  phoneNumberId: string,
  assistantId: string,
  serverUrl: string
): Promise<VapiPhoneNumberResponse> {
  return vapiRequest<VapiPhoneNumberResponse>('PATCH', `/phone-number/${phoneNumberId}`, {
    assistantId,
    serverUrl,
  })
}

export async function deletePhoneNumber(phoneNumberId: string): Promise<void> {
  await vapiRequest<unknown>('DELETE', `/phone-number/${phoneNumberId}`)
}

export async function deleteAssistant(assistantId: string): Promise<void> {
  await vapiRequest<unknown>('DELETE', `/assistant/${assistantId}`)
}
