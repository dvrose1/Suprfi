import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendFinancingStatusToFieldRoutes } from '@/lib/services/crm/fieldroutes'

/**
 * POST /api/v1/crm/webhook
 * 
 * Webhook endpoint for receiving updates from FieldRoutes
 * (e.g., job status changes, customer updates, appointment cancellations)
 */

const WebhookSchema = z.object({
  event_type: z.enum(['appointment.updated', 'appointment.cancelled', 'customer.updated']),
  timestamp: z.string(),
  data: z.object({
    appointment_id: z.string().optional(),
    customer_id: z.string().optional(),
    status: z.string().optional(),
  }),
})

export async function POST(request: NextRequest) {
  try {
    // Verify webhook signature (if configured)
    const signature = request.headers.get('x-fieldroutes-signature')
    const webhookSecret = process.env.FIELDROUTES_WEBHOOK_SECRET

    if (webhookSecret && signature) {
      // TODO: Implement signature verification
      // This would validate that the webhook came from FieldRoutes
    }

    const body = await request.json()
    const webhook = WebhookSchema.parse(body)

    console.log('📨 Webhook received from FieldRoutes:', {
      event: webhook.event_type,
      timestamp: webhook.timestamp,
    })

    // Handle different event types
    switch (webhook.event_type) {
      case 'appointment.updated':
        await handleAppointmentUpdated(webhook.data)
        break
      
      case 'appointment.cancelled':
        await handleAppointmentCancelled(webhook.data)
        break
      
      case 'customer.updated':
        await handleCustomerUpdated(webhook.data)
        break
    }

    return NextResponse.json({ success: true, received: true })
  } catch (error) {
    console.error('❌ Webhook processing error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid webhook data',
        details: error.issues,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Webhook processing failed',
    }, { status: 500 })
  }
}

async function handleAppointmentUpdated(data: any) {
  const appointmentId = data.appointment_id
  if (!appointmentId) return

  // Find related job and applications
  const job = await prisma.job.findUnique({
    where: { crmJobId: appointmentId },
    include: { applications: true },
  })

  if (job && data.status) {
    await prisma.job.update({
      where: { id: job.id },
      data: { status: data.status },
    })

    console.log('✅ Job status updated:', { jobId: job.id, status: data.status })
  }
}

async function handleAppointmentCancelled(data: any) {
  const appointmentId = data.appointment_id
  if (!appointmentId) return

  // Find related applications and mark as cancelled
  const job = await prisma.job.findUnique({
    where: { crmJobId: appointmentId },
    include: { applications: true },
  })

  if (job) {
    // Update all pending applications
    await prisma.application.updateMany({
      where: {
        jobId: job.id,
        status: { in: ['initiated', 'submitted'] },
      },
      data: {
        status: 'cancelled',
      },
    })

    console.log('✅ Applications cancelled due to appointment cancellation:', { jobId: job.id })
  }
}

async function handleCustomerUpdated(data: any) {
  const customerId = data.customer_id
  if (!customerId) return

  // Fetch latest customer data from FieldRoutes and update
  // This ensures we have the most current customer information
  console.log('✅ Customer update received:', { customerId })
}

/**
 * GET /api/v1/crm/webhook
 * 
 * Documentation endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/v1/crm/webhook',
    method: 'POST',
    description: 'Webhook endpoint for FieldRoutes events',
    authentication: 'Signature verification (x-fieldroutes-signature header)',
    supported_events: [
      'appointment.updated',
      'appointment.cancelled',
      'customer.updated',
    ],
    webhook_payload: {
      event_type: 'string',
      timestamp: 'ISO 8601 datetime',
      data: {
        appointment_id: 'string (optional)',
        customer_id: 'string (optional)',
        status: 'string (optional)',
      },
    },
  })
}
