import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { generateApplicationToken } from '@/lib/utils/token'

// Only allow in development/staging
const isDev = process.env.NODE_ENV === 'development' || process.env.VERCEL_ENV === 'preview'

const DemoApplicationSchema = z.object({
  firstName: z.string().min(1).default('Demo'),
  lastName: z.string().min(1).default('User'),
  email: z.string().email().default('demo@suprfi.com'),
  phone: z.string().min(10).default('5551234567'),
  estimateAmount: z.number().positive().default(5000),
})

/**
 * POST /api/v1/demo/create-application
 * 
 * Creates a demo application for testing purposes.
 * Only available in development/staging environments.
 */
export async function POST(request: NextRequest) {
  // Block in production
  if (!isDev && process.env.VERCEL_ENV === 'production') {
    return NextResponse.json(
      { error: 'Demo endpoint not available in production' },
      { status: 403 }
    )
  }

  try {
    const body = await request.json().catch(() => ({}))
    const data = DemoApplicationSchema.parse(body)

    console.log('🧪 Creating demo application...')

    // 1. Create or get demo customer
    const crmCustomerId = `demo-${Date.now()}`
    const customer = await prisma.customer.create({
      data: {
        crmCustomerId,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        addressLine1: '123 Demo Street',
        city: 'Demo City',
        state: 'CA',
        postalCode: '90210',
      },
    })

    console.log('✅ Demo customer created:', customer.id)

    // 2. Find demo contractor (created by seed-demo.js)
    const demoContractor = await prisma.contractor.findFirst({
      where: { businessName: 'Demo HVAC Services' },
    })
    
    const demoUser = await prisma.contractorUser.findFirst({
      where: { email: 'demo@contractor.com' },
    })

    // 3. Create demo job
    const job = await prisma.job.create({
      data: {
        crmJobId: `demo-job-${Date.now()}`,
        customerId: customer.id,
        estimateAmount: data.estimateAmount,
        serviceType: 'HVAC Repair',
        status: 'pending',
      },
    })

    console.log('✅ Demo job created:', job.id)

    // 4. Link job to demo contractor (so it shows in merchant dashboard)
    if (demoContractor && demoUser) {
      await prisma.contractorJob.create({
        data: {
          contractorId: demoContractor.id,
          jobId: job.id,
          initiatedBy: demoUser.id,
          initiatedAt: new Date(),
          sendMethod: 'api',
        },
      })
      console.log('✅ Linked to demo contractor:', demoContractor.businessName)
    } else {
      console.log('⚠️ Demo contractor not found - application will only show in admin dashboard')
    }

    // 5. Create application
    const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    const application = await prisma.application.create({
      data: {
        jobId: job.id,
        customerId: customer.id,
        token: '',
        tokenExpiresAt,
        status: 'initiated',
      },
    })

    // 6. Generate token
    const token = generateApplicationToken({
      applicationId: application.id,
      customerId: customer.id,
      jobId: job.id,
    })

    await prisma.application.update({
      where: { id: application.id },
      data: { token },
    })

    console.log('✅ Demo application created:', application.id)

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const applicationLink = `${appUrl}/apply/${token}`

    return NextResponse.json({
      success: true,
      message: 'Demo application created',
      applicationId: application.id,
      customerId: customer.id,
      jobId: job.id,
      link: applicationLink,
      expiresAt: tokenExpiresAt.toISOString(),
      testData: {
        customer: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          phone: data.phone,
        },
        job: {
          estimateAmount: data.estimateAmount,
          serviceType: 'HVAC Repair',
        },
        plaidTestCredentials: {
          username: 'user_good',
          password: 'pass_good',
        },
      },
    })
  } catch (error) {
    console.error('❌ Error creating demo application:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.issues,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to create demo application',
      message: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

/**
 * GET /api/v1/demo/create-application
 * Returns usage instructions
 */
export async function GET() {
  if (!isDev && process.env.VERCEL_ENV === 'production') {
    return NextResponse.json(
      { error: 'Demo endpoint not available in production' },
      { status: 403 }
    )
  }

  return NextResponse.json({
    endpoint: '/api/v1/demo/create-application',
    method: 'POST',
    description: 'Creates a demo financing application for testing',
    environment: process.env.NODE_ENV,
    request_body: {
      firstName: 'string (optional, default: Demo)',
      lastName: 'string (optional, default: User)',
      email: 'string (optional, default: demo@suprfi.com)',
      phone: 'string (optional, default: 5551234567)',
      estimateAmount: 'number (optional, default: 5000)',
    },
    plaid_test_credentials: {
      username: 'user_good',
      password: 'pass_good',
    },
    example_curl: `curl -X POST ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/v1/demo/create-application -H "Content-Type: application/json" -d '{"firstName":"Doug","lastName":"Test","estimateAmount":7500}'`,
  })
}
