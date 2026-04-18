// Vapi webhook payload types
// https://docs.vapi.ai/api-reference/webhooks

export type VapiEventType =
  | 'call-started'
  | 'call-ended'
  | 'transcript'
  | 'function-call'
  | 'hang'
  | 'speech-update'
  | 'status-update'
  | 'end-of-call-report'

export interface VapiPhoneNumber {
  id: string
  number: string
  assistantId?: string
  serverUrl?: string
}

export interface VapiAssistant {
  id: string
  name: string
  model?: {
    provider: string
    model: string
    systemPrompt: string
  }
}

export interface VapiCall {
  id: string
  phoneNumberId: string
  assistantId?: string
  status: string
  startedAt?: string
  endedAt?: string
}

export interface VapiTranscriptMessage {
  role: 'assistant' | 'user'
  message: string
  time?: number
}

export interface VapiWebhookPayload {
  type: VapiEventType
  call: VapiCall
  phoneNumberId: string
  transcript?: string
  messages?: VapiTranscriptMessage[]
  endedReason?: string
  summary?: string
  recordingUrl?: string
  stereoRecordingUrl?: string
  artifact?: {
    transcript?: string
    messages?: VapiTranscriptMessage[]
    recordingUrl?: string
  }
}

// Vapi REST API response types
export interface VapiPhoneNumberResponse {
  id: string
  number: string
  assistantId?: string | null
  serverUrl?: string | null
  createdAt: string
  updatedAt: string
}

export interface VapiAssistantResponse {
  id: string
  name: string
  createdAt: string
  updatedAt: string
}
