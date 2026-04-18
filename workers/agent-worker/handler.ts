import { processCall } from '@/features/calls/process-call'

export interface WorkerPayload {
  shopId: string
  callId: string
  triggerType: 'call_ended' | 'manual' | 'scheduled'
}

export async function handleAgentJob(payload: WorkerPayload): Promise<void> {
  const { shopId, callId, triggerType } = payload

  console.log(JSON.stringify({
    level: 'info',
    message: 'Agent worker: received job',
    shopId,
    callId,
    triggerType,
  }))

  if (triggerType === 'call_ended' || triggerType === 'manual') {
    await processCall(shopId, callId)
  } else {
    console.warn(JSON.stringify({
      level: 'warn',
      message: 'Unhandled trigger type',
      triggerType,
    }))
  }

  console.log(JSON.stringify({
    level: 'info',
    message: 'Agent worker: job complete',
    shopId,
    callId,
  }))
}
