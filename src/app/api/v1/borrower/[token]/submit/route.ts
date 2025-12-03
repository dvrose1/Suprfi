import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyApplicationToken } from '@/lib/utils/token'
import { runDecisioning, generateOffers } from '@/lib/services/decisioning'

// Request validation schema
const SubmitApplicationSchema = z.object({
  // Personal Info
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
  ssn: z.string().min(9), // Can be formatted like 123-45-6789 (11 chars)
  
  // Bank Info (from Plaid) - all optional
  plaidAccessToken: z.string().optional().nullable(),
  plaidAccountId: z.string().optional().nullable(),
  bankName: z.string().optional().nullable(),
  accountMask: z.string().optional().nullable(),
  
  // KYC Info (from Persona) - all optional
  personaInquiryId: z.string().optional().nullable(),
  kycStatus: z.string().optional().nullable(),
  
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
    console.log('📥 Received submission data:', JSON.stringify(body, null, 2))
    
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

    // 9. Run decisioning using Plaid data
    const loanAmount = Number(application.job.estimateAmount)
    const existingPlaidData = application.plaidData as any
    
    console.log('🔄 Running decisioning with Plaid data...')
    console.log('📊 Plaid data available:', {
      hasAccessToken: !!existingPlaidData?.accessToken,
      hasBalance: !!existingPlaidData?.balance,
      hasAchNumbers: !!existingPlaidData?.achNumbers,
      hasAssetReport: existingPlaidData?.assetReport?.status === 'ready',
      institutionName: existingPlaidData?.institutionName,
    })
    
    // Run decisioning engine
    const decisionResult = runDecisioning({
      loanAmount,
      plaidData: existingPlaidData || {
        accessToken: '',
        itemId: '',
        accountId: '',
        institutionName: 'Unknown',
        accountName: 'Unknown',
        accountMask: '****',
        accountType: 'depository',
        balance: { current: 0, available: 0 },
      },
      customerInfo: {
        firstName: application.customer.firstName,
        lastName: application.customer.lastName,
        email: application.customer.email,
        dateOfBirth: data.dateOfBirth,
      },
    })
    
    console.log('📊 Decision result:', {
      approved: decisionResult.approved,
      score: decisionResult.score,
      maxLoanAmount: decisionResult.maxLoanAmount,
      positiveFactors: decisionResult.positiveFactors.length,
      riskFactors: decisionResult.riskFactors.length,
    })
    
    // Create decision record
    const decision = await prisma.decision.create({
      data: {
        applicationId: application.id,
        score: decisionResult.score,
        decisionStatus: decisionResult.approved ? 'approved' : 'declined',
        decisionReason: decisionResult.decisionReason,
        ruleHits: [...decisionResult.riskFactors, ...decisionResult.positiveFactors],
        evaluatorVersion: 'v1.0-plaid',
        decidedBy: 'system',
      },
    })

    console.log('✅ Decision created:', decision.id, 'Score:', decisionResult.score, 'Status:', decision.decisionStatus)

    // Generate offers based on decision
    const generatedOffers = generateOffers(loanAmount, decisionResult.score, decisionResult.approved)
    
    const offers = []
    for (const offerData of generatedOffers) {
      const offer = await prisma.offer.create({
        data: {
          decisionId: decision.id,
          termMonths: offerData.termMonths,
          apr: offerData.apr,
          monthlyPayment: offerData.monthlyPayment,
          downPayment: offerData.downPayment,
          originationFee: offerData.originationFee,
          totalAmount: offerData.totalAmount,
          selected: false,
        },
      })
      offers.push(offer)
    }

    console.log('✅ Generated', offers.length, 'financing offers')

    // 9b. Check if manual review is needed
    const needsManualReview = shouldTriggerManualReview(decisionResult, loanAmount, existingPlaidData)
    
    if (needsManualReview.needed) {
      await prisma.manualReview.create({
        data: {
          decisionId: decision.id,
          reason: needsManualReview.reason,
          priority: needsManualReview.priority,
          status: 'pending',
        },
      })
      console.log('⚠️ Manual review created:', needsManualReview.reason)
    }

    // 10. Return success with offers
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      application_id: application.id,
      decision: {
        id: decision.id,
        status: decision.decisionStatus,
        score: decision.score,
        reason: decisionResult.decisionReason,
        positiveFactors: decisionResult.positiveFactors,
        riskFactors: decisionResult.riskFactors,
        dataUsed: decisionResult.dataUsed,
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

/**
 * Determine if an application needs manual review
 */
function shouldTriggerManualReview(
  decisionResult: {
    approved: boolean
    score: number
    riskFactors: string[]
  },
  loanAmount: number,
  plaidData: any
): { needed: boolean; reason: string; priority: number } {
  // High priority: Borderline score (near threshold)
  if (decisionResult.score >= 550 && decisionResult.score < 620) {
    return { needed: true, reason: 'borderline_score', priority: 1 }
  }
  
  // High priority: Manual bank entry with large loan
  if (plaidData?.manualEntry && loanAmount > 3000) {
    return { needed: true, reason: 'manual_bank_entry', priority: 1 }
  }
  
  // Medium priority: High loan amount
  if (loanAmount > 15000) {
    return { needed: true, reason: 'high_amount', priority: 2 }
  }
  
  // Medium priority: Multiple risk factors but still approved
  if (decisionResult.approved && decisionResult.riskFactors.length >= 3) {
    return { needed: true, reason: 'multiple_risk_factors', priority: 2 }
  }
  
  // Low priority: No balance data but approved
  if (decisionResult.approved && !plaidData?.balance) {
    return { needed: true, reason: 'thin_file', priority: 3 }
  }
  
  return { needed: false, reason: '', priority: 0 }
}
