// ABOUTME: Admin collections stats API
// ABOUTME: Returns summary statistics for the collections dashboard

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

  try {
    const [atRisk, defaulted, inCollections, totalOwedResult] = await Promise.all([
      // At risk (30-59 days overdue)
      prisma.loan.count({
        where: {
          daysOverdue: { gte: 30, lt: 60 },
          status: { not: 'defaulted' },
          sentToCollections: null,
        },
      }),
      
      // Defaulted (60+ days or marked defaulted)
      prisma.loan.count({
        where: {
          OR: [
            { status: 'defaulted' },
            { daysOverdue: { gte: 60 } },
          ],
          sentToCollections: null,
        },
      }),
      
      // In collections
      prisma.loan.count({
        where: { sentToCollections: { not: null } },
      }),
      
      // Total owed (sum of overdue payments)
      prisma.payment.aggregate({
        where: { status: 'overdue' },
        _sum: { amount: true },
      }),
    ])

    return NextResponse.json({
      atRisk,
      defaulted,
      inCollections,
      totalOwed: Number(totalOwedResult._sum.amount || 0),
    })
  } catch (error: any) {
    console.error('Collections stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
