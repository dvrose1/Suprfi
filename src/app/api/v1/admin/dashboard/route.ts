// ABOUTME: Admin dashboard stats API endpoint
// ABOUTME: Returns aggregated stats for the admin dashboard

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateSession, SESSION_COOKIE_CONFIG } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Validate session
    const sessionToken = request.cookies.get(SESSION_COOKIE_CONFIG.name)?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await validateSession(sessionToken);
    if (!user) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    // Get stats in parallel
    const [totalApps, submittedApps, approvedApps, recentApps, totalFundedResult, manualReviews] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({ where: { status: 'submitted' } }),
      prisma.application.count({ where: { status: 'approved' } }),
      prisma.application.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              firstName: true,
              lastName: true,
            }
          },
          job: {
            select: {
              estimateAmount: true,
            }
          },
        },
      }),
      prisma.loan.aggregate({
        _sum: { fundedAmount: true },
        where: { status: 'funded' },
      }),
      prisma.manualReview.count({
        where: { status: 'pending' },
      }),
    ]);

    const approvalRate = totalApps > 0 ? ((approvedApps / totalApps) * 100).toFixed(1) : '0.0';
    const totalFunded = Number(totalFundedResult._sum.fundedAmount) || 0;

    return NextResponse.json({
      totalApps,
      submittedApps,
      approvedApps,
      approvalRate,
      totalFunded,
      manualReviews,
      recentApps,
    });
  } catch (error) {
    console.error('[Admin] Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
