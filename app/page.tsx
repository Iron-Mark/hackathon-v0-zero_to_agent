import type { Metadata } from 'next'
import { HomeClient } from './home-client'

export const metadata: Metadata = {
  title: 'HireProof | The Human Filter for Job Scams',
  description: 'The last line of defense against automated recruitment scams. Filter out the "Dead Internet" and verify job posts with live evidence.',
  openGraph: {
    title: 'HireProof - Verify Job Posts Before Applying',
    description: 'Know if it\'s legit before you apply. HireProof checks the claims and returns a verdict with receipts.',
    url: 'https://hireproof.vercel.app',
    siteName: 'HireProof',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HireProof - Forensic Job Verification',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
}

export default function HomePage() {
  return <HomeClient />
}
