export function buildLegalAbuseReportMailto(report: {
  extractedClaims?: Record<string, string>
  redFlags?: string[]
}): string

export function buildTrendsJsonExport(stats: unknown, now?: Date): {
  filename: string
  mimeType: 'application/json'
  content: string
}

export function buildTrendsCsvExport(stats: unknown, now?: Date): {
  filename: string
  mimeType: 'text/csv'
  content: string
}

export function buildReportCsvExport(report: unknown, now?: Date): {
  filename: string
  mimeType: 'text/csv'
  content: string
}
