// ABOUTME: Admin payments stats API
// ABOUTME: Returns summary statistics for the payments dashboard

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
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)
    
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const [
      dueToday,
      processing,
      completedToday,
      failed,
      overdue,
      collectedThisMonth,
    ] = await Promise.all([
      // Payments due today
      prisma.payment.count({
        where: {
          status: 'scheduled',
          dueDate: {
            gte: todayStart,
            lte: today,
          },
        },
      }),
      
      // Processing payments
      prisma.payment.count({
        where: { status: 'processing' },
      }),
      
      // Completed today
      prisma.payment.count({
        where: {
          status: 'completed',
          completedAt: {
            gte: todayStart,
          },
        },
      }),
      
      // Failed payments needing attention
      prisma.payment.count({
        where: {
          status: 'failed',
        },
      }),
      
      // Overdue payments
      prisma.payment.count({
        where: { status: 'overdue' },
      }),
      
      // Total collected this month
      prisma.payment.aggregate({
        where: {
          status: 'completed',
          completedAt: {
            gte: monthStart,
          },
        },
        _sum: {
          amount: true,
        },
      }),
    ])

    return NextResponse.json({
      dueToday,
      processing,
      completedToday,
      failed,
      overdue,
      collectedThisMonth: Number(collectedThisMonth._sum.amount || 0),
    })
  } catch (error: any) {
    console.error('Admin payments stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
