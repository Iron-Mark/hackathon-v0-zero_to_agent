import type { Metadata } from 'next'
import { TrendsClient } from './trends-client'

export const metadata: Metadata = {
  title: 'Recruitment Scam Trends | HireProof',
  description: 'Review recurring recruitment scam patterns found in job-post checks and saved HireProof reports.',
}

export default function TrendsPage() {
  return <TrendsClient />
}
