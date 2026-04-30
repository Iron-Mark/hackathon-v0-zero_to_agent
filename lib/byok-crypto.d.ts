export interface EncryptedSecretPayload {
  algorithm: 'aes-256-gcm'
  iv: string
  ciphertext: string
  tag: string
}

export function encryptSecret(secret: string, encryptionKey: string): EncryptedSecretPayload
export function decryptSecret(payload: EncryptedSecretPayload, encryptionKey: string): string
export function redactSecret(secret: string): { lastFour: string }
