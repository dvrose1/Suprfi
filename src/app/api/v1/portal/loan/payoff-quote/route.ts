// ABOUTME: API endpoint to get payoff quote for a loan
// ABOUTME: Returns remaining principal, accrued interest, and total payoff amount

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getBorrowerSessionFromCookies } from '@/lib/auth/borrower-session'
import { calculatePayoffQuote } from '@/lib/services/payoff-calculator'

export async function GET(request: NextRequest) {
  try {
    const borrower = await getBorrowerSessionFromCookies()
    if (!borrower) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const loanId = searchParams.get('loanId')

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

    if (loan.status === 'defaulted') {
      return NextResponse.json(
        { error: 'Loan is in default. Please contact support.' },
        { status: 400 }
      )
    }

    if (loan.status !== 'funded' && loan.status !== 'repaying') {
      return NextResponse.json(
        { error: 'Loan is not eligible for payoff' },
        { status: 400 }
      )
    }

    // Calculate payoff quote
    const quote = await calculatePayoffQuote(loanId)

    if (!quote) {
      return NextResponse.json(
        { error: 'Failed to calculate payoff quote' },
        { status: 500 }
      )
    }

    return NextResponse.json(quote)
  } catch (error: any) {
    console.error('Payoff quote error:', error)
    return NextResponse.json(
      { error: 'Failed to get payoff quote' },
      { status: 500 }
    )
  }
}
