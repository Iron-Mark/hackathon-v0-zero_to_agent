import { getReport } from '@/lib/db'
import ResultScreen from '@/components/result-screen'
import { SiteHeader } from '@/components/site-header'
import { redirect } from 'next/navigation'

export const runtime = 'nodejs'

export default async function AuditPermalinkPage({ params }: { params: { id: string } }) {
  const report = await getReport(params.id)

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
      <ResultScreen 
        result={report} 
        isDemo={report.mode !== 'live'} 
      />
    </div>
  )
}
