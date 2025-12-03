import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/v1/admin/manual-review
 * Get all manual reviews (queue)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const assignedTo = searchParams.get('assignedTo')

    const where: any = {}
    if (status !== 'all') {
      where.status = status
    }
    if (assignedTo) {
      where.assignedTo = assignedTo
    }

    const reviews = await prisma.manualReview.findMany({
      where,
      include: {
        decision: {
          include: {
            application: {
              include: {
                customer: {
                  select: {
                    firstName: true,
                    lastName: true,
                    email: true,
                  },
                },
                job: {
                  select: {
                    estimateAmount: true,
                    serviceType: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'asc' },
      ],
    })

    // Calculate time in queue for each review
    const now = new Date()
    const reviewsWithMetadata = reviews.map(review => {
      const timeInQueueMs = now.getTime() - new Date(review.createdAt).getTime()
      const timeInQueueHours = Math.floor(timeInQueueMs / (1000 * 60 * 60))
      
      return {
        id: review.id,
        reason: review.reason,
        priority: review.priority,
        status: review.status,
        assignedTo: review.assignedTo,
        notes: review.notes,
        resolution: review.resolution,
        resolvedBy: review.resolvedBy,
        resolvedAt: review.resolvedAt?.toISOString(),
        createdAt: review.createdAt.toISOString(),
        timeInQueueHours,
        isOverdue: timeInQueueHours > 24, // SLA: 24 hours
        application: {
          id: review.decision.application.id,
          customerName: `${review.decision.application.customer.firstName} ${review.decision.application.customer.lastName}`,
          customerEmail: review.decision.application.customer.email,
          loanAmount: Number(review.decision.application.job.estimateAmount),
          serviceType: review.decision.application.job.serviceType,
        },
        decision: {
          id: review.decision.id,
          score: review.decision.score,
          status: review.decision.decisionStatus,
        },
      }
    })

    // Get stats
    const stats = await prisma.manualReview.groupBy({
      by: ['status'],
      _count: true,
    })

    return NextResponse.json({
      success: true,
      reviews: reviewsWithMetadata,
      stats: {
        pending: stats.find(s => s.status === 'pending')?._count || 0,
        in_review: stats.find(s => s.status === 'in_review')?._count || 0,
        resolved: stats.find(s => s.status === 'resolved')?._count || 0,
      },
    })
  } catch (error) {
    console.error('Error fetching manual reviews:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch manual reviews' },
      { status: 500 }
    )
  }
}
