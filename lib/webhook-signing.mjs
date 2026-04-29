import { createHmac } from 'crypto'

export function buildHireProofWebhookHeaders(
  payload,
  secret,
  event = 'audit.completed',
  userAgent = 'HireProof-Webhook/1.0',
) {
  const signature = createHmac('sha256', secret).update(payload).digest('hex')

  return {
    'Content-Type': 'application/json',
    'User-Agent': userAgent,
    'X-HireProof-Event': event,
    'X-HireProof-Signature': `sha256=${signature}`,
  }
}
