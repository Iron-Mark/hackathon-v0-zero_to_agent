export interface ApiKeyRecord {
  id: string
  ownerId: string
  name: string
  keyHash: string
  lastFour: string
  createdAt: string
  lastUsedAt: string | null
  revokedAt: string | null
}

export function hashPassword(password: string): Promise<string>
export function verifyPassword(password: string, storedHash: string): Promise<boolean>
export function hashApiKey(rawKey: string): string
export function createApiKey(name: string, ownerId?: string): { rawKey: string; record: ApiKeyRecord }
export function createSessionToken(userId: string, secret: string, ttlSeconds?: number): string
export function verifySessionToken(token: string, secret: string): { userId: string; expiresAt: number } | null
