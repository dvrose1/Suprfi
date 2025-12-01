/**
 * FieldRoutes CRM Integration Service
 * 
 * Handles bidirectional sync between SuprFi and FieldRoutes CRM:
 * - Read customer/job data from FieldRoutes
 * - Write financing status updates back to FieldRoutes
 * - Webhook delivery with retry logic
 */

import { prisma } from '@/lib/prisma'

// FieldRoutes API Configuration
const FIELDROUTES_API_URL = process.env.FIELDROUTES_API_URL || 'https://api.fieldroutes.com/v1'
const FIELDROUTES_API_KEY = process.env.FIELDROUTES_API_KEY

interface FieldRoutesCustomer {
  customerId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  address?: {
    street: string
    city: string
    state: string
    zip: string
  }
}

interface FieldRoutesAppointment {
  id: string
  customerId: string
  totalCost: number
  status: string
  serviceType?: string
  technicianId?: string
  scheduledDate?: string
}

interface FinancingStatusUpdate {
  appointmentId: string
  financingStatus: 'initiated' | 'submitted' | 'approved' | 'declined' | 'funded'
  applicationId: string
  offeredAmount?: number
  approvedAmount?: number
  termMonths?: number
  monthlyPayment?: number
  fundingId?: string
  declineReason?: string
}

/**
 * Fetch customer data from FieldRoutes API
 */
