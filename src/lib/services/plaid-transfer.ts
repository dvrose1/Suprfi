// ABOUTME: Plaid Transfer service for ACH payment processing
// ABOUTME: Handles initiating, tracking, and managing ACH debits from borrower accounts

import { plaidClient } from './plaid'
import { 
  TransferType,
  TransferNetwork,
  ACHClass,
  TransferAuthorizationDecisionRationale,
} from 'plaid'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@prisma/client/runtime/library'

// ============================================
// TYPES
// ============================================

export interface TransferResult {
  success: boolean
  transferId?: string
  authorizationId?: string
  status?: string
  error?: string
  errorCode?: string
}

export interface TransferStatus {
  transferId: string
  status: string
  failureReason?: string
  settledAt?: string
}

// Error codes that should NOT be retried
const NON_RETRYABLE_CODES = [
  'ACCOUNT_CLOSED',
  'ACCOUNT_FROZEN',
  'INVALID_ACCOUNT_NUMBER',
  'UNAUTHORIZED_TRANSACTION',
  'CUSTOMER_ADVISED_UNAUTHORIZED',
]

// ============================================
// TRANSFER AUTHORIZATION
// ============================================

/**
 * Authorize a transfer before initiating it
 * This checks if the transfer will likely succeed
 */
export async function authorizeTransfer(
  accessToken: string,
  accountId: string,
  amount: number,
  userId: string,
  loanId: string
): Promise<{
  authorized: boolean
  authorizationId?: string
  decisionRationale?: string
  error?: string
}> {
  try {
    const response = await plaidClient.transferAuthorizationCreate({
      access_token: accessToken,
      account_id: accountId,
      type: TransferType.Debit,
      network: TransferNetwork.Ach,
      amount: amount.toFixed(2),
      ach_class: ACHClass.Web, // Web = internet-initiated
      user: {
        legal_name: userId, // Will be replaced with actual name
      },
      device: {
        ip_address: '127.0.0.1', // Should be actual IP in production
      },
    })

    const authorization = response.data.authorization
    
    return {
      authorized: authorization.decision === 'approved',
      authorizationId: authorization.id,
      decisionRationale: authorization.decision_rationale?.description,
    }
  } catch (error: any) {
    console.error('Transfer authorization error:', error?.response?.data || error)
    return {
      authorized: false,
      error: error?.response?.data?.error_message || 'Authorization failed',
    }
  }
}

// ============================================
// TRANSFER CREATION
// ============================================

/**
 * Initiate an ACH debit transfer from borrower's account
 */
export async function initiatePayment(
  paymentId: string,
  accessToken: string,
  accountId: string,
  amount: number,
  description: string
): Promise<TransferResult> {
  try {
    // Get payment and loan details
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
      return { success: false, error: 'Payment not found' }
    }

    const customer = payment.loan.application.customer
    const legalName = `${customer.firstName} ${customer.lastName}`

    // First, authorize the transfer
    const authResult = await authorizeTransfer(
      accessToken,
      accountId,
      amount,
      customer.id,
      payment.loanId
    )

    if (!authResult.authorized) {
      // Update payment with failure
      await prisma.payment.update({
        where: { id: paymentId },
        data: {
          status: 'failed',
          failureReason: authResult.decisionRationale || authResult.error || 'Authorization declined',
          updatedAt: new Date(),
        },
      })

      return {
        success: false,
        error: authResult.decisionRationale || authResult.error,
      }
    }

    // Create the transfer
    const response = await plaidClient.transferCreate({
      access_token: accessToken,
      account_id: accountId,
      authorization_id: authResult.authorizationId!,
      type: TransferType.Debit,
      network: TransferNetwork.Ach,
      amount: amount.toFixed(2),
      description: description.slice(0, 15), // Max 15 chars for ACH
      ach_class: ACHClass.Web,
      user: {
        legal_name: legalName,
        email_address: customer.email,
        phone_number: customer.phone,
      },
      metadata: {
        payment_id: paymentId,
        loan_id: payment.loanId,
      },
    })

    const transfer = response.data.transfer

    // Update payment with transfer info
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'processing',
        plaidTransferId: transfer.id,
        processedAt: new Date(),
        updatedAt: new Date(),
      },
    })

    // Audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'payment',
        entityId: paymentId,
        actor: 'system',
        action: 'ach_initiated',
        payload: {
          transferId: transfer.id,
          amount,
          status: transfer.status,
        },
      },
    })

    return {
      success: true,
      transferId: transfer.id,
      authorizationId: authResult.authorizationId,
      status: transfer.status,
    }
  } catch (error: any) {
    console.error('Transfer creation error:', error?.response?.data || error)
    
    const errorMessage = error?.response?.data?.error_message || 'Transfer failed'
    const errorCode = error?.response?.data?.error_code
    
    // Update payment with failure
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'failed',
        failureReason: errorMessage,
        failureCode: errorCode,
        requiresAction: !NON_RETRYABLE_CODES.includes(errorCode),
        updatedAt: new Date(),
      },
    })
    
    return {
      success: false,
      error: errorMessage,
      errorCode,
    }
  }
}

// ============================================
// TRANSFER STATUS
// ============================================

/**
 * Get the current status of a transfer
 */
