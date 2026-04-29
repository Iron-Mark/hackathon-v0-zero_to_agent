import type { Metadata } from 'next'
import { ExploreClient } from './explore-client'

export const metadata: Metadata = {
  title: 'Audit Database | Explore Recruitment Scam Patterns',
  description: 'Search recent HireProof reports and review job-post risk patterns, red flags, and evidence-backed verdicts.',
}

export default function ExplorePage() {
  return <ExploreClient />
}
