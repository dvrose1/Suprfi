import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

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
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

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
          resolvedBy: userId,
          resolvedAt: new Date(),
        }

        // Update the decision and application based on resolution
        const newDecisionStatus = data.resolution === 'declined' ? 'declined' : 'approved'
        const newAppStatus = data.resolution === 'declined' ? 'declined' : 'approved'
        
        await prisma.decision.update({
          where: { id: review.decisionId },
          data: {
            decisionStatus: newDecisionStatus,
            decidedBy: userId,
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
            actor: userId,
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
