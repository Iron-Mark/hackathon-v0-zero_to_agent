import { NextResponse } from 'next/server'
import { getReport, saveReport } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const id = body.id
    const feedback = body.feedback

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid report ID' }, { status: 400 })
    }

    if (feedback !== 'helpful' && feedback !== 'incorrect') {
      return NextResponse.json({ error: 'Feedback must be either helpful or incorrect' }, { status: 400 })
    }

    const report = await getReport(id)
    
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Update the report with the user's feedback
    report.userFeedback = feedback

    // Persist to Upstash / Local FS
    await saveReport(report)

    return NextResponse.json({ success: true, message: 'Feedback recorded successfully' })
  } catch (error) {
    console.error('Failed to save feedback:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
