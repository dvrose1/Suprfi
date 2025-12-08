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
 * POST /api/v1/admin/applications/:id/approve
 * 
 * Manually approve an application
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication - require ops role for approvals
    const { user, error } = await requireAuth(request, 'ops')
    if (error) return error
    const { id } = await params
    const body = await request.json()
    const { reason } = body

    console.log('📝 Manual approval requested for application:', id)

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

    // Check if already approved or declined
    if (application.status === 'approved') {
      return NextResponse.json({
        success: false,
        error: 'Application already approved',
      }, { status: 400 })
    }

    if (application.status === 'declined') {
      return NextResponse.json({
        success: false,
        error: 'Cannot approve a declined application',
      }, { status: 400 })
    }

    // Update application status
    await prisma.application.update({
      where: { id },
      data: { status: 'approved' },
    })

    console.log('✅ Application approved:', id)

    // If no decision exists yet, create one
    if (!application.decision) {
      const mockScore = Math.floor(Math.random() * 150) + 650

      const decision = await prisma.decision.create({
        data: {
          applicationId: id,
          score: mockScore,
          decisionStatus: 'approved',
          decisionReason: reason || 'Manually approved by admin',
          decidedBy: user?.email || user?.id,
        },
      })

      console.log('✅ Decision created:', decision.id)

      // Generate offers
      const loanAmount = Number(application.job.estimateAmount)
      const offers = []

      // 3 standard offers
      for (const termMonths of [24, 48, 60]) {
        const apr = mockScore >= 750 ? 7.9 + (termMonths / 10) : mockScore >= 700 ? 9.9 + (termMonths / 10) : 11.9 + (termMonths / 10)
        const monthlyRate = apr / 100 / 12
        const monthlyPayment = loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1)
        const totalAmount = monthlyPayment * termMonths

        const offer = await prisma.offer.create({
          data: {
            decisionId: decision.id,
            termMonths,
            apr,
            monthlyPayment,
            downPayment: 0,
            originationFee: termMonths === 24 ? loanAmount * 0.01 : 0,
            totalAmount,
          },
        })
        offers.push(offer)
      }

      console.log(`✅ Generated ${offers.length} offers`)
    } else {
      // Update existing decision
      await prisma.decision.update({
        where: { id: application.decision.id },
        data: {
          decisionStatus: 'approved',
          decisionReason: reason || 'Manually approved by admin',
          decidedBy: user?.email || user?.id,
        },
      })

      console.log('✅ Decision updated to approved')
    }

    // Create audit log
    await prisma.auditLog.create({
      data: {
        entityType: 'application',
        entityId: id,
        actor: user?.id || 'unknown',
        action: 'manual_approve',
        payload: {
          reason,
          approvedBy: user?.email || user?.id,
          previousStatus: application.status,
        },
      },
    })

    console.log('✅ Audit log created')

    // Sync status to CRM (FieldRoutes)
    if (application.job.crmJobId) {
      const updatedApp = await prisma.application.findUnique({
        where: { id },
        include: {
          job: true,
          decision: {
            include: {
              offers: true,
            },
          },
        },
      })

      if (updatedApp) {
        const selectedOffer = updatedApp.decision?.offers?.[0] // Use first offer as default
        
        const syncResult = await sendFinancingStatusToFieldRoutes({
          appointmentId: application.job.crmJobId,
          financingStatus: 'approved',
          applicationId: id,
          offeredAmount: selectedOffer ? Number(selectedOffer.totalAmount) : Number(application.job.estimateAmount),
          termMonths: selectedOffer?.termMonths,
          monthlyPayment: selectedOffer ? Number(selectedOffer.monthlyPayment) : undefined,
        })

        if (syncResult.success) {
          console.log('✅ Status synced to CRM')
        } else {
          console.warn('⚠️ Failed to sync status to CRM:', syncResult.error)
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Application approved successfully',
      application: {
        id,
        status: 'approved',
      },
    })
  } catch (error) {
    console.error('❌ Error approving application:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to approve application',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
