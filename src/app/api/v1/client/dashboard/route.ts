// ABOUTME: SuprClient dashboard API endpoint
// ABOUTME: Returns dashboard stats and recent activity for contractors

import { NextResponse } from 'next/server';
import { getContractorSessionFromCookies } from '@/lib/auth/contractor-session';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getContractorSessionFromCookies();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    // Get contractor's jobs
    const contractorJobs = await prisma.contractorJob.findMany({
      where: { contractorId: user.contractorId },
      select: { jobId: true },
    });
    const jobIds = contractorJobs.map(cj => cj.jobId);

    // If no jobs, return empty stats
    if (jobIds.length === 0) {
      return NextResponse.json({
        stats: {
          totalApplications: 0,
          applicationsThisMonth: 0,
          approvalRate: 0,
          pendingReview: 0,
          totalFunded: 0,
          fundedThisMonth: 0,
          conversionFunnel: {
            initiated: 0,
            submitted: 0,
            approved: 0,
            funded: 0,
          },
        },
        recentActivity: [],
      });
    }

    // Get applications for these jobs
    const applications = await prisma.application.findMany({
      where: { jobId: { in: jobIds } },
      include: {
        customer: true,
        job: true,
        loan: true,
        decision: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats
    const totalApplications = applications.length;
    const applicationsThisMonth = applications.filter(
      a => a.createdAt >= startOfMonth
    ).length;

    const approvedApps = applications.filter(
      a => a.status === 'approved' || a.status === 'funded'
    );
    const submittedApps = applications.filter(
      a => a.status !== 'initiated'
    );
    const approvalRate = submittedApps.length > 0
      ? Math.round((approvedApps.length / submittedApps.length) * 100)
      : 0;

    const pendingReview = applications.filter(
      a => a.status === 'submitted'
    ).length;

    const fundedApps = applications.filter(a => a.status === 'funded' && a.loan);
    const totalFunded = fundedApps.reduce(
      (sum, a) => sum + (a.loan ? Number(a.loan.fundedAmount) : 0),
      0
    );
    const fundedThisMonth = fundedApps
      .filter(a => a.loan?.fundingDate && a.loan.fundingDate >= startOfMonth)
      .reduce((sum, a) => sum + (a.loan ? Number(a.loan.fundedAmount) : 0), 0);

    // Conversion funnel (last 30 days)
    const recentApps = applications.filter(a => a.createdAt >= thirtyDaysAgo);
    const conversionFunnel = {
      initiated: recentApps.length,
      submitted: recentApps.filter(a => a.status !== 'initiated').length,
      approved: recentApps.filter(a => a.status === 'approved' || a.status === 'funded').length,
      funded: recentApps.filter(a => a.status === 'funded').length,
    };

    // Recent activity
    const recentActivity = applications.slice(0, 10).map(app => ({
      id: app.id,
      type: app.status as 'submitted' | 'approved' | 'funded' | 'declined',
      customerName: `${app.customer.firstName} ${app.customer.lastName.charAt(0)}.`,
      amount: Number(app.job.estimateAmount),
      timestamp: formatRelativeTime(app.updatedAt),
    }));

    return NextResponse.json({
      stats: {
        totalApplications,
        applicationsThisMonth,
        approvalRate,
        pendingReview,
        totalFunded,
        fundedThisMonth,
        conversionFunnel,
      },
      recentActivity,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'An error occurred' },
      { status: 500 }
    );
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}
