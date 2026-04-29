import type { Metadata } from 'next'
import { LabClient } from './lab-client'

export const metadata: Metadata = {
  title: 'Forensic Laboratory | Agentic Signal Dissection',
  description: 'Step inside the Glass Box. Monitor our agentic engine as it dissects recruitment data and isolates malicious automation markers in real-time.',
}

export default function LabPage() {
  return <LabClient />
}
