import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { requireAuth } from '@/lib/auth/api'

const UpdateReviewSchema = z.object({
  action: z.enum(['assign', 'add_note', 'resolve']),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
  resolution: z.enum(['approved', 'declined', 'approved_with_conditions']).optional(),
})

/**
 * PATCH /api/v1/admin/manual-review/:id
 * Update a manual review (assign, add notes, resolve)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require ops role for review actions
    const { user, error } = await requireAuth(request, 'ops')
    if (error) return error

    const { id } = await params
    const body = await request.json()
    const data = UpdateReviewSchema.parse(body)

    // Get existing review
    const review = await prisma.manualReview.findUnique({
      where: { id },
      include: {
        decision: {
          include: {
            application: true,
          },
        },
      },
    })

    if (!review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 }
      )
    }

    let updateData: any = {}

    switch (data.action) {
      case 'assign':
        updateData = {
          assignedTo: data.assignedTo,
          status: 'in_review',
        }
        break

      case 'add_note':
        const existingNotes = review.notes || ''
        const timestamp = new Date().toISOString()
        const newNote = `[${timestamp}] ${data.notes}`
        updateData = {
          notes: existingNotes ? `${existingNotes}\n${newNote}` : newNote,
        }
        break

      case 'resolve':
        if (!data.resolution) {
          return NextResponse.json(
            { success: false, error: 'Resolution required' },
            { status: 400 }
          )
        }
        updateData = {
          status: 'resolved',
          resolution: data.resolution,
          resolvedBy: user?.id || 'unknown',
          resolvedAt: new Date(),
        }

        // Update the decision and application based on resolution
        const newDecisionStatus = data.resolution === 'declined' ? 'declined' : 'approved'
        const newAppStatus = data.resolution === 'declined' ? 'declined' : 'approved'
        
        await prisma.decision.update({
          where: { id: review.decisionId },
          data: {
            decisionStatus: newDecisionStatus,
            decidedBy: user?.id || 'unknown',
            decidedAt: new Date(),
          },
        })

        await prisma.application.update({
          where: { id: review.decision.applicationId },
          data: { status: newAppStatus },
        })

        // Create audit log
        await prisma.auditLog.create({
          data: {
            entityType: 'manual_review',
            entityId: id,
            actor: user?.id || 'unknown',
            action: `resolved_${data.resolution}`,
            payload: {
              applicationId: review.decision.applicationId,
              decisionId: review.decisionId,
              reason: review.reason,
            },
          },
        })
        break
    }

    const updatedReview = await prisma.manualReview.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      review: updatedReview,
    })
  } catch (error) {
    console.error('Error updating manual review:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to update review' },
      { status: 500 }
    )
  }
}
