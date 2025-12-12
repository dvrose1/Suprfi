import { generateApplicationToken, verifyApplicationToken, generateShortId } from '@/lib/utils/token'

describe('Token Utilities', () => {
  const testData = {
    applicationId: 'app_123',
    customerId: 'cust_456',
    jobId: 'job_789',
  }

  describe('generateApplicationToken', () => {
    it('should generate a valid JWT token', () => {
      const token = generateApplicationToken(testData)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')
      expect(token.split('.')).toHaveLength(3) // JWT has 3 parts
    })

    it('should generate different tokens for different data', () => {
      const token1 = generateApplicationToken(testData)
      const token2 = generateApplicationToken({
        ...testData,
        applicationId: 'app_different',
      })

      expect(token1).not.toBe(token2)
    })
  })

  describe('verifyApplicationToken', () => {
    it('should verify and decode a valid token', () => {
      const token = generateApplicationToken(testData)
      const decoded = verifyApplicationToken(token)

      expect(decoded).not.toBeNull()
      expect(decoded?.applicationId).toBe(testData.applicationId)
      expect(decoded?.customerId).toBe(testData.customerId)
      expect(decoded?.jobId).toBe(testData.jobId)
    })

    it('should return expiration timestamp', () => {
      const token = generateApplicationToken(testData)
      const decoded = verifyApplicationToken(token)

      expect(decoded?.exp).toBeDefined()
      expect(typeof decoded?.exp).toBe('number')
      
      // Should expire in ~24 hours
      const now = Math.floor(Date.now() / 1000)
      const expectedExpiry = now + 24 * 60 * 60
      expect(decoded?.exp).toBeGreaterThan(now)
      expect(decoded?.exp).toBeLessThanOrEqual(expectedExpiry + 5) // 5 second tolerance
    })

    it('should return null for invalid token', () => {
      const decoded = verifyApplicationToken('invalid-token')
      expect(decoded).toBeNull()
    })

    it('should return null for malformed JWT', () => {
      const decoded = verifyApplicationToken('not.a.valid.jwt.token')
      expect(decoded).toBeNull()
    })

    it('should return null for tampered token', () => {
      const token = generateApplicationToken(testData)
      // Tamper with the token by modifying a character
      const tamperedToken = token.slice(0, -5) + 'XXXXX'
      
      const decoded = verifyApplicationToken(tamperedToken)
      expect(decoded).toBeNull()
    })

    it('should return null for empty string', () => {
      const decoded = verifyApplicationToken('')
      expect(decoded).toBeNull()
    })
  })

  describe('generateShortId', () => {
    it('should generate a 12-character ID', () => {
      const id = generateShortId()
      expect(id).toHaveLength(12)
    })

    it('should generate URL-safe characters', () => {
      const id = generateShortId()
      // nanoid uses A-Za-z0-9_- by default
      expect(id).toMatch(/^[A-Za-z0-9_-]+$/)
    })

    it('should generate unique IDs', () => {
      const ids = new Set()
      for (let i = 0; i < 100; i++) {
        ids.add(generateShortId())
      }
      expect(ids.size).toBe(100)
    })
  })
})
