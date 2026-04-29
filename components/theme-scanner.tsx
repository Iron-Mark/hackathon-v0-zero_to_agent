'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from 'next-themes'

export function ThemeScanner() {
  const { theme } = useTheme()
  const [isScanning, setIsScanning] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    setIsScanning(true)
    const timer = setTimeout(() => setIsScanning(false), 2000)
    return () => clearTimeout(timer)
  }, [theme, mounted])

  if (!mounted) return null

  return (
    <AnimatePresence>
      {isScanning && (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
          {/* Vertical Scan Line */}
          <motion.div
            initial={{ left: '-10%' }}
            animate={{ left: '110%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute top-0 bottom-0 w-[2px] bg-safe shadow-[0_0_15px_rgba(16,185,129,0.8)] opacity-50"
          />
          
          {/* Pulse Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.1, 0] }}
            transition={{ duration: 2 }}
            className="absolute inset-0 bg-safe/5"
          />

          {/* Top/Bottom HUD borders */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-0 left-0 right-0 h-10 border-x-4 border-t-4 border-safe/20 m-4 flex items-center justify-center"
          >
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-safe">Theme Recalibration Active</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-0 left-0 right-0 h-10 border-x-4 border-b-4 border-safe/20 m-4 flex items-center justify-center"
          >
            <div className="text-[10px] font-black uppercase tracking-[0.4em] text-safe">Verification Environment Synced</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
