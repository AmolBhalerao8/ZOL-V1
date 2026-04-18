/**
 * Enqueues agent jobs to GCP Cloud Tasks.
 * The worker (Cloud Run) receives these tasks at WORKER_URL.
 *
 * @google-cloud/tasks is listed in next.config serverExternalPackages so that
 * Turbopack treats it as a native Node.js external and does not attempt to
 * bundle gRPC's dynamic requires.
 */

import { CloudTasksClient } from '@google-cloud/tasks'

export interface AgentJobPayload {
  shopId: string
  callId: string
  triggerType: 'call_ended' | 'manual' | 'scheduled'
}

let _client: CloudTasksClient | null = null

function getClient(): CloudTasksClient {
  if (!_client) {
    const serviceAccountJson = process.env.GCP_SERVICE_ACCOUNT_JSON
    if (serviceAccountJson) {
      const credentials = JSON.parse(serviceAccountJson) as Record<string, string>
      _client = new CloudTasksClient({ credentials })
    } else {
      _client = new CloudTasksClient()
    }
  }
  return _client
}

export async function enqueueAgentJob(payload: AgentJobPayload): Promise<string> {
  const projectId = process.env.GCP_PROJECT_ID
  const region = process.env.GCP_REGION ?? 'us-central1'
  const queueName = process.env.CLOUD_TASKS_QUEUE_NAME ?? 'zol-agent-queue'
  const workerUrl = process.env.WORKER_URL

  if (!projectId || !workerUrl) {
    throw new Error(
      'Missing GCP config. Set GCP_PROJECT_ID and WORKER_URL env vars.'
    )
  }

  const client = getClient()
  const parent = client.queuePath(projectId, region, queueName)

  const task = {
    httpRequest: {
      httpMethod: 'POST' as const,
      url: `${workerUrl}/handle`,
      headers: { 'Content-Type': 'application/json' },
      body: Buffer.from(JSON.stringify(payload)).toString('base64'),
    },
    scheduleTime: {
      seconds: Math.floor(Date.now() / 1000) + 2,
    },
  }

  const [response] = await client.createTask({ parent, task })
  return response.name ?? ''
}
