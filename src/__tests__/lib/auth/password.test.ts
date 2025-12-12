import { hashPassword, verifyPassword, validatePassword, generateSecureToken } from '@/lib/auth/password'

// Test fixture - not a real password
const TEST_PASSWORD = 'FakePass1'

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const hash = await hashPassword(TEST_PASSWORD)

      expect(hash).toBeDefined()
      expect(hash).not.toBe(TEST_PASSWORD)
      expect(hash.length).toBeGreaterThan(0)
    })

    it('should generate different hashes for same password', async () => {
      const hash1 = await hashPassword(TEST_PASSWORD)
      const hash2 = await hashPassword(TEST_PASSWORD)

      // Due to salt, hashes should be different
      expect(hash1).not.toBe(hash2)
    })

    it('should generate bcrypt format hash', async () => {
      const hash = await hashPassword(TEST_PASSWORD)
      
      // bcrypt hashes start with $2a$ or $2b$
      expect(hash).toMatch(/^\$2[ab]\$/)
    })
  })

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const hash = await hashPassword(TEST_PASSWORD)
      
      const isValid = await verifyPassword(TEST_PASSWORD, hash)
      expect(isValid).toBe(true)
    })

    it('should reject incorrect password', async () => {
      const hash = await hashPassword(TEST_PASSWORD)
      
      const isValid = await verifyPassword('WrongPass1', hash)
      expect(isValid).toBe(false)
    })

    it('should reject similar but different password', async () => {
      const hash = await hashPassword(TEST_PASSWORD)
      
      const isValid = await verifyPassword('FakePass2', hash)
      expect(isValid).toBe(false)
    })

    it('should be case sensitive', async () => {
      const hash = await hashPassword(TEST_PASSWORD)
      
      const isValid = await verifyPassword('fakepass1', hash)
      expect(isValid).toBe(false)
    })
  })

  describe('validatePassword', () => {
    it('should accept valid password', () => {
      const result = validatePassword('ValidPw1')
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should reject password shorter than 8 characters', () => {
      const result = validatePassword('Short1')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Password must be at least 8 characters')
    })

    it('should reject password without numbers', () => {
      const result = validatePassword('NoNumbers')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Password must contain at least one number')
    })

    it('should reject password without uppercase', () => {
      const result = validatePassword('nouppercase1')
      expect(result.valid).toBe(false)
      expect(result.error).toBe('Password must contain at least one uppercase letter')
    })

    it('should accept password with special characters', () => {
      const result = validatePassword('Special1!')
      expect(result.valid).toBe(true)
    })

    it('should accept exactly 8 character password', () => {
      const result = validatePassword('Exact1aa')
      expect(result.valid).toBe(true)
    })

    it('should accept long passwords', () => {
      const result = validatePassword('LongFakeTestValue1')
      expect(result.valid).toBe(true)
    })
  })

  describe('generateSecureToken', () => {
    it('should generate a 64-character token', () => {
      const token = generateSecureToken()
      expect(token).toHaveLength(64)
    })

    it('should only contain alphanumeric characters', () => {
      const token = generateSecureToken()
      expect(token).toMatch(/^[A-Za-z0-9]+$/)
    })

    it('should generate unique tokens', () => {
      const tokens = new Set()
      for (let i = 0; i < 100; i++) {
        tokens.add(generateSecureToken())
      }
      expect(tokens.size).toBe(100)
    })

    it('should contain mixed case and numbers', () => {
      // Generate multiple tokens to ensure randomness
      const tokens = Array.from({ length: 10 }, () => generateSecureToken())
      const combined = tokens.join('')
      
      expect(combined).toMatch(/[A-Z]/)
      expect(combined).toMatch(/[a-z]/)
      expect(combined).toMatch(/[0-9]/)
    })
  })
})
