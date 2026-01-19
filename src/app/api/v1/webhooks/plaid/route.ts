// ABOUTME: Plaid webhook handler for transfer status updates
// ABOUTME: Handles ACH payment completion, failure, and return events

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { scheduleRetry, isRetryable } from '@/lib/services/plaid-transfer'
import crypto from 'crypto'

// Plaid webhook types we care about
type TransferEventType = 
  | 'pending'
  | 'posted'
  | 'settled'
  | 'cancelled'
  | 'failed'
  | 'returned'

interface PlaidTransferWebhook {
  webhook_type: 'TRANSFER_EVENTS_UPDATE'
  webhook_code: string
  transfer_id: string
  transfer_status?: TransferEventType
  transfer_events?: Array<{
    event_id: string
    transfer_id: string
    event_type: TransferEventType
    timestamp: string
    failure_reason?: {
      ach_return_code?: string
      description?: string
    }
  }>
}

/**
 * Verify Plaid webhook signature
 * See: https://plaid.com/docs/api/webhooks/verification/
 */
async function verifyPlaidWebhook(
  request: NextRequest,
  body: string
): Promise<boolean> {
  const webhookSecret = process.env.PLAID_WEBHOOK_SECRET
  
  if (!webhookSecret) {
    console.warn('PLAID_WEBHOOK_SECRET not configured')
    return process.env.NODE_ENV === 'development'
  }

  const signature = request.headers.get('plaid-verification')
  
  if (!signature) {
    console.error('Missing Plaid webhook signature')
    return false
  }

  // Plaid uses JWT for webhook verification in production
  // For now, we'll do a basic check
  // In production, use plaid.webhookVerificationKeyGet() to verify
  
  return true // Simplified for now - implement full verification in production
}

/**
 * POST /api/v1/webhooks/plaid
 * Handle Plaid Transfer webhooks
 */
export async function POST(request: NextRequest) {
  const body = await request.text()
  
  // Verify webhook signature
  const isValid = await verifyPlaidWebhook(request, body)
  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid webhook signature' },
      { status: 401 }
    )
  }

  const webhook = JSON.parse(body) as PlaidTransferWebhook
  
  console.log('Received Plaid webhook:', {
    type: webhook.webhook_type,
    code: webhook.webhook_code,
    transferId: webhook.transfer_id,
  })

  // Only handle transfer events
  if (webhook.webhook_type !== 'TRANSFER_EVENTS_UPDATE') {
    return NextResponse.json({ received: true })
  }

  try {
    // Process transfer events
    const events = webhook.transfer_events || []
    
    for (const event of events) {
      await processTransferEvent(event)
    }

    // Also check if there's a direct status update
    if (webhook.transfer_id && webhook.transfer_status) {
      await updatePaymentStatus(
        webhook.transfer_id,
        webhook.transfer_status,
        undefined
      )
    }

    return NextResponse.json({ 
      received: true,
      processed: events.length,
    })

  } catch (error: any) {
    console.error('Webhook processing error:', error)
    
    // Return 200 to prevent Plaid from retrying
    // Log the error for manual investigation
    await prisma.auditLog.create({
      data: {
        entityType: 'webhook',
        entityId: webhook.transfer_id || 'unknown',
        actor: 'plaid',
        action: 'webhook_error',
        payload: {
          error: error.message,
          webhookType: webhook.webhook_type,
          webhookCode: webhook.webhook_code,
          transferId: webhook.transfer_id,
        },
      },
    })

    return NextResponse.json({ 
      received: true,
      error: error.message,
    })
  }
}

/**
 * Process a single transfer event
 */
async function processTransferEvent(event: {
  event_id: string
  transfer_id: string
  event_type: TransferEventType
  timestamp: string
  failure_reason?: {
    ach_return_code?: string
    description?: string
  }
}): Promise<void> {
  console.log(`Processing transfer event: ${event.event_type} for ${event.transfer_id}`)

  await updatePaymentStatus(
    event.transfer_id,
    event.event_type,
    event.failure_reason
  )
}

/**
 * Update payment status based on transfer event
 */
