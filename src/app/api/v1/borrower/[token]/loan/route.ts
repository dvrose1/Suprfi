import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyApplicationToken } from '@/lib/utils/token'

/**
 * GET /api/v1/borrower/:token/loan
 * Get loan details for the application
 */
export async function GET(
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

    // Get application with loan
    const application = await prisma.application.findUnique({
      where: { id: decoded.applicationId },
      include: {
        customer: true,
        job: true,
        loan: true,
      },
    })

    if (!application) {
      return NextResponse.json(
        { success: false, error: 'Application not found' },
        { status: 404 }
      )
    }

    if (!application.loan) {
      return NextResponse.json(
        { success: false, error: 'No loan found for this application' },
        { status: 404 }
      )
    }

    const loan = application.loan
    const paymentSchedule = loan.paymentSchedule as {
      type?: string
      name?: string
      termMonths?: number
      termWeeks?: number
      apr?: number
      monthlyPayment?: number
      installmentAmount?: number
      numberOfPayments?: number
      downPayment?: number
    } | null

    // Determine payment frequency based on plan type
    const isBNPL = paymentSchedule?.type === 'bnpl'
    const paymentFrequency = paymentSchedule?.termWeeks ? 'biweekly' : 'monthly'
    const paymentAmount = paymentSchedule?.installmentAmount || paymentSchedule?.monthlyPayment || 0

    return NextResponse.json({
      success: true,
      loan: {
        id: loan.id,
        loanNumber: loan.lenderLoanId,
        fundedAmount: Number(loan.fundedAmount),
        paymentAmount,
        paymentFrequency,
        numberOfPayments: paymentSchedule?.numberOfPayments || 0,
        apr: paymentSchedule?.apr || 0,
        termMonths: paymentSchedule?.termMonths || 0,
        termWeeks: paymentSchedule?.termWeeks || 0,
        planType: paymentSchedule?.type || 'installment',
        planName: paymentSchedule?.name || 'Payment Plan',
        downPayment: paymentSchedule?.downPayment || 0,
        status: loan.status,
        fundingDate: loan.fundingDate?.toISOString(),
        customer: {
          firstName: application.customer.firstName,
          lastName: application.customer.lastName,
          email: application.customer.email,
        },
        job: {
          serviceType: application.job.serviceType,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching loan:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch loan details' },
      { status: 500 }
    )
  }
}
