// ABOUTME: Admin endpoint to retry a failed payment
// ABOUTME: Resets the payment for processing in next cron run

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
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        loan: true,
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

    if (payment.loan.status === 'defaulted' || payment.loan.status === 'paid_off') {
      return NextResponse.json(
        { error: 'Cannot retry payment for this loan status' },
        { status: 400 }
      )
    }

    // Reset payment for retry
    await prisma.payment.update({
      where: { id },
      data: {
        status: 'scheduled',
        nextRetryDate: new Date(), // Process in next cron run
        failureReason: null,
        failureCode: null,
        plaidTransferId: null,
        requiresAction: false,
        updatedAt: new Date(),
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'payment',
        entityId: id,
        actor: user.id,
        action: 'manual_retry',
        payload: {
          previousStatus: payment.status,
          retriedBy: user.email,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Payment scheduled for retry',
    })
  } catch (error: any) {
    console.error('Payment retry error:', error)
    return NextResponse.json(
      { error: 'Failed to retry payment' },
      { status: 500 }
    )
  }
}
