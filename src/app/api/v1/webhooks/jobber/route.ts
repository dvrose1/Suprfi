// ABOUTME: Webhook endpoint for Jobber CRM events
// ABOUTME: Handles QUOTE_CREATE to auto-trigger financing offers

import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { fetchJobberClient, fetchJobberQuote } from '@/lib/services/crm/jobber'
import { generateApplicationToken } from '@/lib/utils/token'
import { sendApplicationLink } from '@/lib/services/sms'

// Minimum quote amount to trigger financing offer
const MIN_QUOTE_AMOUNT = 500

// Jobber webhook topics we handle
type JobberWebhookTopic = 
  | 'QUOTE_CREATE'
  | 'QUOTE_UPDATE'
  | 'JOB_CREATE'
  | 'CLIENT_CREATE'

interface JobberWebhookPayload {
  topic: JobberWebhookTopic
  appId: string
  accountId: number
  itemId: string // The ID of the created/updated item
  occurredAt: string
}

/**
 * Verify Jobber webhook signature using HMAC-SHA256
 */
function verifyWebhookSignature(
  payload: string,
  signature: string | null,
  secret: string
): boolean {
  if (!signature) return false
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  )
}

/**
 * POST /api/v1/webhooks/jobber
 * 
 * Receives webhooks from Jobber when quotes are created.
 * Automatically sends financing offers to customers for quotes >= $500.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()
  
  try {
    // Get raw body for signature verification
    const rawBody = await request.text()
    const signature = request.headers.get('X-Jobber-Hmac-SHA256')
    
    // Parse the payload
    let payload: JobberWebhookPayload
    try {
      payload = JSON.parse(rawBody)
    } catch {
      console.error('Invalid JSON in Jobber webhook')
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    console.log('📨 Jobber webhook received:', {
      topic: payload.topic,
      accountId: payload.accountId,
      itemId: payload.itemId,
    })

    // Find the CRM connection for this account
    const connection = await prisma.crmConnection.findFirst({
      where: {
        crmType: 'jobber',
        accountId: String(payload.accountId),
        isActive: true,
      },
    })

    if (!connection) {
      console.warn('No active Jobber connection for account:', payload.accountId)
      // Return 200 to acknowledge receipt (don't want Jobber to retry)
      return NextResponse.json({ 
        success: false, 
        error: 'No active connection for this account' 
      })
    }

    // Verify webhook signature
    const clientSecret = process.env.JOBBER_CLIENT_SECRET
    if (clientSecret && signature) {
      const isValid = verifyWebhookSignature(rawBody, signature, clientSecret)
      if (!isValid) {
        console.error('Invalid Jobber webhook signature')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
    }

    // Log the webhook
    await prisma.crmSyncLog.create({
      data: {
        crmType: 'jobber',
        direction: 'inbound',
        entityType: 'webhook',
        entityId: payload.itemId,
        crmEntityId: String(payload.accountId),
        status: 'success',
        requestPayload: payload as any,
      },
    })

    // Handle different webhook topics
    switch (payload.topic) {
      case 'QUOTE_CREATE':
        await handleQuoteCreate(connection.id, payload)
        break
      
      case 'QUOTE_UPDATE':
        // Could handle quote updates (e.g., amount changed)
        console.log('Quote updated:', payload.itemId)
        break
      
      default:
        console.log('Unhandled webhook topic:', payload.topic)
    }

    const duration = Date.now() - startTime
    console.log(`✅ Jobber webhook processed in ${duration}ms`)

    return NextResponse.json({ success: true, processed: true })
  } catch (error) {
    console.error('❌ Jobber webhook error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

/**
 * Handle QUOTE_CREATE webhook - send financing offer to customer
 */
