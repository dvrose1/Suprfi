// ABOUTME: Payment notification service for borrower communications
// ABOUTME: Sends email and SMS notifications for payment events

import { sendEmail } from '@/lib/email/resend'
import { sendSMS } from '@/lib/services/sms'
import { prisma } from '@/lib/prisma'
import { PaymentReminder } from '@/lib/email/templates/PaymentReminder'
import { PaymentSuccess } from '@/lib/email/templates/PaymentSuccess'
import { PaymentFailed } from '@/lib/email/templates/PaymentFailed'
import { PaymentOverdue } from '@/lib/email/templates/PaymentOverdue'
import { LoanPaidOff } from '@/lib/email/templates/LoanPaidOff'

// ============================================
// TYPES
// ============================================

export type NotificationType = 
  | 'payment_reminder'
  | 'payment_processing'
  | 'payment_success'
  | 'payment_failed'
  | 'retry_scheduled'
  | 'payment_overdue'
  | 'loan_paid_off'

export interface NotificationResult {
  emailSent: boolean
  smsSent: boolean
  emailId?: string
  smsId?: string
  error?: string
}

interface CustomerInfo {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
}

interface PaymentInfo {
  id: string
  paymentNumber: number
  amount: number
  dueDate: Date
  loanId: string
}

// ============================================
// NOTIFICATION FUNCTIONS
// ============================================

/**
 * Send payment reminder (3 days before due)
 */
export async function sendPaymentReminder(
  customer: CustomerInfo,
  payment: PaymentInfo
): Promise<NotificationResult> {
  const result: NotificationResult = { emailSent: false, smsSent: false }

  try {
    // Send email
    const emailResult = await sendEmail({
      to: customer.email,
      subject: `Payment Reminder - $${payment.amount.toFixed(2)} due ${formatDate(payment.dueDate)}`,
      react: PaymentReminder({
        customerName: customer.firstName,
        amount: payment.amount,
        dueDate: payment.dueDate,
        paymentNumber: payment.paymentNumber,
      }),
    })
    result.emailSent = emailResult.success
    result.emailId = emailResult.id

    // Send SMS
    const smsResult = await sendSMS({
      to: customer.phone,
      message: `SuprFi: Your payment of $${payment.amount.toFixed(2)} is due on ${formatDate(payment.dueDate)}. Ensure funds are available in your linked account.`,
    })
    result.smsSent = smsResult.success
    result.smsId = smsResult.messageId

    // Log notification
    await logNotification(customer.id, payment.id, 'payment_reminder', result)

  } catch (error: any) {
    result.error = error.message
  }

  return result
}

/**
 * Send payment processing notification (SMS only)
 */
export async function sendPaymentProcessing(
  customer: CustomerInfo,
  payment: PaymentInfo
): Promise<NotificationResult> {
  const result: NotificationResult = { emailSent: false, smsSent: false }

  try {
    const smsResult = await sendSMS({
      to: customer.phone,
      message: `SuprFi: We're processing your payment of $${payment.amount.toFixed(2)}. You'll receive confirmation once complete.`,
    })
    result.smsSent = smsResult.success
    result.smsId = smsResult.messageId

    await logNotification(customer.id, payment.id, 'payment_processing', result)

  } catch (error: any) {
    result.error = error.message
  }

  return result
}

/**
 * Send payment success notification
 */
export async function sendPaymentSuccessNotification(
  customer: CustomerInfo,
  payment: PaymentInfo,
  remainingBalance: number
): Promise<NotificationResult> {
  const result: NotificationResult = { emailSent: false, smsSent: false }

  try {
    // Send email
    const emailResult = await sendEmail({
      to: customer.email,
      subject: `Payment Received - $${payment.amount.toFixed(2)}`,
      react: PaymentSuccess({
        customerName: customer.firstName,
        amount: payment.amount,
        paymentNumber: payment.paymentNumber,
        remainingBalance,
        paymentDate: new Date(),
      }),
    })
    result.emailSent = emailResult.success
    result.emailId = emailResult.id

    // Send SMS
    const smsResult = await sendSMS({
      to: customer.phone,
      message: `SuprFi: Payment of $${payment.amount.toFixed(2)} received. Remaining balance: $${remainingBalance.toFixed(2)}. Thank you!`,
    })
    result.smsSent = smsResult.success
    result.smsId = smsResult.messageId

    await logNotification(customer.id, payment.id, 'payment_success', result)

  } catch (error: any) {
    result.error = error.message
  }

  return result
}

