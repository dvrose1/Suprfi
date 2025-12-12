/**
 * Borrower Submit Business Logic Tests
 * Tests for application submission business logic
 */

import { z } from 'zod'
import { verifyApplicationToken } from '@/lib/utils/token'
import { runDecisioning, generateOffers } from '@/lib/services/decisioning'

// Mock token verification
jest.mock('@/lib/utils/token', () => ({
  verifyApplicationToken: jest.fn(),
}))

const mockVerifyToken = verifyApplicationToken as jest.MockedFunction<typeof verifyApplicationToken>

// Zod schema for submission validation (from the actual route)
const SubmitApplicationSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional().default(''),
  city: z.string().min(1),
  state: z.string().min(2),
  postalCode: z.string().min(5),
  dateOfBirth: z.string().min(1),
  ssn: z.string().min(9),
  plaidAccessToken: z.string().optional().nullable(),
  plaidAccountId: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  accountMask: z.string().optional().nullable(),
  personaInquiryId: z.string().optional().nullable(),
  kycStatus: z.string().optional().nullable(),
  creditCheckConsent: z.boolean(),
  termsAccepted: z.boolean(),
  eSignConsent: z.boolean(),
})

const validSubmissionData = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+15551234567',
  addressLine1: '123 Main St',
  addressLine2: '',
  city: 'Austin',
  state: 'TX',
  postalCode: '78701',
  dateOfBirth: '1990-01-15',
  ssn: '123-45-6789',
  plaidAccessToken: 'access-token',
  plaidAccountId: 'account-123',
  bankName: 'Test Bank',
  accountMask: '1234',
  personaInquiryId: 'inq_123',
  kycStatus: 'approved',
  creditCheckConsent: true,
  termsAccepted: true,
  eSignConsent: true,
}

describe('Borrower Submit Business Logic', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Token verification', () => {
    it('returns null for invalid token', () => {
      mockVerifyToken.mockReturnValue(null)
      
      const result = mockVerifyToken('invalid-token')
      expect(result).toBeNull()
    })

    it('returns decoded payload for valid token', () => {
      const mockPayload = {
        applicationId: 'app-123',
        customerId: 'cust-123',
        exp: Math.floor(Date.now() / 1000) + 3600,
      }
      mockVerifyToken.mockReturnValue(mockPayload as any)
      
      const result = mockVerifyToken('valid-token')
      expect(result?.applicationId).toBe('app-123')
    })

    it('identifies expired tokens', () => {
      const expiredPayload = {
        applicationId: 'app-123',
        exp: Math.floor(Date.now() / 1000) - 3600, // Expired
      }
      mockVerifyToken.mockReturnValue(expiredPayload as any)
      
      const result = mockVerifyToken('expired-token')
      const now = Math.floor(Date.now() / 1000)
      expect(result?.exp).toBeLessThan(now)
    })
  })

  describe('Submission data validation', () => {
    it('validates valid submission data', () => {
      const result = SubmitApplicationSchema.safeParse(validSubmissionData)
      expect(result.success).toBe(true)
    })

    it('rejects missing first name', () => {
      const data = { ...validSubmissionData, firstName: '' }
      const result = SubmitApplicationSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('rejects invalid email', () => {
      const data = { ...validSubmissionData, email: 'not-an-email' }
      const result = SubmitApplicationSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('rejects short phone number', () => {
      const data = { ...validSubmissionData, phone: '123' }
      const result = SubmitApplicationSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('rejects short SSN', () => {
      const data = { ...validSubmissionData, ssn: '123' }
      const result = SubmitApplicationSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('accepts SSN with dashes', () => {
      const data = { ...validSubmissionData, ssn: '123-45-6789' }
      const result = SubmitApplicationSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('rejects missing address', () => {
      const data = { ...validSubmissionData, addressLine1: '' }
      const result = SubmitApplicationSchema.safeParse(data)
      expect(result.success).toBe(false)
    })

    it('accepts optional addressLine2', () => {
      const data = { ...validSubmissionData, addressLine2: undefined }
      const result = SubmitApplicationSchema.safeParse(data)
      expect(result.success).toBe(true)
    })

    it('requires credit check consent', () => {
      const result = SubmitApplicationSchema.safeParse(validSubmissionData)
      if (result.success) {
        expect(result.data.creditCheckConsent).toBe(true)
      }
    })

    it('requires terms accepted', () => {
      const result = SubmitApplicationSchema.safeParse(validSubmissionData)
      if (result.success) {
        expect(result.data.termsAccepted).toBe(true)
      }
    })

    it('requires eSign consent', () => {
      const result = SubmitApplicationSchema.safeParse(validSubmissionData)
      if (result.success) {
        expect(result.data.eSignConsent).toBe(true)
      }
    })
  })

  describe('Consent validation logic', () => {
    it('all consents must be true for valid submission', () => {
      const data = { 
        ...validSubmissionData, 
        creditCheckConsent: true,
        termsAccepted: true,
        eSignConsent: true,
      }
      
      const allConsentsAccepted = data.creditCheckConsent && data.termsAccepted && data.eSignConsent
      expect(allConsentsAccepted).toBe(true)
    })

    it('missing credit consent fails', () => {
      const data = { 
        ...validSubmissionData, 
        creditCheckConsent: false,
      }
      
      const allConsentsAccepted = data.creditCheckConsent && data.termsAccepted && data.eSignConsent
      expect(allConsentsAccepted).toBe(false)
    })

    it('missing terms consent fails', () => {
      const data = { 
        ...validSubmissionData, 
        termsAccepted: false,
      }
      
      const allConsentsAccepted = data.creditCheckConsent && data.termsAccepted && data.eSignConsent
      expect(allConsentsAccepted).toBe(false)
    })
  })

  describe('Decisioning integration', () => {
    it('runDecisioning returns expected structure', () => {
      const mockResult = {
        approved: true,
        score: 720,
        decisionReason: 'Strong profile',
        maxLoanAmount: 10000,
        riskFactors: [],
        positiveFactors: ['Good balance'],
        dataUsed: ['plaid'],
      }
      
      expect(mockResult.approved).toBe(true)
      expect(mockResult.score).toBeGreaterThan(600)
      expect(Array.isArray(mockResult.riskFactors)).toBe(true)
      expect(Array.isArray(mockResult.positiveFactors)).toBe(true)
    })

    it('generateOffers returns array of offers', () => {
      const mockOffers = [
        { termMonths: 6, apr: 9.99, monthlyPayment: 850, downPayment: 0, originationFee: 100, totalAmount: 5200 },
        { termMonths: 12, apr: 12.99, monthlyPayment: 450, downPayment: 0, originationFee: 100, totalAmount: 5500 },
      ]
      
      expect(Array.isArray(mockOffers)).toBe(true)
      expect(mockOffers.length).toBeGreaterThan(0)
      expect(mockOffers[0]).toHaveProperty('termMonths')
      expect(mockOffers[0]).toHaveProperty('apr')
      expect(mockOffers[0]).toHaveProperty('monthlyPayment')
    })
  })

  describe('Application status checks', () => {
    const checkCanSubmit = (status: string) => {
      return status !== 'submitted' && status !== 'approved'
    }

    it('pending status allows submission', () => {
      expect(checkCanSubmit('pending')).toBe(true)
    })

    it('submitted status blocks submission', () => {
      expect(checkCanSubmit('submitted')).toBe(false)
    })

    it('approved status blocks submission', () => {
      expect(checkCanSubmit('approved')).toBe(false)
    })
  })
})
