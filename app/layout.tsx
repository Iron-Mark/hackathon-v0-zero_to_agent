import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ToastProvider } from '@/components/toast'

export const metadata: Metadata = {
  title: 'HireProof',
  description: 'Paste a job post. Know if it\'s legit before you apply. HireProof investigates opportunities with visible evidence to keep you safe.',
  keywords: ['job search', 'scam detector', 'hireproof', 'job verification', 'recruitment fraud'],
  authors: [{ name: 'HireProof Team' }],
  icons: {
    icon: '/icon.svg',
  },
  openGraph: {
    title: 'HireProof - Job Verification',
    description: 'Paste a job post. Know if it\'s legit before you apply. HireProof checks the claims and returns a verdict with receipts.',
    url: 'https://hireproof.vercel.app',
    siteName: 'HireProof',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'HireProof - Verify job posts before applying',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HireProof - Job Verification',
    description: 'Know if it\'s legit before you apply.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <ToastProvider>
            <main className="min-h-screen">
              {children}
            </main>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
