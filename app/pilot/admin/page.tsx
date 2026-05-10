import type { Metadata } from 'next'
import { SiteHeader } from '@/components/layout/site-header'
import { PilotAdminClient } from './pilot-admin-client'

export const metadata: Metadata = {
  title: 'Pilot Admin | HireProof',
  description: 'Authenticated pilot request export and lightweight product analytics for HireProof.',
}

export default function PilotAdminPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <main className="mx-auto max-w-400 px-6 py-12 md:px-12 lg:px-20 lg:py-16 xl:px-32">
        <PilotAdminClient />
      </main>
    </div>
  )
}
