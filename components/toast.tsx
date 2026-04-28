'use client'

import { useState, useEffect, useCallback } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Toast {
  id: number
  message: string
  type?: 'success' | 'info'
}

let toastId = 0

// Global toast queue — components call showToast() anywhere
const listeners = new Set<(toast: Toast) => void>()

export function showToast(message: string, type: 'success' | 'info' = 'success') {
  const toast: Toast = { id: ++toastId, message, type }
  listeners.forEach((fn) => fn(toast))
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const handler = (toast: Toast) => {
      setToasts((prev) => [...prev, toast])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      }, 3000)
    }
    listeners.add(handler)
    return () => { listeners.delete(handler) }
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="pointer-events-auto flex items-center gap-3 rounded-xl border border-border-soft bg-surface px-4 py-3 shadow-lg"
            >
              <CheckCircle2 className="h-4 w-4 shrink-0 text-safe" />
              <span className="text-sm font-bold">{toast.message}</span>
              <button onClick={() => dismiss(toast.id)} className="ml-1 text-muted hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}
