import type { Metadata } from 'next'
import { ExploreClient } from './explore-client'

export const metadata: Metadata = {
  title: 'Global Audit Database | Explore Recruitment Signals',
  description: 'Search and explore the latest forensic reports from our global investigator network. Stay informed about the latest recruitment scam patterns.',
}

export default function ExplorePage() {
  return <ExploreClient />
}
