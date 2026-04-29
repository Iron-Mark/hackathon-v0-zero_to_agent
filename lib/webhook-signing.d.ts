export function buildHireProofWebhookHeaders(
  payload: string,
  secret: string,
  event?: string,
  userAgent?: string,
): Record<string, string>
