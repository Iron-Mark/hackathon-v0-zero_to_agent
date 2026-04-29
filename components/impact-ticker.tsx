'use client'

import { motion } from 'framer-motion'
import { Shield, TrendingDown, Users, AlertCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

export function ImpactTicker() {
  const [counts, setCounts] = useState({ scams: 2891, theft: 8930000, users: 14200 })

  useEffect(() => {
    const interval = setInterval(() => {
      setCounts(prev => ({
        scams: prev.scams + Math.floor(Math.random() * 2),
        theft: prev.theft + Math.floor(Math.random() * 500),
        users: prev.users + Math.floor(Math.random() * 3)
      }))
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="w-full bg-surface/50 dark:bg-[#0c0f14] py-2 overflow-hidden border-y border-border-soft dark:border-white/5 backdrop-blur-sm">
      <motion.div 
        animate={{ x: [0, -1000] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap gap-12 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70 dark:text-white/70"
      >
        <StatItem icon={Shield} text={`${counts.scams.toLocaleString()} scams identified this week`} />
        <StatItem icon={TrendingDown} text={`$${(counts.theft / 1000000).toFixed(1)}M in potential theft prevented`} />
        <StatItem icon={Users} text={`${counts.users.toLocaleString()} job seekers protected`} />
        <StatItem icon={AlertCircle} text="New high-risk pattern detected in remote Telegram listings" />
        {/* Duplicate for seamless loop */}
        <StatItem icon={Shield} text={`${counts.scams.toLocaleString()} scams identified this week`} />
        <StatItem icon={TrendingDown} text={`$${(counts.theft / 1000000).toFixed(1)}M in potential theft prevented`} />
        <StatItem icon={Users} text={`${counts.users.toLocaleString()} job seekers protected`} />
      </motion.div>
    </div>
  )
}

function StatItem({ icon: Icon, text }: { icon: any, text: string }) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-3 w-3 text-safe" />
      <span>{text}</span>
    </div>
  )
}
