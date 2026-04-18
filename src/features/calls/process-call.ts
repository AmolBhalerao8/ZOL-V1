/**
 * Entry point for processing a completed call.
 * Called by the Cloud Run worker after receiving a Cloud Tasks job.
 */

import { createAdminClient } from '@/lib/supabase/admin'
import { runIntakeAgent } from '@/agents/intake-agent'

export async function processCall(shopId: string, callId: string): Promise<void> {
  const admin = createAdminClient()

  // Mark call as being processed
  await admin
    .from('calls')
    .update({ status: 'completed' })
    .eq('id', callId)

  // Run the full intake agent pipeline
  const result = await runIntakeAgent(shopId, callId)

  console.log(JSON.stringify({
    level: 'info',
    message: 'Call processing complete',
    shopId,
    callId,
    agentStatus: result.status,
    steps: result.steps.length,
  }))

  if (result.status === 'failed') {
    await admin
      .from('calls')
      .update({ status: 'failed' })
      .eq('id', callId)
  }
}
