import { NextResponse } from 'next/server'
import { getReport, saveReport } from '@/lib/db'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const id = body.id
    const feedback = body.feedback
    const reason = body.reason
    const note = typeof body.note === 'string' ? body.note.trim().slice(0, 500) : undefined
    const validReasons = new Set([
      'false_positive',
      'missed_risk',
      'stale_evidence',
      'salary_wrong',
      'company_match_wrong',
      'recruiter_match_wrong',
      'other',
    ])

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid report ID' }, { status: 400 })
    }

    if (feedback !== 'helpful' && feedback !== 'incorrect') {
      return NextResponse.json({ error: 'Feedback must be either helpful or incorrect' }, { status: 400 })
    }
    if (reason !== undefined && (!validReasons.has(reason) || typeof reason !== 'string')) {
      return NextResponse.json({ error: 'Invalid feedback reason' }, { status: 400 })
    }

    const report = await getReport(id)
    
    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 })
    }

    // Update the report with the user's feedback
    report.userFeedback = feedback
    if (reason) report.userFeedbackReason = reason
    if (note) report.userFeedbackNote = note

    // Persist to Upstash / Local FS
    await saveReport(report)

    return NextResponse.json({ success: true, message: 'Feedback recorded successfully' })
  } catch (error) {
    console.error('Failed to save feedback:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