export async function fetchCustomerFromFieldRoutes(
  customerId: string
): Promise<{ success: boolean; data?: FieldRoutesCustomer; error?: string }> {
  try {
    if (!FIELDROUTES_API_KEY) {
      console.warn('⚠️ FieldRoutes API key not configured, returning mock data')
      return {
        success: true,
        data: {
          customerId,
          firstName: 'Mock',
          lastName: 'Customer',
          email: 'mock@example.com',
          phone: '+15555551234',
          address: {
            street: '123 Main St',
            city: 'Austin',
            state: 'TX',
            zip: '78701',
          },
        },
      }
    }

    const response = await fetch(`${FIELDROUTES_API_URL}/customers/${customerId}`, {
      headers: {
        'Authorization': `Bearer ${FIELDROUTES_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`FieldRoutes API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Log sync
    await logCrmSync({
      direction: 'inbound',
      entityType: 'customer',
      entityId: customerId,
      crmEntityId: customerId,
      status: 'success',
      responsePayload: data,
    })

    return { success: true, data }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Log failed sync
    await logCrmSync({
      direction: 'inbound',
      entityType: 'customer',
      entityId: customerId,
      status: 'failed',
      errorMessage,
    })

    return { success: false, error: errorMessage }
  }
}

/**
 * Fetch appointment/job data from FieldRoutes API
 */
export async function fetchAppointmentFromFieldRoutes(
  appointmentId: string
): Promise<{ success: boolean; data?: FieldRoutesAppointment; error?: string }> {
  try {
    if (!FIELDROUTES_API_KEY) {
      console.warn('⚠️ FieldRoutes API key not configured, returning mock data')
      return {
        success: true,
        data: {
          id: appointmentId,
          customerId: 'CUST-' + appointmentId,
          totalCost: 5000,
          status: 'scheduled',
          serviceType: 'HVAC Repair',
        },
      }
    }

    const response = await fetch(`${FIELDROUTES_API_URL}/appointments/${appointmentId}`, {
      headers: {
        'Authorization': `Bearer ${FIELDROUTES_API_KEY}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`FieldRoutes API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    // Log sync
    await logCrmSync({
      direction: 'inbound',
      entityType: 'job',
      entityId: appointmentId,
      crmEntityId: appointmentId,
      status: 'success',
      responsePayload: data,
    })

    return { success: true, data }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    // Log failed sync
    await logCrmSync({
      direction: 'inbound',
      entityType: 'job',
      entityId: appointmentId,
      status: 'failed',
      errorMessage,
    })

    return { success: false, error: errorMessage }
  }
}

/**
 * Send financing status update to FieldRoutes
 */
export async function sendFinancingStatusToFieldRoutes(
  update: FinancingStatusUpdate,
  retryCount = 0
): Promise<{ success: boolean; error?: string }> {
  const MAX_RETRIES = 3
  const RETRY_DELAY_MS = 1000 * Math.pow(2, retryCount) // Exponential backoff

  try {
    if (!FIELDROUTES_API_KEY) {
      console.log('⚠️ FieldRoutes API key not configured, simulating success')
      
      await logCrmSync({
        direction: 'outbound',
        entityType: 'financing_status',
        entityId: update.applicationId,
        crmEntityId: update.appointmentId,
        status: 'success',
        requestPayload: update as any,
        attemptCount: retryCount + 1,
      })

      return { success: true }
    }

    const response = await fetch(`${FIELDROUTES_API_URL}/appointments/${update.appointmentId}/financing`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${FIELDROUTES_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        financing_status: update.financingStatus,
        application_id: update.applicationId,
        offered_amount: update.offeredAmount,
        approved_amount: update.approvedAmount,
        term_months: update.termMonths,
        monthly_payment: update.monthlyPayment,
        funding_id: update.fundingId,
        decline_reason: update.declineReason,
      }),
    })

    if (!response.ok) {
      throw new Error(`FieldRoutes API error: ${response.status} ${response.statusText}`)
    }

    const responseData = await response.json()

    // Log successful sync
    await logCrmSync({
      direction: 'outbound',
      entityType: 'financing_status',
      entityId: update.applicationId,
      crmEntityId: update.appointmentId,
      status: 'success',
      requestPayload: update as any,
      responsePayload: responseData,
      attemptCount: retryCount + 1,
    })

    console.log('✅ Financing status synced to FieldRoutes:', {
      appointmentId: update.appointmentId,
      status: update.financingStatus,
    })

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    console.error(`❌ Failed to sync financing status (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, errorMessage)

    // Log failed attempt
    await logCrmSync({
      direction: 'outbound',
      entityType: 'financing_status',
      entityId: update.applicationId,
      crmEntityId: update.appointmentId,
      status: retryCount < MAX_RETRIES ? 'retrying' : 'failed',
      errorMessage,
      requestPayload: update as any,
      attemptCount: retryCount + 1,
    })

    // Retry with exponential backoff
    if (retryCount < MAX_RETRIES) {
      console.log(`⏳ Retrying in ${RETRY_DELAY_MS}ms...`)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))
      return sendFinancingStatusToFieldRoutes(update, retryCount + 1)
    }

    return { success: false, error: errorMessage }
  }
}

/**
 * Send payment status update to FieldRoutes
 */
export async function sendPaymentStatusToFieldRoutes(
  appointmentId: string,
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
  transactionId: string,
  amount: number
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!FIELDROUTES_API_KEY) {
      console.log('⚠️ FieldRoutes API key not configured, simulating success')
      return { success: true }
    }

    const response = await fetch(`${FIELDROUTES_API_URL}/appointments/${appointmentId}/payment`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${FIELDROUTES_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment_status: paymentStatus,
        transaction_id: transactionId,
        amount,
      }),
    })

    if (!response.ok) {
      throw new Error(`FieldRoutes API error: ${response.status} ${response.statusText}`)
    }

    await logCrmSync({
      direction: 'outbound',
      entityType: 'payment',
      entityId: transactionId,
      crmEntityId: appointmentId,
      status: 'success',
      requestPayload: { paymentStatus, transactionId, amount } as any,
    })

    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    await logCrmSync({
      direction: 'outbound',
      entityType: 'payment',
      entityId: transactionId,
      crmEntityId: appointmentId,
      status: 'failed',
      errorMessage,
      requestPayload: { paymentStatus, transactionId, amount } as any,
    })

    return { success: false, error: errorMessage }
  }
}

/**
 * Helper function to log CRM sync operations
 */
async function logCrmSync({
  direction,
  entityType,
  entityId,
  crmEntityId,
  status,
  errorMessage,
  requestPayload,
  responsePayload,
  attemptCount = 1,
}: {
  direction: 'inbound' | 'outbound'
  entityType: string
  entityId: string
  crmEntityId?: string
  status: 'success' | 'failed' | 'retrying'
  errorMessage?: string
  requestPayload?: any
  responsePayload?: any
  attemptCount?: number
}) {
  try {
    await prisma.crmSyncLog.create({
      data: {
        crmType: 'fieldroutes',
        direction,
        entityType,
        entityId,
        crmEntityId,
        status,
        errorMessage,
        requestPayload,
        responsePayload,
        attemptCount,
      },
    })
  } catch (error) {
    console.error('Failed to log CRM sync:', error)
  }
}