export async function getTransferStatus(transferId: string): Promise<TransferStatus | null> {
  try {
    const response = await plaidClient.transferGet({
      transfer_id: transferId,
    })

    const transfer = response.data.transfer
    
    return {
      transferId: transfer.id,
      status: transfer.status,
      failureReason: transfer.failure_reason?.description,
      settledAt: undefined, // Plaid Transfer object doesn't have settled timestamp
    }
  } catch (error: any) {
    console.error('Get transfer status error:', error?.response?.data || error)
    return null
  }
}

/**
 * Sync all pending transfers with Plaid to get latest status
 */
export async function syncPendingTransfers(): Promise<{
  synced: number
  completed: number
  failed: number
  errors: string[]
}> {
  const result = {
    synced: 0,
    completed: 0,
    failed: 0,
    errors: [] as string[],
  }

  try {
    // Get all payments in processing status with plaid transfer IDs
    const processingPayments = await prisma.payment.findMany({
      where: {
        status: 'processing',
        plaidTransferId: { not: null },
      },
    })

    for (const payment of processingPayments) {
      try {
        const status = await getTransferStatus(payment.plaidTransferId!)
        
        if (!status) {
          result.errors.push(`Failed to get status for payment ${payment.id}`)
          continue
        }

        result.synced++

        // Map Plaid status to our status
        let newStatus = payment.status
        let completedAt: Date | null = null

        switch (status.status) {
          case 'posted':
          case 'settled':
            newStatus = 'completed'
            completedAt = new Date()
            result.completed++
            break
          case 'failed':
          case 'returned':
            newStatus = 'failed'
            result.failed++
            break
          case 'pending':
          case 'posted':
            // Still processing
            break
          case 'cancelled':
            newStatus = 'cancelled'
            break
        }

        // Update if status changed
        if (newStatus !== payment.status) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: newStatus,
              completedAt,
              failureReason: status.failureReason,
              updatedAt: new Date(),
            },
          })

          // If completed, update loan
          if (newStatus === 'completed') {
            await updateLoanOnPaymentComplete(payment.loanId)
          }
        }
      } catch (err: any) {
        result.errors.push(`Error syncing payment ${payment.id}: ${err.message}`)
      }
    }
  } catch (error: any) {
    result.errors.push(`Sync error: ${error.message}`)
  }

  return result
}

// ============================================
// LOAN UPDATES
// ============================================

/**
 * Update loan status after a payment completes
 */
async function updateLoanOnPaymentComplete(loanId: string): Promise<void> {
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: {
      payments: {
        orderBy: { paymentNumber: 'asc' },
      },
    },
  })

  if (!loan) return

  const completedPayments = loan.payments.filter(p => p.status === 'completed')
  const totalPayments = loan.payments.length
  const allComplete = completedPayments.length === totalPayments

  // Update loan status
  let newStatus = loan.status
  if (allComplete) {
    newStatus = 'paid_off'
  } else if (completedPayments.length > 0 && loan.status === 'funded') {
    newStatus = 'repaying'
  }

  if (newStatus !== loan.status) {
    await prisma.loan.update({
      where: { id: loanId },
      data: {
        status: newStatus,
        updatedAt: new Date(),
      },
    })
  }
}

// ============================================
// RETRY LOGIC
// ============================================

/**
 * Check if a failure code is retryable
 */
export function isRetryable(failureCode: string | null): boolean {
  if (!failureCode) return true
  return !NON_RETRYABLE_CODES.includes(failureCode)
}

/**
 * Calculate next retry date based on retry count
 * Retry schedule: 3 days, 5 days, 7 days
 */
export function calculateNextRetryDate(retryCount: number): Date | null {
  const retryIntervals = [3, 5, 7] // Days
  const maxRetries = retryIntervals.length
  
  if (retryCount >= maxRetries) {
    return null // No more retries
  }
  
  const daysToAdd = retryIntervals[retryCount]
  const nextDate = new Date()
  nextDate.setDate(nextDate.getDate() + daysToAdd)
  return nextDate
}

/**
 * Schedule a payment for retry
 */
export async function scheduleRetry(paymentId: string): Promise<boolean> {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  })

  if (!payment) return false
  if (!isRetryable(payment.failureCode)) {
    // Mark as requiring action
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        requiresAction: true,
        updatedAt: new Date(),
      },
    })
    return false
  }

  const nextRetryDate = calculateNextRetryDate(payment.retryCount)
  
  if (!nextRetryDate) {
    // Max retries reached
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        requiresAction: true,
        updatedAt: new Date(),
      },
    })
    return false
  }

  await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: 'scheduled', // Back to scheduled for retry
      nextRetryDate,
      retryCount: payment.retryCount + 1,
      plaidTransferId: null, // Clear old transfer ID
      failureReason: null,
      failureCode: null,
      updatedAt: new Date(),
    },
  })

  return true
}

// ============================================
// HELPERS
// ============================================

/**
 * Get Plaid access token and account ID for a loan
 */
export async function getPlaidCredentialsForLoan(loanId: string): Promise<{
  accessToken: string | null
  accountId: string | null
}> {
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: {
      application: true,
    },
  })

  if (!loan?.application?.plaidData) {
    return { accessToken: null, accountId: null }
  }

  const plaidData = loan.application.plaidData as {
    accessToken?: string
    accountId?: string
  }

  return {
    accessToken: plaidData.accessToken || null,
    accountId: plaidData.accountId || null,
  }
}
