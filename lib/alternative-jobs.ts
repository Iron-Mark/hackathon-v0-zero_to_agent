import type { AlternativeJob, EvidenceItem } from '@/lib/schemas'

function extractTrustLabel(snippet: string) {
  return snippet.match(/^Trust:\s*([^|]+)\|/i)?.[1]?.trim()
}

function stripTrustPrefix(snippet: string) {
  return snippet.replace(/^Trust:\s*[^|]+\|\s*/i, '')
}

function extractField(snippet: string, label: string) {
  return snippet.match(new RegExp(`${label}:\\s*([^|]+)`, 'i'))?.[1]?.trim()
}

export function buildVerifiedAlternativeJobs(evidence: EvidenceItem[]): AlternativeJob[] {
  return evidence
    .filter(item => item.type === 'Comparable Jobs' && typeof item.url === 'string' && /^https?:\/\//i.test(item.url))
    .slice(0, 3)
    .map(item => {
      const snippet = String(item.snippet || '')
      const normalized = stripTrustPrefix(snippet)
      const [titleAndCompany = '', ...metadataParts] = normalized.split('|')
      const metadata = metadataParts.join('|')
      const [title = 'Comparable role', company = item.source || 'Job Board'] = titleAndCompany.trim().split(' at ')
      const salary = extractField(metadata, 'Salary')
      const location = extractField(metadata, 'Location')

      return {
        title: title.trim(),
        company: company.trim(),
        salary: salary || 'Not specified',
        location,
        url: item.url,
        source: item.source,
        verifiedSource: extractTrustLabel(snippet) || item.source,
      }
    })
}
