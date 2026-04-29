import type { Metadata } from 'next'
import { TrendsClient } from './trends-client'

export const metadata: Metadata = {
  title: 'Global Threat Trends | Live Recruitment Phishing Intelligence',
  description: 'Monitor real-time analysis of the most prevalent recruitment scam patterns and malicious automation vectors in the global job market.',
}

export default function TrendsPage() {
  return <TrendsClient />
}