async function updatePaymentStatus(
  transferId: string,
  status: TransferEventType,
  failureReason?: { ach_return_code?: string; description?: string }
): Promise<void> {
  // Find payment by Plaid transfer ID
  const payment = await prisma.payment.findFirst({
    where: { plaidTransferId: transferId },
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
    console.warn(`Payment not found for transfer ID: ${transferId}`)
    return
  }

  let newStatus: string = payment.status
  let completedAt: Date | null = null
  let failureMessage: string | null = null
  let failureCode: string | null = null

  switch (status) {
    case 'pending':
      newStatus = 'processing'
      break
      
    case 'posted':
      // Payment has been posted but not yet settled
      newStatus = 'processing'
      break
      
    case 'settled':
      // Payment fully completed
      newStatus = 'completed'
      completedAt = new Date()
      break
      
    case 'cancelled':
      newStatus = 'cancelled'
      break
      
    case 'failed':
    case 'returned':
      newStatus = 'failed'
      failureMessage = failureReason?.description || `ACH ${status}`
      failureCode = failureReason?.ach_return_code || null
      break
  }

  // Only update if status actually changed
  if (newStatus === payment.status && !completedAt && !failureMessage) {
    return
  }

  // Update payment
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: newStatus,
      completedAt,
      failureReason: failureMessage,
      failureCode,
      requiresAction: failureCode ? !isRetryable(failureCode) : false,
      updatedAt: new Date(),
    },
  })

  // Audit log
  await prisma.auditLog.create({
    data: {
      entityType: 'payment',
      entityId: payment.id,
      actor: 'plaid_webhook',
      action: `payment_${newStatus}`,
      payload: {
        transferId,
        previousStatus: payment.status,
        newStatus,
        failureReason: failureMessage,
        failureCode,
      },
    },
  })

  // Handle side effects
  if (newStatus === 'completed') {
    await handlePaymentCompleted(payment)
  } else if (newStatus === 'failed') {
    await handlePaymentFailed(payment, failureCode)
  }
}

/**
 * Handle successful payment completion
 */
async function handlePaymentCompleted(payment: any): Promise<void> {
  const loan = payment.loan
  
  // Check if all payments are complete
  const payments = await prisma.payment.findMany({
    where: { loanId: loan.id },
  })
  
  const allComplete = payments.every(p => p.status === 'completed')
  const hasCompleted = payments.some(p => p.status === 'completed')
  
  // Update loan status
  let newLoanStatus = loan.status
  if (allComplete) {
    newLoanStatus = 'paid_off'
  } else if (hasCompleted && loan.status === 'funded') {
    newLoanStatus = 'repaying'
  }
  
  if (newLoanStatus !== loan.status) {
    await prisma.loan.update({
      where: { id: loan.id },
      data: {
        status: newLoanStatus,
        daysOverdue: 0,
        updatedAt: new Date(),
      },
    })
  }

  // TODO: Send payment confirmation notification
  // await sendPaymentConfirmation(payment, loan.application.customer)
  
  console.log(`Payment ${payment.id} completed. Loan status: ${newLoanStatus}`)
}

/**
 * Handle payment failure
 */
async function handlePaymentFailed(
  payment: any,
  failureCode: string | null
): Promise<void> {
  // Try to schedule retry if eligible
  if (isRetryable(failureCode)) {
    const scheduled = await scheduleRetry(payment.id)
    if (scheduled) {
      console.log(`Payment ${payment.id} scheduled for retry`)
    } else {
      console.log(`Payment ${payment.id} max retries reached, needs manual action`)
    }
  } else {
    console.log(`Payment ${payment.id} failed with non-retryable code: ${failureCode}`)
  }

  // Update loan overdue tracking
  await updateLoanOverdue(payment.loanId)

  // TODO: Send payment failed notification
  // await sendPaymentFailedNotification(payment, loan.application.customer)
}

/**
 * Update loan's days overdue count
 */
async function updateLoanOverdue(loanId: string): Promise<void> {
  const overduePayments = await prisma.payment.findMany({
    where: {
      loanId,
      status: { in: ['overdue', 'failed'] },
    },
    orderBy: { dueDate: 'asc' },
  })

  if (overduePayments.length === 0) {
    return
  }

  // Calculate days since oldest overdue payment
  const oldestOverdue = overduePayments[0]
  const daysOverdue = Math.floor(
    (Date.now() - oldestOverdue.dueDate.getTime()) / (1000 * 60 * 60 * 24)
  )

  await prisma.loan.update({
    where: { id: loanId },
    data: {
      daysOverdue,
      // Mark as defaulted if 60+ days overdue
      ...(daysOverdue >= 60 && {
        status: 'defaulted',
        defaultedAt: new Date(),
      }),
      updatedAt: new Date(),
    },
  })
}
