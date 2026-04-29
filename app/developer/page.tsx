import type { Metadata } from 'next'
import { DeveloperClient } from './developer-client'

export const metadata: Metadata = {
  title: 'Developer Portal | HireProof Forensic SDK & API',
  description: 'Build agentic recruitment verification into your platform. Manage API keys, webhook integrations, and local inference infrastructure.',
}

export default function DeveloperPage() {
  return <DeveloperClient />
}
