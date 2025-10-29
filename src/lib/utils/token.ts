import jwt from 'jsonwebtoken'
import { nanoid } from 'nanoid'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

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
