// ABOUTME: Admin collections list API
// ABOUTME: Returns delinquent loans for the collections queue

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession, SESSION_COOKIE_CONFIG } from '@/lib/auth'

export async function GET(request: NextRequest) {
  // Validate session
  const sessionToken = request.cookies.get(SESSION_COOKIE_CONFIG.name)?.value
  if (!sessionToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const user = await validateSession(sessionToken)
  if (!user) {
    return NextResponse.json({ error: 'Invalid session' }, { status: 401 })
  }

  const searchParams = request.nextUrl.searchParams
  const filter = searchParams.get('filter') || 'all'

  try {
    // Build where clause based on filter
    let where: any = {
      daysOverdue: { gt: 0 },
    }

    if (filter === 'at_risk') {
      where = {
        daysOverdue: { gte: 30, lt: 60 },
        status: { not: 'defaulted' },
        sentToCollections: null,
      }
    } else if (filter === 'defaulted') {
      where = {
        OR: [
          { status: 'defaulted' },
          { daysOverdue: { gte: 60 } },
        ],
        sentToCollections: null,
      }
    } else if (filter === 'in_collections') {
      where = {
        sentToCollections: { not: null },
      }
    }

    const loans = await prisma.loan.findMany({
      where,
      include: {
        application: {
          include: {
            customer: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
              },
            },
          },
        },
        payments: {
          where: { status: 'overdue' },
          select: {
            id: true,
            status: true,
            amount: true,
          },
        },
        collectionNotes: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { daysOverdue: 'desc' },
    })

    return NextResponse.json({ loans })
  } catch (error: any) {
    console.error('Collections fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch collections' },
      { status: 500 }
    )
  }
}
