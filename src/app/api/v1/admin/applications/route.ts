import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized',
      }, { status: 401 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (search) {
      where.OR = [
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
        { id: { contains: search } },
      ]
    }

    // Fetch applications with pagination
    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            }
          },
          job: {
            select: {
              estimateAmount: true,
              serviceType: true,
              status: true,
            }
          },
          decision: {
            select: {
              decisionStatus: true,
              score: true,
            }
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ])

    // Get stats
    const stats = await prisma.application.groupBy({
      by: ['status'],
      _count: true,
    })

    return NextResponse.json({
      success: true,
      applications: applications.map(app => ({
        id: app.id,
        status: app.status,
        customer: {
          name: `${app.customer.firstName} ${app.customer.lastName}`,
          email: app.customer.email,
          phone: app.customer.phone,
        },
        job: {
          amount: Number(app.job.estimateAmount),
          serviceType: app.job.serviceType,
          status: app.job.status,
        },
        decision: app.decision ? {
          status: app.decision.decisionStatus,
          score: app.decision.score,
        } : null,
        createdAt: app.createdAt.toISOString(),
        updatedAt: app.updatedAt.toISOString(),
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count
        return acc
      }, {} as Record<string, number>),
    })
  } catch (error) {
    console.error('Error fetching applications:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch applications',
    }, { status: 500 })
  }
}