/**
 * Send payment failed notification
 */
export async function sendPaymentFailedNotification(
  customer: CustomerInfo,
  payment: PaymentInfo,
  reason: string,
  willRetry: boolean,
  nextRetryDate?: Date
): Promise<NotificationResult> {
  const result: NotificationResult = { emailSent: false, smsSent: false }

  try {
    // Send email
    const emailResult = await sendEmail({
      to: customer.email,
      subject: `Payment Failed - Action Required`,
      react: PaymentFailed({
        customerName: customer.firstName,
        amount: payment.amount,
        paymentNumber: payment.paymentNumber,
        reason,
        willRetry,
        nextRetryDate,
      }),
    })
    result.emailSent = emailResult.success
    result.emailId = emailResult.id

    // Send SMS
    let smsMessage = `SuprFi: Your payment of $${payment.amount.toFixed(2)} could not be processed.`
    if (willRetry && nextRetryDate) {
      smsMessage += ` We'll retry on ${formatDate(nextRetryDate)}. Please ensure funds are available.`
    } else {
      smsMessage += ` Please update your payment method or contact us.`
    }
    
    const smsResult = await sendSMS({
      to: customer.phone,
      message: smsMessage,
    })
    result.smsSent = smsResult.success
    result.smsId = smsResult.messageId

    await logNotification(customer.id, payment.id, 'payment_failed', result)

  } catch (error: any) {
    result.error = error.message
  }

  return result
}

/**
 * Send payment overdue notification (escalating)
 */
export async function sendPaymentOverdueNotification(
  customer: CustomerInfo,
  payment: PaymentInfo,
  daysOverdue: number
): Promise<NotificationResult> {
  const result: NotificationResult = { emailSent: false, smsSent: false }

  try {
    // Determine urgency level
    let urgencyLevel: 'reminder' | 'warning' | 'urgent' | 'final' = 'reminder'
    if (daysOverdue >= 14) urgencyLevel = 'final'
    else if (daysOverdue >= 7) urgencyLevel = 'urgent'
    else if (daysOverdue >= 3) urgencyLevel = 'warning'

    // Send email
    const emailResult = await sendEmail({
      to: customer.email,
      subject: getOverdueSubject(daysOverdue, payment.amount),
      react: PaymentOverdue({
        customerName: customer.firstName,
        amount: payment.amount,
        daysOverdue,
        urgencyLevel,
      }),
    })
    result.emailSent = emailResult.success
    result.emailId = emailResult.id

    // Send SMS for 1, 3, 7, 14 day marks
    if ([1, 3, 7, 14].includes(daysOverdue)) {
      const smsResult = await sendSMS({
        to: customer.phone,
        message: getOverdueSMS(daysOverdue, payment.amount),
      })
      result.smsSent = smsResult.success
      result.smsId = smsResult.messageId
    }

    await logNotification(customer.id, payment.id, 'payment_overdue', result)

  } catch (error: any) {
    result.error = error.message
  }

  return result
}

/**
 * Send loan paid off notification
 */
export async function sendLoanPaidOffNotification(
  customer: CustomerInfo,
  loanId: string,
  totalPaid: number
): Promise<NotificationResult> {
  const result: NotificationResult = { emailSent: false, smsSent: false }

  try {
    // Send email
    const emailResult = await sendEmail({
      to: customer.email,
      subject: `Congratulations! Your Loan is Paid Off`,
      react: LoanPaidOff({
        customerName: customer.firstName,
        totalPaid,
      }),
    })
    result.emailSent = emailResult.success
    result.emailId = emailResult.id

    // Send SMS
    const smsResult = await sendSMS({
      to: customer.phone,
      message: `SuprFi: Congratulations ${customer.firstName}! Your loan has been paid in full. Thank you for choosing SuprFi!`,
    })
    result.smsSent = smsResult.success
    result.smsId = smsResult.messageId

    await logNotification(customer.id, loanId, 'loan_paid_off', result)

  } catch (error: any) {
    result.error = error.message
  }

  return result
}

