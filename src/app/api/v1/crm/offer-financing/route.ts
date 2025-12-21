// ABOUTME: CRM offer-financing endpoint - accepts requests from multiple CRMs (FieldRoutes, Jobber, etc.)
// ABOUTME: Creates application, generates token, sends SMS to borrower

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { generateApplicationToken } from '@/lib/utils/token'
import { sendApplicationLink } from '@/lib/services/sms'

// Supported CRM types
const CRM_TYPES = ['fieldroutes', 'jobber', 'servicetitan', 'housecall'] as const
type CrmType = typeof CRM_TYPES[number]

// Request validation schema
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

type OfferFinancingRequest = z.infer<typeof OfferFinancingSchema>

/**
 * POST /api/v1/crm/offer-financing
 * 
 * Trigger a financing offer from CRM (e.g., FieldRoutes)
 * Creates application, generates token, sends SMS to borrower
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body: unknown = await request.json()
    const data = OfferFinancingSchema.parse(body)

    console.log('📋 Offer financing request received:', {
      crm_type: data.crm_type,
      crm_customer_id: data.crm_customer_id,
      customer_name: `${data.customer.first_name} ${data.customer.last_name}`,
      job_id: data.job.crm_job_id,
      amount: data.job.estimate_amount,
    })

    // 1. Create or update customer
    const customer = await prisma.customer.upsert({
      where: { crmCustomerId: data.crm_customer_id },
      update: {
        firstName: data.customer.first_name,
        lastName: data.customer.last_name,
        email: data.customer.email,
        phone: data.customer.phone,
        addressLine1: data.customer.address?.line1,
        addressLine2: data.customer.address?.line2,
        city: data.customer.address?.city,
        state: data.customer.address?.state,
        postalCode: data.customer.address?.zip,
      },
      create: {
        crmCustomerId: data.crm_customer_id,
        firstName: data.customer.first_name,
        lastName: data.customer.last_name,
        email: data.customer.email,
        phone: data.customer.phone,
        addressLine1: data.customer.address?.line1,
        addressLine2: data.customer.address?.line2,
        city: data.customer.address?.city,
        state: data.customer.address?.state,
        postalCode: data.customer.address?.zip,
      },
    })

    console.log('✅ Customer created/updated:', customer.id)

    // 2. Create or update job
    const job = await prisma.job.upsert({
      where: { crmJobId: data.job.crm_job_id },
      update: {
        estimateAmount: data.job.estimate_amount,
        serviceType: data.job.service_type,
        technicianId: data.job.technician_id,
      },
      create: {
        crmJobId: data.job.crm_job_id,
        customerId: customer.id,
        estimateAmount: data.job.estimate_amount,
        serviceType: data.job.service_type,
        technicianId: data.job.technician_id,
        status: 'pending',
      },
    })

    console.log('✅ Job created/updated:', job.id)

    // 3. Create application
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const application = await prisma.application.create({
      data: {
        jobId: job.id,
        customerId: customer.id,
        token: '', // Will be updated after token generation
        tokenExpiresAt,
        status: 'initiated',
      },
    })

    console.log('✅ Application created:', application.id)

    // 4. Generate secure token
    const token = generateApplicationToken({
      applicationId: application.id,
      customerId: customer.id,
      jobId: job.id,
    })

    // Update application with token
    await prisma.application.update({
      where: { id: application.id },
      data: { token },
    })

    console.log('✅ Token generated and saved')

    // 5. Send SMS with application link
    const smsResult = await sendApplicationLink(
      data.customer.phone,
      token,
      data.customer.first_name
    )

    if (!smsResult.success) {
      console.error('⚠️ SMS failed to send:', smsResult.error)
      // Don't fail the request, just log it
    } else {
      console.log('✅ SMS sent successfully')
    }

    // 6. Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'application',
        entityId: application.id,
        actor: 'system',
        action: 'created',
        payload: {
          crm_type: data.crm_type,
          crm_customer_id: data.crm_customer_id,
          crm_job_id: data.job.crm_job_id,
          sms_sent: smsResult.success,
        },
      },
    })

    // 7. Log CRM sync
    await prisma.crmSyncLog.create({
      data: {
        crmType: data.crm_type,
        direction: 'inbound',
        entityType: 'offer_financing',
        entityId: application.id,
        crmEntityId: data.job.crm_job_id,
        status: 'success',
        requestPayload: {
          crm_customer_id: data.crm_customer_id,
          crm_job_id: data.job.crm_job_id,
          estimate_amount: data.job.estimate_amount,
        },
      },
    })

    // 8. Return response
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    
    return NextResponse.json({
      success: true,
      application_id: application.id,
      token,
      link: `${appUrl}/apply/${token}`,
      sms_sent: smsResult.success,
      expires_at: tokenExpiresAt.toISOString(),
    }, { status: 200 })

  } catch (error) {
    console.error('❌ Error in offer-financing endpoint:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.issues,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

/**
 * GET /api/v1/crm/offer-financing
 * 
 * API documentation endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/v1/crm/offer-financing',
    method: 'POST',
    description: 'Trigger a financing offer from CRM (FieldRoutes, Jobber, ServiceTitan, HouseCall)',
    authentication: 'API Key (x-api-key header)',
    supported_crms: CRM_TYPES,
    request_body: {
      crm_type: 'string (optional, default: fieldroutes) - one of: fieldroutes, jobber, servicetitan, housecall',
      crm_customer_id: 'string',
      customer: {
        first_name: 'string',
        last_name: 'string',
        email: 'string',
        phone: 'string',
        address: {
          line1: 'string (optional)',
          line2: 'string (optional)',
          city: 'string (optional)',
          state: 'string (optional)',
          zip: 'string (optional)',
        },
      },
      job: {
        crm_job_id: 'string',
        estimate_amount: 'number',
        service_type: 'string (optional)',
        technician_id: 'string (optional)',
      },
    },
    response: {
      success: 'boolean',
      application_id: 'string',
      token: 'string',
      link: 'string',
      sms_sent: 'boolean',
      expires_at: 'ISO 8601 datetime',
    },
  })
}
