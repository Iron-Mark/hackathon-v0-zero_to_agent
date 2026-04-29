import type { Metadata } from 'next'
import { LabClient } from './lab-client'

export const metadata: Metadata = {
  title: 'Verification Lab | Job Post Signal Review',
  description: 'Step inside the Glass Box. Monitor how HireProof reviews recruitment data and highlights suspicious job-post signals.',
}

export default function LabPage() {
  return <LabClient />
}
