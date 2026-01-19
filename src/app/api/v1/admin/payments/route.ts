// ABOUTME: Admin payments list API
// ABOUTME: Returns paginated list of payments with filters

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateSession, SESSION_COOKIE_CONFIG } from '@/lib/auth'

const PAGE_SIZE = 20

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
  const status = searchParams.get('status') || 'all'
  const page = parseInt(searchParams.get('page') || '1')
  const search = searchParams.get('search') || ''

  // Build where clause
  const where: any = {}
  
  if (status === 'requires_action') {
    where.requiresAction = true
  } else if (status !== 'all') {
    where.status = status
  }

  if (search) {
    where.loan = {
      application: {
        customer: {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        },
      },
    }
  }

  try {
    const [payments, total] = await Promise.all([
      prisma.payment.findMany({
        where,
        include: {
          loan: {
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
                },
              },
            },
          },
        },
        orderBy: [
          { requiresAction: 'desc' },
          { dueDate: 'asc' },
        ],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
      prisma.payment.count({ where }),
    ])

    return NextResponse.json({
      payments,
      total,
      page,
      pageSize: PAGE_SIZE,
      totalPages: Math.ceil(total / PAGE_SIZE),
    })
  } catch (error: any) {
    console.error('Admin payments fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payments' },
      { status: 500 }
    )
  }
}
