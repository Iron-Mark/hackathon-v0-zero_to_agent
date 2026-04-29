import { z } from 'zod'

/**
 * Hardened LocalStorage Wrapper
 * Handles QuotaExceededError, SSR safety, and schema validation
 */
export const SafeStorage = {
  get<T>(key: string, schema?: z.ZodType<T>): T | null {
    if (typeof window === 'undefined') return null
    
    try {
      const item = localStorage.getItem(key)
      if (!item) return null
      
      const parsed = JSON.parse(item)
      
      if (schema) {
        const result = schema.safeParse(parsed)
        if (!result.success) {
          console.warn(`[SafeStorage] Data integrity check failed for key: ${key}. Purging corrupted data.`, result.error)
          localStorage.removeItem(key)
          return null
        }
        return result.data
      }
      
      return parsed as T
    } catch (e) {
      console.error(`[SafeStorage] Failed to retrieve key: ${key}`, e)
      return null
    }
  },

  set<T>(key: string, value: T): boolean {
    if (typeof window === 'undefined') return false
    
    try {
      const serialized = JSON.stringify(value)
      localStorage.setItem(key, serialized)
      return true
    } catch (e: any) {
      if (e.name === 'QuotaExceededError' || e.code === 22) {
        console.error(`[SafeStorage] Quota exceeded for key: ${key}. Attempting emergency purge.`)
        // Emergency: Clear the specific key if it's too big, or clear everything if critical
        // For HireProof, we'll try to keep it safe by just failing this write and logging
        return false
      }
      console.error(`[SafeStorage] Failed to set key: ${key}`, e)
      return false
    }
  },

  remove(key: string): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.removeItem(key)
    } catch (e) {
      console.error(`[SafeStorage] Failed to remove key: ${key}`, e)
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.clear()
    } catch (e) {
      console.error('[SafeStorage] Failed to clear storage', e)
    }
  }
}
