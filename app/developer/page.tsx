import type { Metadata } from 'next'
import { DeveloperClient } from './developer-client'

export const metadata: Metadata = {
  title: 'Developer Portal | HireProof SDK & API',
  description: 'Build job-post verification into your product or agent workflow. Manage API keys, webhook integrations, and local inference settings.',
}

export default function DeveloperPage() {
  return <DeveloperClient />
}
