// ABOUTME: API endpoint for borrowers to pay a scheduled payment early
// ABOUTME: Initiates an ACH transfer for the next scheduled payment

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getBorrowerSessionFromCookies } from '@/lib/auth/borrower-session'
import { initiatePayment } from '@/lib/services/plaid-transfer'

export async function POST(request: Request) {
  try {
    const borrower = await getBorrowerSessionFromCookies()
    if (!borrower) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { paymentId } = body

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      )
    }

    // Get the payment and verify it belongs to this borrower
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        loan: {
          include: {
            application: {
              include: {
                customer: true,
              },
            },
          },
        },
      },
    })

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      )
    }

    // Verify the payment belongs to this borrower
    if (payment.loan.application.customer.id !== borrower.customerId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check payment status
    if (payment.status === 'completed') {
      return NextResponse.json(
        { error: 'This payment has already been completed' },
        { status: 400 }
      )
    }

    if (payment.status === 'processing' || payment.status === 'pending') {
      return NextResponse.json(
        { error: 'This payment is already being processed' },
        { status: 400 }
      )
    }

    // Get bank account info (from Plaid data)
    const plaidData = payment.loan.application.plaidData as any
    if (!plaidData?.accessToken || !plaidData?.accountId) {
      return NextResponse.json(
        { error: 'No bank account linked. Please update your bank account first.' },
        { status: 400 }
      )
    }

    // Initiate the payment
    const result = await initiatePayment(
      payment.id,
      plaidData.accessToken,
      plaidData.accountId,
      Number(payment.amount),
      `SuprFi Loan Payment #${payment.paymentNumber}`
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to initiate payment' },
        { status: 500 }
      )
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'payment',
        entityId: payment.id,
        actor: borrower.id,
        action: 'early_payment_initiated',
        payload: {
          paymentNumber: payment.paymentNumber,
          amount: payment.amount,
          originalDueDate: payment.dueDate,
          plaidTransferId: result.transferId,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Payment initiated successfully. It may take 1-2 business days to process.',
      transferId: result.transferId,
    })
  } catch (error: any) {
    console.error('Pay early error:', error)
    return NextResponse.json(
      { error: 'Failed to process payment' },
      { status: 500 }
    )
  }
}
