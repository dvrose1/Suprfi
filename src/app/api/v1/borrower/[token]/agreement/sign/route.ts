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

    // Check for client-generated offer in creditData first
    const creditData = application.creditData as Record<string, unknown> | null
    const selectedOffer = creditData?.selectedOffer as Record<string, unknown> | null

    let offerData: {
      id: string
      type?: string
      name?: string
      termMonths?: number
      termWeeks?: number
      apr: number
      monthlyPayment: number
      totalAmount: number
      downPayment: number
      installmentAmount?: number
      numberOfPayments?: number
      loanAmount?: number
    }

    if (selectedOffer && selectedOffer.id === data.offerId) {
      // Use client-generated offer (BNPL format)
      offerData = {
        id: selectedOffer.id as string,
        type: selectedOffer.type as string,
        name: selectedOffer.name as string,
        termMonths: selectedOffer.termMonths as number | undefined,
        termWeeks: selectedOffer.termWeeks as number | undefined,
        apr: selectedOffer.apr as number,
        monthlyPayment: (selectedOffer.installmentAmount || selectedOffer.monthlyPayment) as number,
        totalAmount: selectedOffer.totalAmount as number,
        downPayment: (selectedOffer.downPaymentAmount || 0) as number,
        installmentAmount: selectedOffer.installmentAmount as number,
        numberOfPayments: selectedOffer.numberOfPayments as number,
        loanAmount: selectedOffer.loanAmount as number,
      }
    } else {
      // Legacy: Check database offers
      if (!application.decision) {
        return NextResponse.json(
          { success: false, error: 'No decision found' },
          { status: 400 }
        )
      }

      const dbOffer = application.decision.offers.find(o => o.id === data.offerId)
      if (!dbOffer) {
        return NextResponse.json(
          { success: false, error: 'Offer not found' },
          { status: 404 }
        )
      }

      // Make sure this offer is selected
      if (!dbOffer.selected) {
        await prisma.offer.update({
          where: { id: dbOffer.id },
          data: { selected: true },
        })
      }

      offerData = {
        id: dbOffer.id,
        termMonths: dbOffer.termMonths,
        apr: Number(dbOffer.apr),
        monthlyPayment: Number(dbOffer.monthlyPayment),
        totalAmount: Number(dbOffer.totalAmount),
        downPayment: Number(dbOffer.downPayment),
      }
    }

    // Update application status to 'funded'
    await prisma.application.update({
      where: { id: application.id },
      data: { 
        status: 'funded',
        creditData: {
          ...(creditData || {}),
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
        fundedAmount: (offerData.loanAmount || offerData.totalAmount) - offerData.downPayment,
        fundingDate: new Date(),
        status: 'active',
        paymentSchedule: {
          offerId: offerData.id,
          type: offerData.type,
          name: offerData.name,
          termMonths: offerData.termMonths,
          termWeeks: offerData.termWeeks,
          apr: offerData.apr,
          monthlyPayment: offerData.monthlyPayment,
          installmentAmount: offerData.installmentAmount,
          numberOfPayments: offerData.numberOfPayments,
          totalAmount: offerData.totalAmount,
          downPayment: offerData.downPayment,
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
          offerId: offerData.id,
          offerType: offerData.type,
          signature: data.signature,
          signedAt: data.consents.signedAt,
          termMonths: offerData.termMonths,
          apr: offerData.apr,
          monthlyPayment: offerData.monthlyPayment,
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
