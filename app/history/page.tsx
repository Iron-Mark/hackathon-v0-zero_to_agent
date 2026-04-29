'use client'

import { motion } from 'framer-motion'
import { SiteHeader } from '@/components/site-header'
import { History, FileSearch, ArrowRight, ShieldCheck, AlertTriangle, Zap, Calendar, Download } from 'lucide-react'
import { useAuditHistory } from '@/hooks/useAuditHistory'
import Link from 'next/link'

export default function HistoryPage() {
  const { history, clearHistory } = useAuditHistory()

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12 lg:px-8">
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border-soft bg-surface px-3 py-1 text-[10px] font-black uppercase tracking-widest text-muted shadow-sm">
              <History className="h-3.5 w-3.5" />
              Local Report Archive
            </div>
            <h1 className="text-4xl font-black lg:text-6xl tracking-tight">Case History</h1>
            <p className="mt-4 max-w-xl text-lg font-medium text-muted leading-relaxed">
              Access your previous job investigations. All data is stored locally in your encrypted browser session.
            </p>
          </div>
          
          {history.length > 0 && (
            <button 
              onClick={() => {
                if (confirm('Are you sure you want to delete all locally stored case files?')) {
                  clearHistory()
                }
              }}
              className="text-xs font-black uppercase tracking-widest text-muted hover:text-risk-text transition-colors"
            >
              Purge Local Archive
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="rounded-[3rem] border border-dashed border-border-soft bg-surface/10 p-24 text-center backdrop-blur-sm">
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-[2rem] bg-surface mb-8 text-muted border border-border-soft">
              <FileSearch className="h-10 w-10 opacity-20" />
            </div>
            <h2 className="text-3xl font-black mb-3">Archive is empty</h2>
            <p className="text-muted text-lg font-medium mb-10 max-w-md mx-auto">You haven't checked any job posts in this session yet.</p>
            <Link href="/audit" className="inline-flex rounded-2xl bg-foreground px-10 py-5 text-base font-black text-background hover:bg-safe transition-all shadow-xl hover:shadow-safe/20">
              Check a Job Post
            </Link>
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {history.map((report, i) => (
              <motion.div key={report.id} variants={itemVariants}>
                <Link 
                  href={`/audit/${report.id}`}
                  className="group flex flex-col md:flex-row md:items-center gap-6 rounded-[2rem] border border-border-soft bg-surface/50 p-8 backdrop-blur-sm transition-all hover:border-safe/30 hover:bg-background hover:shadow-2xl hover:shadow-safe/5"
                >
                  <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
                    report.verdict === 'high-risk' ? 'bg-risk-bg text-risk-text' : 
                    report.verdict === 'caution' ? 'bg-caution-bg text-caution-text' : 
                    'bg-safe-bg text-safe'
                  }`}>
                    {report.verdict === 'high-risk' ? <AlertTriangle className="h-8 w-8" /> : 
                     report.verdict === 'caution' ? <Zap className="h-8 w-8" /> : 
                     <ShieldCheck className="h-8 w-8" />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        report.verdict === 'high-risk' ? 'text-risk-text' : 
                        report.verdict === 'caution' ? 'text-caution-text' : 
                        'text-safe'
                      }`}>
                        {report.verdict} Report
                      </span>
                      <div className="h-1 w-1 rounded-full bg-border-soft" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(report.timestamp || '').toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black truncate group-hover:text-safe transition-colors">{report.extractedClaims.role}</h3>
                    <p className="text-base font-bold text-muted/70">{report.extractedClaims.company}</p>
                  </div>
                  
                  <div className="flex items-center gap-8 md:text-right">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">Risk Score</span>
                      <span className={`text-2xl font-black ${
                        report.verdict === 'high-risk' ? 'text-risk-text' : 
                        report.verdict === 'caution' ? 'text-caution-text' : 
                        'text-safe'
                      }`}>
                        {report.riskScore}<span className="text-[10px] opacity-40 ml-1">/100</span>
                      </span>
                    </div>
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-surface border border-border-soft group-hover:bg-safe group-hover:text-background group-hover:border-safe transition-all shadow-sm">
                      <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
        
        <div className="mt-20 rounded-[2.5rem] border border-border-soft bg-[#0c0f14] p-10 relative overflow-hidden">
           <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]" />
           </div>
           <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
             <div>
               <h2 className="text-2xl font-black text-white mb-4">Export Full Archive</h2>
               <p className="text-white/60 font-medium">Download all your investigation case files as a single report packet for offline review.</p>
             </div>
             <div className="flex justify-end">
               <button 
                 disabled={history.length === 0}
                 className="hireproof-focus flex items-center gap-3 rounded-2xl bg-safe px-8 py-4 text-base font-black text-background hover:scale-105 transition-all shadow-xl hover:shadow-safe/20 disabled:opacity-50 disabled:pointer-events-none"
               >
                 <Download className="h-5 w-5" />
                 Download Report Packet
               </button>
             </div>
           </div>
        </div>
      </main>
    </div>
  )
}
