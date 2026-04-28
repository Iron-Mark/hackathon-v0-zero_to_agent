'use client'

import Link from 'next/link'
import { BrandMark } from '@/components/brand-mark'
import { useLiveMode } from '@/hooks/useLiveMode'
import { ToggleRight, ToggleLeft } from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'

export function SiteHeader() {
  const { isLiveMode, isLoaded, toggleLiveMode } = useLiveMode()

  return (
    <header className="sticky top-0 z-20 border-b border-border-soft bg-background/92 backdrop-blur-md print:hidden">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="hireproof-focus flex items-center gap-3 rounded-sm">
          <BrandMark className="h-9 w-9 shrink-0" />
          <div className="leading-tight">
            <div className="text-lg font-black tracking-normal">HireProof</div>
            <div className="hidden text-xs font-semibold text-muted sm:block">Job-post verification with receipts</div>
          </div>
        </Link>
        <nav className="flex items-center gap-1 rounded-full border border-border-soft bg-surface/75 p-1 text-sm font-semibold shadow-sm">
          <div className="hidden items-center gap-1 sm:flex">
            <Link href="/" className="hireproof-focus rounded-full px-3 py-2 text-muted hover:bg-background hover:text-foreground">
              Home
            </Link>
            <Link href="/audit" className="hireproof-focus rounded-full px-3 py-2 text-muted hover:bg-background hover:text-foreground">
              Audit
            </Link>
            <Link href="/history" className="hireproof-focus rounded-full px-3 py-2 text-muted hover:bg-background hover:text-foreground">
              History
            </Link>
          </div>
          <div className="flex items-center sm:border-l sm:border-border sm:pl-2">
            {isLoaded && (
              <button
                onClick={toggleLiveMode}
                className={`hireproof-focus flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black transition-colors ${
                  isLiveMode 
                    ? 'bg-safe/10 text-safe hover:bg-safe/20' 
                    : 'bg-muted/10 text-muted hover:bg-muted/20'
                }`}
                title={isLiveMode ? "Using live API data" : "Using demo fixture data"}
              >
                {isLiveMode ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                <span className="hidden sm:inline">{isLiveMode ? 'Live' : 'Demo'}</span>
              </button>
            )}
            <ThemeToggle />
            <Link href="/audit?demo=high-risk" className="hireproof-focus ml-1 rounded-full bg-foreground px-3 py-2 font-black text-background hover:bg-safe">
              Quick demo
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
