function formatCount(value) {
  return Number(value || 0).toLocaleString('en-US')
}

function percentOfTotal(count, total) {
  if (!total) return 0
  return Math.round((Number(count || 0) / total) * 100)
}

function normalizeEntries(items, total) {
  return Array.isArray(items)
    ? items.map((item) => ({
        label: String(item?.label || 'Unknown'),
        count: Number(item?.count || 0),
        percent: percentOfTotal(item?.count, total),
      }))
    : []
}

export function buildTrendsViewModel(stats = {}) {
  const totalReports = Number(stats.totalReports || 0)
  const verdicts = stats.verdicts || {}
  const safe = Number(verdicts.safe || 0)
  const caution = Number(verdicts.caution || 0)
  const highRisk = Number(verdicts['high-risk'] || 0)
  const externalSignalCount = Array.isArray(stats.externalSignals) ? stats.externalSignals.length : 0

  return {
    modeLabel: stats.mode === 'hybrid' ? 'Stored audits + live signals' : 'Stored audits',
    statCards: [
      { id: 'reports', label: 'Reports Reviewed', value: formatCount(totalReports) },
      { id: 'highRisk', label: 'High-Risk Reports', value: formatCount(highRisk) },
      { id: 'caution', label: 'Caution Reports', value: formatCount(caution) },
      { id: 'safe', label: 'Verified Safe', value: formatCount(safe) },
    ],
    vectorSections: [
      { title: 'Contact methods', items: normalizeEntries(stats.topContactMethods, totalReports) },
      { title: 'Roles checked', items: normalizeEntries(stats.topRoles, totalReports) },
      { title: 'Locations checked', items: normalizeEntries(stats.topLocations, totalReports) },
    ],
    recentHighRisk: Array.isArray(stats.recentReports)
      ? stats.recentReports
          .filter((report) => report?.verdict === 'high-risk')
          .slice(0, 5)
          .map((report) => ({
            id: report.id,
            company: report.extractedClaims?.company || 'Unknown company',
            role: report.extractedClaims?.role || 'Unknown role',
            summary: report.summary || 'High-risk report',
            riskScore: Number(report.riskScore || 0),
          }))
      : [],
    externalSignalCount,
  }
}