// ============================================
// HELPERS
// ============================================

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function getOverdueSubject(daysOverdue: number, amount: number): string {
  if (daysOverdue >= 14) {
    return `FINAL NOTICE: Payment of $${amount.toFixed(2)} is ${daysOverdue} days overdue`
  } else if (daysOverdue >= 7) {
    return `URGENT: Payment of $${amount.toFixed(2)} is ${daysOverdue} days overdue`
  } else {
    return `Payment Overdue - $${amount.toFixed(2)} was due ${daysOverdue} days ago`
  }
}

function getOverdueSMS(daysOverdue: number, amount: number): string {
  if (daysOverdue >= 14) {
    return `SuprFi FINAL NOTICE: Your payment of $${amount.toFixed(2)} is ${daysOverdue} days past due. Please pay immediately to avoid further action.`
  } else if (daysOverdue >= 7) {
    return `SuprFi URGENT: Your payment of $${amount.toFixed(2)} is ${daysOverdue} days overdue. Please pay as soon as possible.`
  } else {
    return `SuprFi: Your payment of $${amount.toFixed(2)} is ${daysOverdue} days past due. Please ensure funds are available.`
  }
}

async function logNotification(
  customerId: string,
  entityId: string,
  type: NotificationType,
  result: NotificationResult
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      entityType: 'notification',
      entityId,
      actor: 'system',
      action: type,
      payload: {
        customerId,
        emailSent: result.emailSent,
        smsSent: result.smsSent,
        emailId: result.emailId,
        smsId: result.smsId,
        error: result.error,
      },
    },
  })
}

// ============================================
// BATCH NOTIFICATION JOBS
// ============================================

/**
 * Send payment reminders for payments due in 3 days
 */
export async function sendPaymentReminders(): Promise<{
  sent: number
  failed: number
  errors: string[]
}> {
  const result = { sent: 0, failed: 0, errors: [] as string[] }

  // Get payments due in 3 days
  const threeDaysFromNow = new Date()
  threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)
  threeDaysFromNow.setHours(23, 59, 59, 999)

  const threeDaysStart = new Date()
  threeDaysStart.setDate(threeDaysStart.getDate() + 3)
  threeDaysStart.setHours(0, 0, 0, 0)

  const payments = await prisma.payment.findMany({
    where: {
      status: 'scheduled',
      dueDate: {
        gte: threeDaysStart,
        lte: threeDaysFromNow,
      },
      loan: {
        status: { in: ['funded', 'repaying'] },
      },
    },
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

  for (const payment of payments) {
    try {
      const customer = payment.loan.application.customer
      await sendPaymentReminder(
        {
          id: customer.id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
        },
        {
          id: payment.id,
          paymentNumber: payment.paymentNumber,
          amount: Number(payment.amount),
          dueDate: payment.dueDate,
          loanId: payment.loanId,
        }
      )
      result.sent++
    } catch (error: any) {
      result.failed++
      result.errors.push(`Payment ${payment.id}: ${error.message}`)
    }
  }

  return result
}

/**
 * Send overdue notifications for all overdue payments
 */
export async function sendOverdueNotifications(): Promise<{
  sent: number
  failed: number
  errors: string[]
}> {
  const result = { sent: 0, failed: 0, errors: [] as string[] }

  const overduePayments = await prisma.payment.findMany({
    where: {
      status: 'overdue',
      loan: {
        status: { in: ['funded', 'repaying'] },
      },
    },
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

  for (const payment of overduePayments) {
    try {
      const customer = payment.loan.application.customer
      const daysOverdue = Math.floor(
        (Date.now() - payment.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      // Only send on specific day marks to avoid spam
      if ([1, 3, 7, 14, 21, 30].includes(daysOverdue)) {
        await sendPaymentOverdueNotification(
          {
            id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
            phone: customer.phone,
          },
          {
            id: payment.id,
            paymentNumber: payment.paymentNumber,
            amount: Number(payment.amount),
            dueDate: payment.dueDate,
            loanId: payment.loanId,
          },
          daysOverdue
        )
        result.sent++
      }
    } catch (error: any) {
      result.failed++
      result.errors.push(`Payment ${payment.id}: ${error.message}`)
    }
  }

  return result
}
