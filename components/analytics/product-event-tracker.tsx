'use client'

import { useEffect } from 'react'

export function trackProductEvent(eventName: string, metadata: Record<string, string> = {}) {
  if (typeof window === 'undefined') return

  const payload = JSON.stringify({
    eventName,
    path: `${window.location.pathname}${window.location.search}`,
    metadata,
  })

  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'application/json' })
    navigator.sendBeacon('/api/analytics/events', blob)
    return
  }

  fetch('/api/analytics/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: payload,
    keepalive: true,
  }).catch(() => {})
}

export function ProductEventTracker({
  eventName,
  metadata = {},
}: {
  eventName: string
  metadata?: Record<string, string>
}) {
  useEffect(() => {
    trackProductEvent(eventName, metadata)
  }, [eventName, metadata])

  return null
}
