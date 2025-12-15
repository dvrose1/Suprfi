import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth/api'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication
    const { user, error } = await requireAuth(request)
    if (error) return error

    const { id } = await params

    // Fetch application with all related data
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        customer: true,
        job: true,
        decision: {
          include: {
            offers: {
              orderBy: { termMonths: 'asc' },
            },
          },
        },
        loan: true,
      },
    })

    if (!application) {
      return NextResponse.json({
        success: false,
        error: 'Application not found',
      }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      application: {
        id: application.id,
        status: application.status,
        createdAt: application.createdAt.toISOString(),
        updatedAt: application.updatedAt.toISOString(),
        customer: {
          id: application.customer.id,
          firstName: application.customer.firstName,
          lastName: application.customer.lastName,
          email: application.customer.email,
          phone: application.customer.phone,
          addressLine1: application.customer.addressLine1,
          addressLine2: application.customer.addressLine2,
          city: application.customer.city,
          state: application.customer.state,
          postalCode: application.customer.postalCode,
        },
        job: {
          id: application.job.id,
          estimateAmount: Number(application.job.estimateAmount),
          serviceType: application.job.serviceType,
          status: application.job.status,
        },
        decision: application.decision ? {
          id: application.decision.id,
          score: application.decision.score,
          decisionStatus: application.decision.decisionStatus,
          decisionReason: application.decision.decisionReason,
          ruleHits: application.decision.ruleHits || [],
          evaluatorVersion: application.decision.evaluatorVersion,
          decidedAt: application.decision.decidedAt.toISOString(),
          decidedBy: application.decision.decidedBy,
          offers: application.decision.offers.map(offer => ({
            id: offer.id,
            termMonths: offer.termMonths,
            apr: Number(offer.apr),
            monthlyPayment: Number(offer.monthlyPayment),
            downPayment: Number(offer.downPayment),
            originationFee: Number(offer.originationFee),
            totalAmount: Number(offer.totalAmount),
            selected: offer.selected,
          })),
        } : null,
        plaidData: application.plaidData,
        personaData: application.personaData,
        creditData: application.creditData,
        loan: application.loan ? {
          id: application.loan.id,
          lenderLoanId: application.loan.lenderLoanId,
          lenderName: application.loan.lenderName,
          fundedAmount: Number(application.loan.fundedAmount),
          fundingDate: application.loan.fundingDate?.toISOString(),
          status: application.loan.status,
          paymentSchedule: application.loan.paymentSchedule,
        } : null,
      },
    })
  } catch (error) {
    console.error('Error fetching application:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch application',
    }, { status: 500 })
  }
}
