import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyApplicationToken } from '@/lib/utils/token'

// Request validation schema
const SubmitApplicationSchema = z.object({
  // Personal Info
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(10),
  addressLine1: z.string().min(1),
  addressLine2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(2),
  postalCode: z.string().min(5),
  dateOfBirth: z.string(),
  ssn: z.string().min(9),
  
  // Bank Info (from Plaid)
  plaidAccessToken: z.string().optional(),
  plaidAccountId: z.string().optional(),
  bankName: z.string().optional(),
  accountMask: z.string().optional(),
  
  // KYC Info (from Persona)
  personaInquiryId: z.string().optional(),
  kycStatus: z.string().optional(),
  
  // Consents
  creditCheckConsent: z.boolean(),
  termsAccepted: z.boolean(),
  eSignConsent: z.boolean(),
})

interface RouteParams {
  params: Promise<{
    token: string
  }>
}

/**
 * POST /api/v1/borrower/:token/submit
 * 
 * Submit completed financing application
 * Validates data, saves to DB, triggers decisioning
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = await params
    
    // 1. Verify token
    const decoded = verifyApplicationToken(token)
    
    if (!decoded) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired token',
      }, { status: 401 })
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000)
    if (decoded.exp < now) {
      return NextResponse.json({
        success: false,
        error: 'Application link has expired',
      }, { status: 401 })
    }

    // 2. Parse and validate request body
    const body: unknown = await request.json()
    const data = SubmitApplicationSchema.parse(body)

    console.log('📋 Application submission received:', {
      applicationId: decoded.applicationId,
      customer: `${data.firstName} ${data.lastName}`,
    })

    // 3. Verify all consents
    if (!data.creditCheckConsent || !data.termsAccepted || !data.eSignConsent) {
      return NextResponse.json({
        success: false,
        error: 'All consents must be accepted',
      }, { status: 400 })
    }

    // 4. Fetch application from database
    const application = await prisma.application.findUnique({
      where: { id: decoded.applicationId },
      include: {
        customer: true,
        job: true,
      },
    })

    if (!application) {
      return NextResponse.json({
        success: false,
        error: 'Application not found',
      }, { status: 404 })
    }

    // 5. Check if already submitted
    if (application.status === 'submitted' || application.status === 'approved') {
      return NextResponse.json({
        success: false,
        error: 'Application already submitted',
      }, { status: 400 })
    }

    // 6. Update customer with complete information
    await prisma.customer.update({
      where: { id: application.customerId },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
      },
    })

    console.log('✅ Customer updated with complete info')

    // 7. Update application with submitted data
    const updateData: any = {
      status: 'submitted',
      creditData: {
        dateOfBirth: data.dateOfBirth,
        ssn: data.ssn, // In production, encrypt this!
        creditCheckConsent: data.creditCheckConsent,
        termsAccepted: data.termsAccepted,
        eSignConsent: data.eSignConsent,
        submittedAt: new Date().toISOString(),
      },
    }

    if (data.plaidAccessToken) {
      updateData.plaidData = {
        accessToken: data.plaidAccessToken,
        accountId: data.plaidAccountId,
        bankName: data.bankName,
        accountMask: data.accountMask,
      }
    }

    if (data.personaInquiryId) {
      updateData.personaData = {
        inquiryId: data.personaInquiryId,
        status: data.kycStatus,
      }
    }

    await prisma.application.update({
      where: { id: application.id },
      data: updateData,
    })

    console.log('✅ Application updated to submitted status')

    // 8. Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'application',
        entityId: application.id,
        actor: application.customerId,
        action: 'submitted',
        payload: {
          bankConnected: !!data.plaidAccessToken,
          kycCompleted: !!data.personaInquiryId,
          consentsAccepted: true,
        },
      },
    })

    console.log('✅ Audit log created')

    // 9. TODO: Trigger decisioning (mock for now)
    // In a real system, this would:
    // - Call credit bureau API
    // - Run decisioning engine
    // - Generate offers
    // - Store in Decision + Offers tables
    
    // Mock decisioning - generate simple offers
    const loanAmount = Number(application.job.estimateAmount)
    
    // Simple mock credit score (random between 650-800)
    const mockCreditScore = Math.floor(Math.random() * 150) + 650
    
    // Create decision record
    const decision = await prisma.decision.create({
      data: {
        applicationId: application.id,
        score: mockCreditScore,
        decisionStatus: 'approved', // Mock approval
        decisionReason: 'Mock decisioning - approved for testing',
        ruleHits: ['mock_rule_1', 'mock_rule_2'],
        evaluatorVersion: 'v1.0-mock',
        decidedBy: 'system',
      },
    })

    console.log('✅ Decision created:', decision.id, 'Score:', mockCreditScore)

    // Generate 3 mock offers based on credit score
    const offers = []
    
    // Offer 1: Short term, lower APR
    const offer1 = await prisma.offer.create({
      data: {
        decisionId: decision.id,
        termMonths: 24,
        apr: mockCreditScore >= 750 ? 7.9 : mockCreditScore >= 700 ? 9.9 : 11.9,
        monthlyPayment: calculateMonthlyPayment(loanAmount, 24, mockCreditScore >= 750 ? 7.9 : mockCreditScore >= 700 ? 9.9 : 11.9),
        downPayment: 0,
        originationFee: loanAmount * 0.01,
        totalAmount: calculateTotalAmount(loanAmount, 24, mockCreditScore >= 750 ? 7.9 : mockCreditScore >= 700 ? 9.9 : 11.9),
        selected: false,
      },
    })
    offers.push(offer1)

    // Offer 2: Medium term
    const offer2 = await prisma.offer.create({
      data: {
        decisionId: decision.id,
        termMonths: 48,
        apr: mockCreditScore >= 750 ? 10.9 : mockCreditScore >= 700 ? 12.9 : 14.9,
        monthlyPayment: calculateMonthlyPayment(loanAmount, 48, mockCreditScore >= 750 ? 10.9 : mockCreditScore >= 700 ? 12.9 : 14.9),
        downPayment: 0,
        originationFee: loanAmount * 0.005,
        totalAmount: calculateTotalAmount(loanAmount, 48, mockCreditScore >= 750 ? 10.9 : mockCreditScore >= 700 ? 12.9 : 14.9),
        selected: false,
      },
    })
    offers.push(offer2)

    // Offer 3: Long term, lower monthly
    const offer3 = await prisma.offer.create({
      data: {
        decisionId: decision.id,
        termMonths: 60,
        apr: mockCreditScore >= 750 ? 12.9 : mockCreditScore >= 700 ? 14.9 : 16.9,
        monthlyPayment: calculateMonthlyPayment(loanAmount, 60, mockCreditScore >= 750 ? 12.9 : mockCreditScore >= 700 ? 14.9 : 16.9),
        downPayment: mockCreditScore < 700 ? loanAmount * 0.1 : 0,
        originationFee: 0,
        totalAmount: calculateTotalAmount(loanAmount, 60, mockCreditScore >= 750 ? 12.9 : mockCreditScore >= 700 ? 14.9 : 16.9),
        selected: false,
      },
    })
    offers.push(offer3)

    console.log('✅ Generated 3 financing offers')

    // 10. Return success with offers
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      application_id: application.id,
      decision: {
        id: decision.id,
        status: decision.decisionStatus,
        score: decision.score,
      },
      offers: offers.map(offer => ({
        id: offer.id,
        termMonths: offer.termMonths,
        apr: Number(offer.apr),
        monthlyPayment: Number(offer.monthlyPayment),
        downPayment: Number(offer.downPayment),
        originationFee: Number(offer.originationFee),
        totalAmount: Number(offer.totalAmount),
      })),
    }, { status: 200 })

  } catch (error) {
    console.error('❌ Error in submission endpoint:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid application data',
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

// Helper function to calculate monthly payment
function calculateMonthlyPayment(principal: number, months: number, apr: number): number {
  const monthlyRate = apr / 100 / 12
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1)
  return Math.round(payment * 100) / 100
}

// Helper function to calculate total amount
function calculateTotalAmount(principal: number, months: number, apr: number): number {
  const monthlyPayment = calculateMonthlyPayment(principal, months, apr)
  return Math.round(monthlyPayment * months * 100) / 100
}