async function handleQuoteCreate(connectionId: string, payload: JobberWebhookPayload) {
  console.log('📋 Processing new quote:', payload.itemId)

  // Fetch quote details from Jobber
  const quoteResult = await fetchJobberQuote(connectionId, payload.itemId)
  
  if (!quoteResult.success) {
    console.error('Failed to fetch quote:', quoteResult.error)
    return
  }

  const quote = quoteResult.data
  console.log('Quote details:', {
    id: quote.id,
    number: quote.quoteNumber,
    total: quote.total,
    status: quote.status,
  })

  // Check minimum amount
  if (quote.total < MIN_QUOTE_AMOUNT) {
    console.log(`Quote amount $${quote.total} below minimum $${MIN_QUOTE_AMOUNT}, skipping`)
    return
  }

  // Fetch client details
  const clientResult = await fetchJobberClient(connectionId, quote.client.id)
  
  if (!clientResult.success) {
    console.error('Failed to fetch client:', clientResult.error)
    return
  }

  const client = clientResult.data
  console.log('Client details:', {
    id: client.id,
    name: `${client.firstName} ${client.lastName}`,
    email: client.email,
  })

  // Check if customer has a phone number
  const phone = client.phones?.[0]?.number
  if (!phone) {
    console.log('Client has no phone number, cannot send SMS')
    await logSkippedOffer(payload, 'no_phone', quote, client)
    return
  }

  // Check if we already sent an offer for this quote
  const existingApp = await prisma.application.findFirst({
    where: {
      job: {
        crmJobId: quote.id,
      },
    },
  })

  if (existingApp) {
    console.log('Financing offer already sent for this quote')
    return
  }

  // Check if customer exists and has opted out
  const existingCustomer = await prisma.customer.findUnique({
    where: { crmCustomerId: `jobber-${client.id}` },
  })

  if (existingCustomer?.financingOptIn === false) {
    console.log('Customer has opted out of financing offers')
    await logSkippedOffer(payload, 'customer_opted_out', quote, client)
    return
  }

  // Create/update customer record
  const customer = await prisma.customer.upsert({
    where: { crmCustomerId: `jobber-${client.id}` },
    update: {
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: phone,
      addressLine1: client.billingAddress?.street,
      city: client.billingAddress?.city,
      state: client.billingAddress?.province,
      postalCode: client.billingAddress?.postalCode,
    },
    create: {
      crmCustomerId: `jobber-${client.id}`,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: phone,
      addressLine1: client.billingAddress?.street,
      city: client.billingAddress?.city,
      state: client.billingAddress?.province,
      postalCode: client.billingAddress?.postalCode,
    },
  })

  // Create job record
  const job = await prisma.job.upsert({
    where: { crmJobId: quote.id },
    update: {
      estimateAmount: quote.total,
      serviceType: quote.lineItems?.[0]?.name || 'Service',
    },
    create: {
      crmJobId: quote.id,
      customerId: customer.id,
      estimateAmount: quote.total,
      serviceType: quote.lineItems?.[0]?.name || 'Service',
      status: 'pending',
    },
  })

  // Create application
  const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  const application = await prisma.application.create({
    data: {
      jobId: job.id,
      customerId: customer.id,
      token: '',
      tokenExpiresAt,
      status: 'initiated',
    },
  })

  // Generate token
  const token = generateApplicationToken({
    applicationId: application.id,
    customerId: customer.id,
    jobId: job.id,
  })

  await prisma.application.update({
    where: { id: application.id },
    data: { token },
  })

  // Send SMS
  const smsResult = await sendApplicationLink(phone, token, client.firstName)

  if (!smsResult.success) {
    console.error('Failed to send SMS:', smsResult.error)
  } else {
    console.log('✅ Financing offer SMS sent to', phone)
  }

  // Create audit log
  await prisma.auditLog.create({
    data: {
      entityType: 'application',
      entityId: application.id,
      actor: 'system',
      action: 'created_from_webhook',
      payload: {
        crm_type: 'jobber',
        quote_id: quote.id,
        quote_number: quote.quoteNumber,
        amount: quote.total,
        sms_sent: smsResult.success,
        triggered_by: 'QUOTE_CREATE webhook',
      },
    },
  })

  // Log CRM sync
  await prisma.crmSyncLog.create({
    data: {
      crmType: 'jobber',
      direction: 'inbound',
      entityType: 'offer_financing',
      entityId: application.id,
      crmEntityId: quote.id,
      status: 'success',
      requestPayload: {
        quote_id: quote.id,
        customer_id: client.id,
        amount: quote.total,
      },
    },
  })

  console.log('✅ Financing application created:', application.id)
}

/**
 * Log when we skip sending an offer (for analytics)
 */
async function logSkippedOffer(
  payload: JobberWebhookPayload,
  reason: string,
  quote: any,
  client: any
) {
  await prisma.crmSyncLog.create({
    data: {
      crmType: 'jobber',
      direction: 'inbound',
      entityType: 'offer_skipped',
      entityId: payload.itemId,
      crmEntityId: String(payload.accountId),
      status: 'success',
      requestPayload: {
        reason,
        quote_total: quote.total,
        client_id: client.id,
      },
    },
  })
}

/**
 * GET /api/v1/webhooks/jobber
 * 
 * Documentation endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/v1/webhooks/jobber',
    method: 'POST',
    description: 'Webhook endpoint for Jobber events. Automatically sends financing offers when quotes are created.',
    authentication: 'HMAC-SHA256 signature verification (X-Jobber-Hmac-SHA256 header)',
    minimum_quote_amount: MIN_QUOTE_AMOUNT,
    supported_topics: [
      'QUOTE_CREATE - Triggers financing offer SMS',
      'QUOTE_UPDATE - Logged for future use',
    ],
    webhook_payload: {
      topic: 'string (e.g., QUOTE_CREATE)',
      appId: 'string',
      accountId: 'number',
      itemId: 'string (quote/job/client ID)',
      occurredAt: 'ISO 8601 datetime',
    },
  })
}
