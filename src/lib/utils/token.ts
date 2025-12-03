import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import { config } from 'dotenv'

// Load env
config({ path: '.env.local' })

const JWT_SECRET = process.env.JWT_SECRET || 'suprfi-default-secret-key-2024'

// Debug: log if we have a secret (don't log the actual secret)
console.log('JWT_SECRET loaded:', JWT_SECRET ? 'yes (' + JWT_SECRET.length + ' chars)' : 'no, using default')

export interface ApplicationToken {
  applicationId: string
  customerId: string
  jobId: string
  exp: number
}

/**
 * Generate a secure token for borrower application link
 * Token expires in 24 hours
 */
export function generateApplicationToken(data: {
  applicationId: string
  customerId: string
  jobId: string
}): string {
  const payload: ApplicationToken = {
    ...data,
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
  }

  return jwt.sign(payload, JWT_SECRET)
}

/**
 * Verify and decode application token
 * Returns null if token is invalid or expired
 */
export function verifyApplicationToken(token: string): ApplicationToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as ApplicationToken
    return decoded
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Generate a short, URL-safe ID
 */
export function generateShortId(): string {
  return nanoid(12)
}
