import type { BusinessHours, Customer, PricingConfig } from '@/lib/supabase/types'

// ─── Tool contract ────────────────────────────────────────────────────────────

export type ToolStatus = 'success' | 'error'

export interface ToolResult<O> {
  status: ToolStatus
  output: O
  error?: string
}

export interface Tool<I, O> {
  name: string
  description: string
  inputSchema: Record<string, unknown>  // JSON Schema
  execute(input: I, ctx: ShopContext): Promise<ToolResult<O>>
}

// ─── Shop context (injected into every agent run) ─────────────────────────────

export interface GoogleTokens {
  accessToken?: string
  refreshToken?: string
}

export interface CallWithTranscript {
  id: string
  vapi_call_id: string | null
  transcript: string | null
  started_at: string | null
  ended_at: string | null
  status: string
}

export interface ShopContext {
  shopId: string
  shopName: string
  pricingConfig: PricingConfig
  businessHours: BusinessHours
  recentCustomers: Customer[]    // last 50
  currentCall?: CallWithTranscript
  googleTokens: GoogleTokens
}

// ─── Orchestrator step record ─────────────────────────────────────────────────

export interface AgentStepRecord {
  step: number
  tool: string
  input: unknown
  output: unknown
  duration_ms: number
  status: ToolStatus
  error?: string
}

// ─── Orchestrator result ──────────────────────────────────────────────────────

export interface OrchestratorResult {
  status: 'done' | 'failed'
  steps: AgentStepRecord[]
  result: unknown
  error?: string
}

// ─── Specific tool I/O types ──────────────────────────────────────────────────

export interface ExtractCallDetailsInput {
  transcript: string
  shopName: string
}

export interface ExtractCallDetailsOutput {
  personName: string | null
  personPhone: string | null
  personEmail: string | null
  carMake: string | null
  carModel: string | null
  carYear: number | null
  carPlate: string | null
  issueDescription: string | null
  estimatedSeverity: 'low' | 'medium' | 'high' | null
}

export interface CalculateQuoteInput {
  issueDescription: string
  carMake?: string
  carModel?: string
  carYear?: number
}

export interface LineItem {
  description: string
  qty: number
  unit_price: number
}

export interface CalculateQuoteOutput {
  lineItems: LineItem[]
  subtotal: number
  tax: number
  total: number
  notes: string
}

export interface UpsertCustomerInput {
  shopId: string
  name?: string
  phone?: string
  email?: string
  vehicleMake?: string
  vehicleModel?: string
  vehicleYear?: number
  plate?: string
}

export interface UpsertCustomerOutput {
  customerId: string
  isNew: boolean
}

export interface SendQuoteEmailInput {
  shopId: string
  customerId: string
  quoteId: string
  toEmail: string
  customerName: string
  lineItems: LineItem[]
  subtotal: number
  tax: number
  total: number
  shopName: string
}

export interface SendQuoteEmailOutput {
  gmailMessageId: string
  sentAt: string
}

export interface BookFollowupInput {
  shopId: string
  customerId: string
  customerName: string
  customerEmail?: string
  scheduledAt: string  // ISO 8601
  type: 'call' | 'email' | 'service_reminder'
  notes?: string
}

export interface BookFollowupOutput {
  followupId: string
  calendarEventId: string | null
}
