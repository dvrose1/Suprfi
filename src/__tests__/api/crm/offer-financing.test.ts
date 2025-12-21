// ABOUTME: Tests for the CRM offer-financing endpoint
// ABOUTME: Validates request schema for multiple CRM types (FieldRoutes, Jobber, etc.)

import { z } from 'zod'

// Supported CRM types (copied from route for testing)
const CRM_TYPES = ['fieldroutes', 'jobber', 'servicetitan', 'housecall'] as const

// Request validation schema (copied from route for testing)
const OfferFinancingSchema = z.object({
  crm_type: z.enum(CRM_TYPES).optional().default('fieldroutes'),
  crm_customer_id: z.string(),
  customer: z.object({
    first_name: z.string(),
    last_name: z.string(),
    email: z.string().email(),
    phone: z.string(),
    address: z.object({
      line1: z.string().optional(),
      line2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zip: z.string().optional(),
    }).optional(),
  }),
  job: z.object({
    crm_job_id: z.string(),
    estimate_amount: z.number().positive(),
    service_type: z.string().optional(),
    technician_id: z.string().optional(),
  }),
  metadata: z.object({
    office_id: z.string().optional(),
    campaign: z.string().optional(),
  }).optional(),
})

const validFieldRoutesRequest = {
  crm_type: 'fieldroutes' as const,
  crm_customer_id: 'FR-CUST-001',
  customer: {
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@example.com',
    phone: '+15551234567',
    address: {
      line1: '123 Main St',
      city: 'Austin',
      state: 'TX',
      zip: '78701',
    },
  },
  job: {
    crm_job_id: 'FR-JOB-001',
    estimate_amount: 5000,
    service_type: 'HVAC Repair',
  },
}

const validJobberRequest = {
  crm_type: 'jobber' as const,
  crm_customer_id: 'JB-CLIENT-12345',
  customer: {
    first_name: 'Jane',
    last_name: 'Smith',
    email: 'jane@example.com',
    phone: '+15559876543',
    address: {
      line1: '456 Oak Ave',
      city: 'Dallas',
      state: 'TX',
      zip: '75201',
    },
  },
  job: {
    crm_job_id: 'JB-QUOTE-67890',
    estimate_amount: 8500,
    service_type: 'Plumbing',
    technician_id: 'tech-abc',
  },
}

describe('CRM Offer Financing Schema Validation', () => {
  describe('CRM type handling', () => {
    it('accepts fieldroutes as crm_type', () => {
      const result = OfferFinancingSchema.safeParse(validFieldRoutesRequest)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.crm_type).toBe('fieldroutes')
      }
    })

    it('accepts jobber as crm_type', () => {
      const result = OfferFinancingSchema.safeParse(validJobberRequest)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.crm_type).toBe('jobber')
      }
    })

    it('accepts servicetitan as crm_type', () => {
      const request = { ...validFieldRoutesRequest, crm_type: 'servicetitan' as const }
      const result = OfferFinancingSchema.safeParse(request)
      expect(result.success).toBe(true)
    })

    it('accepts housecall as crm_type', () => {
      const request = { ...validFieldRoutesRequest, crm_type: 'housecall' as const }
      const result = OfferFinancingSchema.safeParse(request)
      expect(result.success).toBe(true)
    })

    it('defaults to fieldroutes when crm_type is not provided', () => {
      const { crm_type, ...requestWithoutType } = validFieldRoutesRequest
      const result = OfferFinancingSchema.safeParse(requestWithoutType)
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.crm_type).toBe('fieldroutes')
      }
    })

    it('rejects invalid crm_type', () => {
      const request = { ...validFieldRoutesRequest, crm_type: 'invalid_crm' }
      const result = OfferFinancingSchema.safeParse(request)
      expect(result.success).toBe(false)
    })
  })

  describe('Customer data validation', () => {
    it('accepts valid customer data', () => {
      const result = OfferFinancingSchema.safeParse(validJobberRequest)
      expect(result.success).toBe(true)
    })

    it('requires first_name to be present', () => {
      // Note: Empty string passes validation, but missing field fails
      const { first_name, ...customerWithoutFirstName } = validJobberRequest.customer
      const request = {
        ...validJobberRequest,
        customer: customerWithoutFirstName,
      }
      const result = OfferFinancingSchema.safeParse(request)
      expect(result.success).toBe(false)
    })

    it('rejects invalid email', () => {
      const request = {
        ...validJobberRequest,
        customer: { ...validJobberRequest.customer, email: 'not-an-email' },
      }
      const result = OfferFinancingSchema.safeParse(request)
      expect(result.success).toBe(false)
    })

    it('accepts customer without address', () => {
      const { address, ...customerWithoutAddress } = validJobberRequest.customer
      const request = {
        ...validJobberRequest,
        customer: customerWithoutAddress,
      }
      const result = OfferFinancingSchema.safeParse(request)
      expect(result.success).toBe(true)
    })
  })

  describe('Job data validation', () => {
    it('accepts valid job data', () => {
      const result = OfferFinancingSchema.safeParse(validJobberRequest)
      expect(result.success).toBe(true)
    })

    it('rejects negative estimate_amount', () => {
      const request = {
        ...validJobberRequest,
        job: { ...validJobberRequest.job, estimate_amount: -100 },
      }
      const result = OfferFinancingSchema.safeParse(request)
      expect(result.success).toBe(false)
    })

    it('rejects zero estimate_amount', () => {
      const request = {
        ...validJobberRequest,
        job: { ...validJobberRequest.job, estimate_amount: 0 },
      }
      const result = OfferFinancingSchema.safeParse(request)
      expect(result.success).toBe(false)
    })

    it('accepts job without optional fields', () => {
      const request = {
        ...validJobberRequest,
        job: {
          crm_job_id: 'JB-QUOTE-123',
          estimate_amount: 3000,
        },
      }
      const result = OfferFinancingSchema.safeParse(request)
      expect(result.success).toBe(true)
    })
  })

  describe('Metadata handling', () => {
    it('accepts request with metadata', () => {
      const request = {
        ...validJobberRequest,
        metadata: {
          office_id: 'office-123',
          campaign: 'summer-promo',
        },
      }
      const result = OfferFinancingSchema.safeParse(request)
      expect(result.success).toBe(true)
    })

    it('accepts request without metadata', () => {
      const result = OfferFinancingSchema.safeParse(validJobberRequest)
      expect(result.success).toBe(true)
    })
  })
})
