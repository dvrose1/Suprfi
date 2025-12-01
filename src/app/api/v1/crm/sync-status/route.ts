import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sendFinancingStatusToFieldRoutes } from '@/lib/services/crm/fieldroutes'

/**
 * POST /api/v1/crm/sync-status
 * 
 * Manually trigger a financing status sync to FieldRoutes CRM
 * Used when automatic sync fails or for admin override
 */

const SyncStatusSchema = z.object({
  application_id: z.string(),
  force: z.boolean().optional().default(false),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { application_id, force } = SyncStatusSchema.parse(body)

    // Fetch application with related data
    const application = await prisma.application.findUnique({
      where: { id: application_id },
      include: {
        job: true,
        decision: {
          include: {
            offers: {
              where: { selected: true },
            },
          },
        },
        loan: true,
      },
    })

    if (!application) {
      return NextResponse.json({
        success: false,
        error: 'Application not found',
      }, { status: 404 })
    }

    if (!application.job.crmJobId) {
      return NextResponse.json({
        success: false,
        error: 'No CRM job ID associated with this application',
      }, { status: 400 })
    }

    // Check if we've recently synced (unless force is true)
    if (!force) {
      const recentSync = await prisma.crmSyncLog.findFirst({
        where: {
          entityType: 'financing_status',
          entityId: application_id,
          status: 'success',
          createdAt: {
            gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
          },
        },
      })

      if (recentSync) {
        return NextResponse.json({
          success: false,
          error: 'Status was synced recently. Use force=true to override.',
          last_sync: recentSync.createdAt,
        }, { status: 429 })
      }
    }

    // Prepare status update
    const selectedOffer = application.decision?.offers?.[0]
    
    const statusUpdate = {
      appointmentId: application.job.crmJobId,
      financingStatus: application.status as any,
      applicationId: application.id,
      offeredAmount: selectedOffer ? Number(selectedOffer.totalAmount) : undefined,
      approvedAmount: application.loan ? Number(application.loan.fundedAmount) : undefined,
      termMonths: selectedOffer?.termMonths,
      monthlyPayment: selectedOffer ? Number(selectedOffer.monthlyPayment) : undefined,
      fundingId: application.loan?.lenderLoanId || undefined,
      declineReason: application.decision?.decisionReason || undefined,
    }

    // Send to FieldRoutes
    const result = await sendFinancingStatusToFieldRoutes(statusUpdate)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Status synced successfully to FieldRoutes',
        application_id,
        status: application.status,
      })
    } else {
      return NextResponse.json({
        success: false,
        error: result.error || 'Failed to sync status',
      }, { status: 500 })
    }
  } catch (error) {
    console.error('❌ Error syncing status:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.issues,
      }, { status: 400 })
    }

    return NextResponse.json({
      success: false,
      error: 'Internal server error',
    }, { status: 500 })
  }
}

/**
 * GET /api/v1/crm/sync-status
 * 
 * Documentation endpoint
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/v1/crm/sync-status',
    method: 'POST',
    description: 'Manually sync financing status to FieldRoutes CRM',
    authentication: 'API Key (x-api-key header)',
    request_body: {
      application_id: 'string (required)',
      force: 'boolean (optional, default: false)',
    },
    response: {
      success: 'boolean',
      message: 'string',
      application_id: 'string',
      status: 'string',
    },
  })
}
