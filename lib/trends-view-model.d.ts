export function buildTrendsViewModel(stats?: any): {
  modeLabel: string
  headline: string
  deck: string
  verdictMixLabel: string
  qualityLabel: string
  qualityTone: string
  sampleWarning: string
  sampleQuality: string
  trendReadyReports: string
  rawTotalReports: string
  statCards: Array<{ id: string; label: string; value: string }>
  vectorSections: Array<{
    title: string
    items: Array<{ label: string; count: number; percent: number }>
  }>
  recentHighRisk: Array<{
    id: string
    company: string
    role: string
    summary: string
    riskScore: number
  }>
  externalSignalCount: number
}
