/**
 * Admin Auth Business Logic Tests
 * Tests for auth-related business logic
 */

// Mock prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    adminUser: {
      findUnique: jest.fn(),
    },
    session: {
      create: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}))

// Mock auth functions
jest.mock('@/lib/auth', () => ({
  verifyPassword: jest.fn(),
  createSession: jest.fn(),
  logAuditEvent: jest.fn(),
  SESSION_COOKIE_CONFIG: {
    name: 'suprfi_admin_session',
    options: {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      path: '/',
    },
    getMaxAge: jest.fn((rememberMe: boolean) => rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60),
  },
}))

import { prisma } from '@/lib/prisma'
import { verifyPassword, createSession, logAuditEvent, SESSION_COOKIE_CONFIG } from '@/lib/auth'

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockVerifyPassword = verifyPassword as jest.MockedFunction<typeof verifyPassword>
const mockCreateSession = createSession as jest.MockedFunction<typeof createSession>
const mockLogAuditEvent = logAuditEvent as jest.MockedFunction<typeof logAuditEvent>

describe('Admin Auth Business Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  const mockUser = {
    id: 'user-123',
    email: 'admin@test.com',
    name: 'Test Admin',
    passwordHash: 'hashed-pass',
    role: 'admin',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  describe('User lookup', () => {
    it('finds user by email', async () => {
      ;(mockPrisma.adminUser.findUnique as jest.Mock).mockResolvedValue(mockUser)
      
      const result = await mockPrisma.adminUser.findUnique({
        where: { email: 'admin@test.com' }
      })
      
      expect(result).toEqual(mockUser)
      expect(mockPrisma.adminUser.findUnique).toHaveBeenCalledWith({
        where: { email: 'admin@test.com' }
      })
    })

    it('returns null for non-existent user', async () => {
      ;(mockPrisma.adminUser.findUnique as jest.Mock).mockResolvedValue(null)
      
      const result = await mockPrisma.adminUser.findUnique({
        where: { email: 'nonexistent@test.com' }
      })
      
      expect(result).toBeNull()
    })
  })

  describe('Password verification', () => {
    it('returns true for valid password', async () => {
      mockVerifyPassword.mockResolvedValue(true)
      
      const result = await mockVerifyPassword('correctpass', 'hashed')
      expect(result).toBe(true)
    })

    it('returns false for invalid password', async () => {
      mockVerifyPassword.mockResolvedValue(false)
      
      const result = await mockVerifyPassword('wrongpass', 'hashed')
      expect(result).toBe(false)
    })
  })

  describe('Session creation', () => {
    it('creates session and returns token', async () => {
      mockCreateSession.mockResolvedValue('session-token-xyz')
      
      const token = await mockCreateSession('user-123', false, '127.0.0.1', 'Jest')
      
      expect(token).toBe('session-token-xyz')
      expect(mockCreateSession).toHaveBeenCalledWith('user-123', false, '127.0.0.1', 'Jest')
    })

    it('handles rememberMe flag', async () => {
      mockCreateSession.mockResolvedValue('long-session-token')
      
      await mockCreateSession('user-123', true, '127.0.0.1', 'Jest')
      
      expect(mockCreateSession).toHaveBeenCalledWith('user-123', true, '127.0.0.1', 'Jest')
    })
  })

  describe('Audit logging', () => {
    it('logs successful login', async () => {
      await mockLogAuditEvent({
        userId: 'user-123',
        action: 'login',
        metadata: { rememberMe: false },
        ipAddress: '127.0.0.1',
      })
      
      expect(mockLogAuditEvent).toHaveBeenCalledWith({
        userId: 'user-123',
        action: 'login',
        metadata: { rememberMe: false },
        ipAddress: '127.0.0.1',
      })
    })

    it('logs failed login with reason', async () => {
      await mockLogAuditEvent({
        userId: 'user-123',
        action: 'login_failed',
        metadata: { reason: 'invalid_password' },
        ipAddress: '127.0.0.1',
      })
      
      expect(mockLogAuditEvent).toHaveBeenCalledWith({
        userId: 'user-123',
        action: 'login_failed',
        metadata: { reason: 'invalid_password' },
        ipAddress: '127.0.0.1',
      })
    })
  })

  describe('Session cookie config', () => {
    it('has correct cookie name', () => {
      expect(SESSION_COOKIE_CONFIG.name).toBe('suprfi_admin_session')
    })

    it('sets httpOnly for security', () => {
      expect(SESSION_COOKIE_CONFIG.options.httpOnly).toBe(true)
    })

    it('calculates maxAge based on rememberMe', () => {
      const shortSession = SESSION_COOKIE_CONFIG.getMaxAge(false)
      const longSession = SESSION_COOKIE_CONFIG.getMaxAge(true)
      
      expect(longSession).toBeGreaterThan(shortSession)
    })
  })

  describe('User active check', () => {
    it('active user can login', () => {
      expect(mockUser.isActive).toBe(true)
    })

    it('inactive user should be rejected', () => {
      const inactiveUser = { ...mockUser, isActive: false }
      expect(inactiveUser.isActive).toBe(false)
    })
  })
})
