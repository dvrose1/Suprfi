// ABOUTME: Admin endpoint to manually mark a payment as paid
// ABOUTME: Used when payment was received outside the system (check, cash, etc.)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession, SESSION_COOKIE_CONFIG } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Validate session
  const sessionToken = request.cookies.get(SESSION_COOKIE_CONFIG.name)?.value
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await validateSession(sessionToken)
  if (!user) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  const { id } = await params

  try {
    const body = await request.json()
    const { note } = body

    if (!note) {
      return NextResponse.json(
        { error: 'Note is required when marking payment as paid manually' },
        { status: 400 }
      )
    }

    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        loan: {
          include: {
            payments: true,
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

    if (payment.status === 'completed') {
      return NextResponse.json(
        { error: 'Payment already completed' },
        { status: 400 }
      )
    }

    // Mark payment as completed
    await prisma.payment.update({
      where: { id },
      data: {
        status: 'completed',
        completedAt: new Date(),
        failureReason: null,
        failureCode: null,
        requiresAction: false,
        updatedAt: new Date(),
      },
    })

    // Check if all payments are complete
    const allPayments = payment.loan.payments
    const completedCount = allPayments.filter(
      p => p.status === 'completed' || p.id === id
    ).length
    const allComplete = completedCount === allPayments.length

    // Update loan status
    let newLoanStatus = payment.loan.status
    if (allComplete) {
      newLoanStatus = 'paid_off'
    } else if (payment.loan.status === 'funded') {
      newLoanStatus = 'repaying'
    }

    if (newLoanStatus !== payment.loan.status) {
      await prisma.loan.update({
        where: { id: payment.loanId },
        data: {
          status: newLoanStatus,
          daysOverdue: 0,
          updatedAt: new Date(),
        },
      })
    }

    // Audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'payment',
        entityId: id,
        actor: user.id,
        action: 'manual_mark_paid',
        payload: {
          previousStatus: payment.status,
          note,
          markedBy: user.email,
          newLoanStatus,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Payment marked as paid',
      loanStatus: newLoanStatus,
    })
  } catch (error: any) {
    console.error('Mark paid error:', error)
    return NextResponse.json(
      { error: 'Failed to mark payment as paid' },
      { status: 500 }
    )
  }
}
