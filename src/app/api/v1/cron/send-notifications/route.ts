// ABOUTME: Cron endpoint for sending payment notifications
// ABOUTME: Sends reminders, overdue notices, and other payment-related communications

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  sendPaymentReminders,
  sendOverdueNotifications,
} from '@/lib/services/payment-notifications'

// Verify cron secret
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret) {
    return process.env.NODE_ENV === 'development'
  }
  
  return authHeader === `Bearer ${cronSecret}`
}

/**
 * POST /api/v1/cron/send-notifications
 * Send all payment-related notifications
 */
export async function POST(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const startTime = Date.now()
  const results = {
    reminders: { sent: 0, failed: 0, errors: [] as string[] },
    overdue: { sent: 0, failed: 0, errors: [] as string[] },
  }

  try {
    // Send payment reminders (3 days before due)
    console.log('Sending payment reminders...')
    results.reminders = await sendPaymentReminders()
    
    // Send overdue notifications
    console.log('Sending overdue notifications...')
    results.overdue = await sendOverdueNotifications()

    const duration = Date.now() - startTime

    // Audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'cron',
        entityId: 'send-notifications',
        actor: 'system',
        action: 'notifications_sent',
        payload: {
          ...results,
          durationMs: duration,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Notifications sent',
      results: {
        reminders: results.reminders,
        overdue: results.overdue,
        durationMs: duration,
      },
    })

  } catch (error: any) {
    console.error('Notification cron error:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: error.message,
        results,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/v1/cron/send-notifications
 * Get notification status
 */
export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

  const [
    paymentsDueSoon,
    overduePayments,
    recentNotifications,
  ] = await Promise.all([
    // Payments due in next 3 days
    prisma.payment.count({
      where: {
        status: 'scheduled',
        dueDate: { lte: threeDaysFromNow },
        loan: { status: { in: ['funded', 'repaying'] } },
      },
    }),
    // Overdue payments
    prisma.payment.count({
      where: { status: 'overdue' },
    }),
    // Notifications sent in last 24 hours
    prisma.auditLog.count({
      where: {
        entityType: 'notification',
        timestamp: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
  ])

  return NextResponse.json({
    status: 'ok',
    queue: {
      paymentsDueSoon,
      overduePayments,
      notificationsSent24h: recentNotifications,
    },
  })
}
