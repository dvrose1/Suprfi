import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { verifyApplicationToken } from '@/lib/utils/token'

const SignAgreementSchema = z.object({
  offerId: z.string().min(1),
  signature: z.string().min(2),
  consents: z.object({
    reviewedTerms: z.boolean(),
    agreeToPayments: z.boolean(),
    electronicSignature: z.boolean(),
    signedAt: z.string(),
  }),
})

/**
 * POST /api/v1/borrower/:token/agreement/sign
 * Sign the loan agreement
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params

    // Verify token
    const decoded = verifyApplicationToken(token)
    if (!decoded) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Parse request
    const body = await request.json()
    const data = SignAgreementSchema.parse(body)

    // Verify all consents are true
    if (!data.consents.reviewedTerms || !data.consents.agreeToPayments || !data.consents.electronicSignature) {
      return NextResponse.json(
        { success: false, error: 'All consents must be accepted' },
        { status: 400 }
      )
    }

    // Get application
    const application = await prisma.application.findUnique({
      where: { id: decoded.applicationId },
      include: {
        customer: true,
        decision: {
          include: { offers: true },
        },
      },
    })

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    if (!application.decision) {
      return NextResponse.json(
        { success: false, error: 'No decision found' },
        { status: 400 }
      )
    }

    // Find the offer
    const offer = application.decision.offers.find(o => o.id === data.offerId)
    if (!offer) {
      return NextResponse.json(
        { success: false, error: 'Offer not found' },
        { status: 404 }
      )
    }

    // Make sure this offer is selected
    if (!offer.selected) {
      // Select it now
      await prisma.offer.update({
        where: { id: offer.id },
        data: { selected: true },
      })
    }

    // Update application status to 'funded' (in production, this would go through more steps)
    await prisma.application.update({
      where: { id: application.id },
      data: { 
        status: 'funded',
        creditData: {
          ...(application.creditData as object || {}),
          agreementSigned: true,
          signature: data.signature,
          signedAt: data.consents.signedAt,
          consents: data.consents,
        },
      },
    })

    // Create loan record
    const loan = await prisma.loan.create({
      data: {
        applicationId: application.id,
        lenderLoanId: `SUPRFI-${Date.now()}`,
        lenderName: 'SuprFi',
        fundedAmount: Number(offer.totalAmount) - Number(offer.downPayment),
        fundingDate: new Date(),
        status: 'active',
        paymentSchedule: {
          offerId: offer.id,
          termMonths: offer.termMonths,
          apr: Number(offer.apr),
          monthlyPayment: Number(offer.monthlyPayment),
          totalAmount: Number(offer.totalAmount),
          downPayment: Number(offer.downPayment),
        },
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'loan',
        entityId: loan.id,
        actor: application.customerId,
        action: 'agreement_signed',
        payload: {
          applicationId: application.id,
          offerId: offer.id,
          signature: data.signature,
          signedAt: data.consents.signedAt,
          termMonths: offer.termMonths,
          apr: Number(offer.apr),
          monthlyPayment: Number(offer.monthlyPayment),
        },
      },
    })

    console.log('✅ Agreement signed, loan created:', loan.id)

    return NextResponse.json({
      success: true,
      message: 'Agreement signed successfully',
      loanId: loan.id,
      loanNumber: loan.lenderLoanId,
    })
  } catch (error) {
    console.error('Error signing agreement:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to sign agreement' },
      { status: 500 }
    )
  }
}
