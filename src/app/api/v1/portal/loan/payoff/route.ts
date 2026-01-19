// ABOUTME: API endpoint to initiate loan payoff
// ABOUTME: Creates a payoff payment and initiates ACH transfer

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getBorrowerSessionFromCookies } from '@/lib/auth/borrower-session'
import { calculatePayoffQuote, processPayoff } from '@/lib/services/payoff-calculator'
import { initiatePayment } from '@/lib/services/plaid-transfer'

export async function POST(request: Request) {
  try {
    const borrower = await getBorrowerSessionFromCookies()
    if (!borrower) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { loanId } = body

    if (!loanId) {
      return NextResponse.json(
        { error: 'Loan ID is required' },
        { status: 400 }
      )
    }

    // Verify the loan belongs to this borrower
    const loan = await prisma.loan.findUnique({
      where: { id: loanId },
      include: {
        application: {
          include: {
            customer: true,
          },
        },
        payments: true,
      },
    })

    if (!loan) {
      return NextResponse.json(
        { error: 'Loan not found' },
        { status: 404 }
      )
    }

    if (loan.application.customer.id !== borrower.customerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check loan is eligible for payoff
    if (loan.status === 'paid_off') {
      return NextResponse.json(
        { error: 'Loan is already paid off' },
        { status: 400 }
      )
    }

    if (loan.status !== 'funded' && loan.status !== 'repaying') {
      return NextResponse.json(
        { error: 'Loan is not eligible for payoff' },
        { status: 400 }
      )
    }

    // Calculate current payoff amount
    const quote = await calculatePayoffQuote(loanId)
    if (!quote) {
      return NextResponse.json(
        { error: 'Failed to calculate payoff amount' },
        { status: 500 }
      )
    }

    // Get bank account info
    const plaidData = loan.application.plaidData as any
    if (!plaidData?.accessToken || !plaidData?.accountId) {
      return NextResponse.json(
        { error: 'No bank account linked. Please update your bank account first.' },
        { status: 400 }
      )
    }

    // Create a payoff payment record
    const lastPaymentNumber = loan.payments.reduce(
      (max, p) => Math.max(max, p.paymentNumber),
      0
    )

    const payoffPayment = await prisma.payment.create({
      data: {
        loanId,
        paymentNumber: lastPaymentNumber + 1,
        amount: quote.totalPayoff,
        principal: quote.remainingPrincipal,
        interest: quote.accruedInterest,
        dueDate: new Date(),
        status: 'pending',
      },
    })

    // Initiate the payment
    const result = await initiatePayment(
      payoffPayment.id,
      plaidData.accessToken,
      plaidData.accountId,
      quote.totalPayoff,
      `SuprFi Loan Payoff - ${loan.id.slice(-8).toUpperCase()}`
    )

    if (!result.success) {
      // Clean up the payment record on failure
      await prisma.payment.delete({ where: { id: payoffPayment.id } })
      
      return NextResponse.json(
        { error: result.error || 'Failed to initiate payoff payment' },
        { status: 500 }
      )
    }

    // Update payment with transfer ID
    await prisma.payment.update({
      where: { id: payoffPayment.id },
      data: {
        plaidTransferId: result.transferId,
        status: 'processing',
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'loan',
        entityId: loanId,
        actor: borrower.customerId,
        action: 'payoff_initiated',
        payload: {
          payoffAmount: quote.totalPayoff,
          remainingPrincipal: quote.remainingPrincipal,
          accruedInterest: quote.accruedInterest,
          paymentId: payoffPayment.id,
          plaidTransferId: result.transferId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Payoff payment initiated. It may take 1-2 business days to process.',
      payoffAmount: quote.totalPayoff,
      paymentId: payoffPayment.id,
    })
  } catch (error: any) {
    console.error('Payoff error:', error)
    return NextResponse.json(
      { error: 'Failed to process payoff' },
      { status: 500 }
    )
  }
}
