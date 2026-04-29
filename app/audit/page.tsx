import type { Metadata } from 'next'
import { AuditClient } from './audit-client'

export const metadata: Metadata = {
  title: 'Forensic Job Audit | Verify Legitimacy with Receipts',
  description: 'Run a forensic scan on any job post. Our agentic engine extracts signals and cross-references them to identify recruitment scams and phishing attempts.',
}

export default function AuditPage() {
  return <AuditClient />
}
