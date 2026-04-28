import { getReport } from '@/lib/db'
import ResultScreen from '@/components/result-screen'
import { SiteHeader } from '@/components/site-header'
import { redirect } from 'next/navigation'
import { ErrorBoundary } from '@/components/error-boundary'

export const runtime = 'nodejs'

export default async function AuditPermalinkPage({ params }: { params: { id: string } }) {
  // Input validation: ensure ID only contains valid characters to guard against path traversal or injections
  const safeId = typeof params.id === 'string' ? params.id.trim() : ''
  if (!safeId || !/^report_[a-zA-Z0-9_-]+$/.test(safeId) || safeId.length > 100) {
    redirect('/audit')
  }

  const report = await getReport(safeId)

  if (!report) {
    redirect('/audit')
  }

  return (
    <div className="bg-background min-h-screen">
      <SiteHeader />
      <div className="mt-6 mb-2 mx-auto max-w-4xl px-4 flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 rounded-md bg-muted/10 px-2.5 py-1 text-xs font-semibold text-muted">
          Archived Report • {new Date(report.timestamp || Date.now()).toLocaleDateString()}
        </span>
      </div>
      <ErrorBoundary fallbackMessage="Failed to render the archived report.">
        <ResultScreen 
          result={report} 
          isDemo={report.mode !== 'live'} 
        />
      </ErrorBoundary>
    </div>
  )
}
