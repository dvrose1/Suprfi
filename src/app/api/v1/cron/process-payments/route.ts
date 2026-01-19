// ABOUTME: Cron endpoint for daily payment processing
// ABOUTME: Processes due payments via ACH using Plaid Transfer

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { 
  initiatePayment, 
  getPlaidCredentialsForLoan,
  syncPendingTransfers,
  scheduleRetry,
} from '@/lib/services/plaid-transfer'

// Verify cron secret to prevent unauthorized access
function verifyCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret) {
    console.warn('CRON_SECRET not configured - allowing request in development')
    return process.env.NODE_ENV === 'development'
  }
  
  return authHeader === `Bearer ${cronSecret}`
}

/**
 * POST /api/v1/cron/process-payments
 * Process all due payments for today
 * 
 * Called by Vercel Cron or manually for testing
 */
export async function POST(request: NextRequest) {
  // Verify authorization
  if (!verifyCronSecret(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const startTime = Date.now()
  const results = {
    processed: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    retryScheduled: 0,
    errors: [] as string[],
    syncResults: null as any,
  }

  try {
    // First, sync any pending transfers to get latest status
    console.log('Syncing pending transfers...')
    results.syncResults = await syncPendingTransfers()
    
    // Get payments due today or overdue
    const today = new Date()
    today.setHours(23, 59, 59, 999) // End of today
    
    const duePayments = await prisma.payment.findMany({
      where: {
        OR: [
          // Scheduled payments due today or earlier
          {
            status: 'scheduled',
            dueDate: { lte: today },
          },
          // Payments scheduled for retry
          {
            status: 'scheduled',
            nextRetryDate: { lte: today },
            retryCount: { gt: 0 },
          },
        ],
        // Only for active loans
        loan: {
          status: { in: ['funded', 'repaying'] },
        },
      },
      include: {
        loan: {
          include: {
            application: true,
          },
        },
      },
      orderBy: [
        { dueDate: 'asc' },
        { paymentNumber: 'asc' },
      ],
    })

    console.log(`Found ${duePayments.length} payments to process`)

    for (const payment of duePayments) {
      results.processed++

      try {
        // Get Plaid credentials for this loan
        const credentials = await getPlaidCredentialsForLoan(payment.loanId)
        
        if (!credentials.accessToken || !credentials.accountId) {
          console.warn(`Payment ${payment.id}: No Plaid credentials, skipping`)
          results.skipped++
          
          // Mark as requiring action
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'failed',
              failureReason: 'No bank account linked',
              requiresAction: true,
              updatedAt: new Date(),
            },
          })
          continue
        }

        // Mark as pending before processing
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'pending',
            updatedAt: new Date(),
          },
        })

        // Initiate the ACH transfer
        const result = await initiatePayment(
          payment.id,
          credentials.accessToken,
          credentials.accountId,
          Number(payment.amount),
          `SuprFi Pmt ${payment.paymentNumber}`
        )

        if (result.success) {
          results.successful++
          console.log(`Payment ${payment.id}: ACH initiated, transfer ID: ${result.transferId}`)
        } else {
          results.failed++
          console.error(`Payment ${payment.id}: Failed - ${result.error}`)
          
          // Try to schedule retry
          const retryScheduled = await scheduleRetry(payment.id)
          if (retryScheduled) {
            results.retryScheduled++
          }
        }

      } catch (error: any) {
        results.failed++
        results.errors.push(`Payment ${payment.id}: ${error.message}`)
        console.error(`Payment ${payment.id}: Error - ${error.message}`)
      }
    }

    // Update overdue payments
    const overdueCount = await markOverduePayments()
    
    const duration = Date.now() - startTime

    // Audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'cron',
        entityId: 'process-payments',
        actor: 'system',
        action: 'payment_processing_complete',
        payload: {
          ...results,
          overdueMarked: overdueCount,
          durationMs: duration,
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Payment processing complete',
      results: {
        ...results,
        overdueMarked: overdueCount,
        durationMs: duration,
      },
    })

  } catch (error: any) {
    console.error('Cron job error:', error)
    
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
 * Mark scheduled payments as overdue if past due date
 */
async function markOverduePayments(): Promise<number> {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(23, 59, 59, 999)

  const result = await prisma.payment.updateMany({
    where: {
      status: 'scheduled',
      dueDate: { lt: yesterday },
      loan: {
        status: { in: ['funded', 'repaying'] },
      },
    },
    data: {
      status: 'overdue',
      updatedAt: new Date(),
    },
  })

  if (result.count > 0) {
    console.log(`Marked ${result.count} payments as overdue`)
  }

  return result.count
}

/**
 * GET /api/v1/cron/process-payments
 * Get status of payment processing (for monitoring)
 */
export async function GET(request: NextRequest) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }

  const today = new Date()
  today.setHours(23, 59, 59, 999)

  const [
    dueToday,
    processing,
    overdue,
    failedNeedingAction,
    completedToday,
  ] = await Promise.all([
    prisma.payment.count({
      where: {
        status: 'scheduled',
        dueDate: { lte: today },
      },
    }),
    prisma.payment.count({
      where: { status: 'processing' },
    }),
    prisma.payment.count({
      where: { status: 'overdue' },
    }),
    prisma.payment.count({
      where: {
        status: 'failed',
        requiresAction: true,
      },
    }),
    prisma.payment.count({
      where: {
        status: 'completed',
        completedAt: {
          gte: new Date(today.setHours(0, 0, 0, 0)),
        },
      },
    }),
  ])

  return NextResponse.json({
    status: 'ok',
    payments: {
      dueToday,
      processing,
      overdue,
      failedNeedingAction,
      completedToday,
    },
  })
}
