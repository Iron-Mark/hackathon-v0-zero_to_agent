function normalized(value) {
  return String(value || '').trim().toLowerCase()
}

function claim(report, key) {
  return normalized(report?.extractedClaims?.[key])
}

export function isDemoFixtureReport(report) {
  if (!report || typeof report !== 'object') return true
  if (normalized(report.mode) === 'demo') return true
  if (normalized(report.credentialMode) === 'demo') return true
  if (normalized(report.source) === 'demo') return true

  return Array.isArray(report.evidence)
    ? report.evidence.some((item) => normalized(item?.source).startsWith('demo fixture:'))
    : false
}

export function isPublicIntelligenceReport(report) {
  return Boolean(report) && report.publiclyListed !== false && !isDemoFixtureReport(report)
}

export function filterPublicIntelligenceReports(reports) {
  return Array.isArray(reports) ? reports.filter(isPublicIntelligenceReport) : []
}

function publicTrendSignature(report) {
  return [
    normalized(report?.verdict),
    claim(report, 'company'),
    claim(report, 'role'),
    claim(report, 'salary'),
    claim(report, 'location'),
    claim(report, 'contactMethod'),
    claim(report, 'applicationPath'),
  ].join('|')
}

export function uniquePublicTrendReports(reports) {
  const seen = new Set()
  const unique = []

  for (const report of filterPublicIntelligenceReports(reports)) {
    const signature = publicTrendSignature(report)
    if (seen.has(signature)) continue
    seen.add(signature)
    unique.push(report)
  }

  return unique
}

function increment(bucket, label) {
  const key = String(label || 'Unknown').trim() || 'Unknown'
  bucket[key] = (bucket[key] || 0) + 1
}

function topEntries(items) {
  return Object.entries(items)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([label, count]) => ({ label, count }))
}

export function buildPublicReportTrends(reports) {
  const publicReports = uniquePublicTrendReports(reports)
  const verdicts = { safe: 0, caution: 0, 'high-risk': 0 }
  const locations = {}
  const roles = {}
  const contactMethods = {}

  for (const report of publicReports) {
    if (Object.prototype.hasOwnProperty.call(verdicts, report.verdict)) {
      verdicts[report.verdict] += 1
    }
    increment(locations, report.extractedClaims?.location)
    increment(roles, report.extractedClaims?.role)
    increment(contactMethods, report.extractedClaims?.contactMethod)
  }

  return {
    totalReports: publicReports.length,
    verdicts,
    topLocations: topEntries(locations),
    topRoles: topEntries(roles),
    topContactMethods: topEntries(contactMethods),
    recentReports: publicReports.slice(0, 10),
  }
}
