import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendFinancingStatusToFieldRoutes } from '@/lib/services/crm/fieldroutes'
import { requireAuth } from '@/lib/auth/api'

interface RouteParams {
  params: Promise<{
    id: string
  }>
}

/**
 * POST /api/v1/admin/applications/:id/decline
 * 
 * Manually decline an application
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication - require ops role for declines
    const { user, error } = await requireAuth(request, 'ops')
    if (error) return error
    const { id } = await params
    const body = await request.json()
    const { reason } = body

    if (!reason) {
      return NextResponse.json({
        success: false,
        error: 'Decline reason is required',
      }, { status: 400 })
    }

    console.log('📝 Manual decline requested for application:', id)

    // Fetch application
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        decision: true,
      },
    })

    if (!application) {
      return NextResponse.json({
        success: false,
        error: 'Application not found',
      }, { status: 404 })
    }

    // Check if already declined
    if (application.status === 'declined') {
      return NextResponse.json({
        success: false,
        error: 'Application already declined',
      }, { status: 400 })
    }

    // Update application status
    await prisma.application.update({
      where: { id },
      data: { status: 'declined' },
    })

    console.log('✅ Application declined:', id)

    // If no decision exists yet, create one
    if (!application.decision) {
      await prisma.decision.create({
        data: {
          applicationId: id,
          score: null,
          decisionStatus: 'declined',
          decisionReason: reason,
          decidedBy: user?.email || user?.id,
        },
      })

      console.log('✅ Decision created with declined status')
    } else {
      // Update existing decision
      await prisma.decision.update({
        where: { id: application.decision.id },
        data: {
          decisionStatus: 'declined',
          decisionReason: reason,
          decidedBy: user?.email || user?.id,
        },
      })

      console.log('✅ Decision updated to declined')
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'application',
        entityId: id,
        actor: user?.id || 'unknown',
        action: 'manual_decline',
        payload: {
          reason,
          declinedBy: user?.email || user?.id,
          previousStatus: application.status,
        },
      },
    })

    console.log('✅ Audit log created')

    // Sync status to CRM (FieldRoutes)
    if (application.job.crmJobId) {
      const syncResult = await sendFinancingStatusToFieldRoutes({
        appointmentId: application.job.crmJobId,
        financingStatus: 'declined',
        applicationId: id,
        declineReason: reason,
      })

      if (syncResult.success) {
        console.log('✅ Decline status synced to CRM')
      } else {
        console.warn('⚠️ Failed to sync decline status to CRM:', syncResult.error)
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Application declined successfully',
      application: {
        id,
        status: 'declined',
      },
    })
  } catch (error) {
    console.error('❌ Error declining application:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to decline application',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
