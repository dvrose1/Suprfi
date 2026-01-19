// ABOUTME: Payoff calculation service for early loan payoff
// ABOUTME: Calculates remaining principal, accrued interest, and total payoff amount

import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

export interface PayoffQuote {
  loanId: string
  remainingPrincipal: number
  accruedInterest: number
  fees: number
  totalPayoff: number
  validUntil: Date
  breakdown: {
    originalPrincipal: number
    principalPaid: number
    interestPaid: number
    paymentsCompleted: number
    paymentsRemaining: number
  }
}

/**
 * Calculate the payoff amount for a loan
 * Uses simple interest calculation for remaining balance
 */
export async function calculatePayoffQuote(loanId: string): Promise<PayoffQuote | null> {
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: {
      application: {
        include: {
          decision: {
            include: {
              offers: true,
            },
          },
        },
      },
      payments: {
        orderBy: { paymentNumber: 'asc' },
      },
    },
  })

  if (!loan) {
    return null
  }

  // Get the selected offer terms (find the one marked as selected)
  const selectedOffer = loan.application.decision?.offers.find(
    (o) => o.selected === true
  )

  const apr = selectedOffer?.apr ? Number(selectedOffer.apr) : 0
  const fundedAmount = Number(loan.fundedAmount)
  
  // Calculate completed and remaining payments
  const completedPayments = loan.payments.filter(p => p.status === 'completed')
  const remainingPayments = loan.payments.filter(p => 
    p.status === 'scheduled' || p.status === 'pending' || p.status === 'overdue'
  )

  // Calculate total principal and interest paid so far
  let principalPaid = 0
  let interestPaid = 0
  
  // For amortized loans, each payment has principal + interest components
  // We'll use a simplified calculation based on the loan balance
  const totalPaid = completedPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  )

  // Calculate remaining principal using amortization
  // For simplicity, we'll calculate based on remaining scheduled payments
  const remainingScheduledTotal = remainingPayments.reduce(
    (sum, p) => sum + Number(p.amount),
    0
  )

  // Calculate what portion is principal vs interest
  // Using average interest ratio from remaining payments
  const monthlyRate = apr / 100 / 12
  
  // Remaining principal calculation
  // This is a simplified approach - in production, track principal/interest per payment
  let remainingPrincipal = 0
  
  if (remainingPayments.length > 0 && monthlyRate > 0) {
    // Use present value of remaining payments formula
    const monthlyPayment = Number(remainingPayments[0].amount)
    const n = remainingPayments.length
    
    // PV = PMT * [(1 - (1 + r)^-n) / r]
    remainingPrincipal = monthlyPayment * 
      ((1 - Math.pow(1 + monthlyRate, -n)) / monthlyRate)
  } else if (remainingPayments.length > 0) {
    // No interest - remaining principal is sum of remaining payments
    remainingPrincipal = remainingScheduledTotal
  }

  // Calculate accrued interest since last payment
  // Days since last payment or funding date
  const lastPaymentDate = completedPayments.length > 0
    ? completedPayments[completedPayments.length - 1].completedAt
    : loan.fundingDate

  const daysSinceLastPayment = lastPaymentDate
    ? Math.floor((Date.now() - new Date(lastPaymentDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0

  // Daily interest rate
  const dailyRate = apr / 100 / 365
  const accruedInterest = remainingPrincipal * dailyRate * daysSinceLastPayment

  // Early payoff fee (if any) - currently 0
  const fees = 0

  // Total payoff amount
  const totalPayoff = remainingPrincipal + accruedInterest + fees

  // Quote valid for 10 days
  const validUntil = new Date()
  validUntil.setDate(validUntil.getDate() + 10)

  // Calculate principal and interest paid from completed payments
  // Simplified: assume equal split for now
  const totalScheduledAmount = selectedOffer?.totalAmount 
    ? Number(selectedOffer.totalAmount) 
    : fundedAmount
  const totalInterest = totalScheduledAmount - fundedAmount
  const interestRatio = totalInterest / totalScheduledAmount

  principalPaid = totalPaid * (1 - interestRatio)
  interestPaid = totalPaid * interestRatio

  return {
    loanId,
    remainingPrincipal: Math.round(remainingPrincipal * 100) / 100,
    accruedInterest: Math.round(accruedInterest * 100) / 100,
    fees,
    totalPayoff: Math.round(totalPayoff * 100) / 100,
    validUntil,
    breakdown: {
      originalPrincipal: fundedAmount,
      principalPaid: Math.round(principalPaid * 100) / 100,
      interestPaid: Math.round(interestPaid * 100) / 100,
      paymentsCompleted: completedPayments.length,
      paymentsRemaining: remainingPayments.length,
    },
  }
}

/**
 * Process a loan payoff
 * Marks remaining payments as cancelled and updates loan status
 */
export async function processPayoff(
  loanId: string,
  payoffPaymentId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update loan status
    await prisma.loan.update({
      where: { id: loanId },
      data: {
        status: 'paid_off',
        daysOverdue: 0,
        updatedAt: new Date(),
      },
    })

    // Cancel all remaining scheduled payments (except the payoff payment)
    await prisma.payment.updateMany({
      where: {
        loanId,
        status: { in: ['scheduled', 'pending', 'overdue'] },
        id: { not: payoffPaymentId },
      },
      data: {
        status: 'cancelled',
        updatedAt: new Date(),
      },
    })

    return { success: true }
  } catch (error: any) {
    console.error('Payoff processing error:', error)
    return { success: false, error: error.message }
  }
}
