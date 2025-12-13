// ABOUTME: SuprClient analytics API
// ABOUTME: Returns analytics data with trends and benchmarks

import { NextRequest, NextResponse } from 'next/server';
import { getContractorSessionFromCookies } from '@/lib/auth/contractor-session';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await getContractorSessionFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get contractor's job IDs
    const contractorJobs = await prisma.contractorJob.findMany({
      where: { contractorId: user.contractorId },
      select: { jobId: true, sendMethod: true },
    });
    const jobIds = contractorJobs.map(cj => cj.jobId);
    const sendMethodMap = new Map(contractorJobs.map(cj => [cj.jobId, cj.sendMethod]));

    if (jobIds.length === 0) {
      return NextResponse.json(getEmptyAnalytics());
    }

    // Get applications
    const applications = await prisma.application.findMany({
      where: {
        jobId: { in: jobIds },
        createdAt: { gte: startDate },
      },
      include: {
        job: true,
        loan: true,
        decision: true,
      },
    });

    // Calculate overview stats
    const totalApplications = applications.length;
    const submittedApps = applications.filter(a => a.status !== 'initiated');
    const approvedApps = applications.filter(a => ['approved', 'funded'].includes(a.status));
    const approvalRate = submittedApps.length > 0
      ? Math.round((approvedApps.length / submittedApps.length) * 100)
      : 0;

    const fundedApps = applications.filter(a => a.loan);
    const avgLoanAmount = fundedApps.length > 0
      ? Math.round(fundedApps.reduce((sum, a) => sum + Number(a.loan!.fundedAmount), 0) / fundedApps.length)
      : 0;

    // Calculate avg time to fund (days between creation and funding)
    const fundingTimes = fundedApps
      .filter(a => a.loan?.fundingDate)
      .map(a => {
        const created = new Date(a.createdAt);
        const funded = new Date(a.loan!.fundingDate!);
        return Math.ceil((funded.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
      });
    const avgTimeToFund = fundingTimes.length > 0
      ? Math.round(fundingTimes.reduce((a, b) => a + b, 0) / fundingTimes.length)
      : 0;

    // Generate monthly trends
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const approvalRateByMonth = [];
    const fundingByMonth = [];
    const applicationsByMonth = [];

    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date();
      monthDate.setMonth(monthDate.getMonth() - i);
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0);
      
      const monthApps = applications.filter(a => 
        a.createdAt >= monthStart && a.createdAt <= monthEnd
      );
      const monthSubmitted = monthApps.filter(a => a.status !== 'initiated');
      const monthApproved = monthApps.filter(a => ['approved', 'funded'].includes(a.status));
      const monthRate = monthSubmitted.length > 0
        ? Math.round((monthApproved.length / monthSubmitted.length) * 100)
        : 0;

      const monthFunded = monthApps
        .filter(a => a.loan)
        .reduce((sum, a) => sum + Number(a.loan!.fundedAmount), 0);

      approvalRateByMonth.push({ month: monthNames[monthDate.getMonth()], rate: monthRate });
      fundingByMonth.push({ month: monthNames[monthDate.getMonth()], amount: monthFunded });
      applicationsByMonth.push({ month: monthNames[monthDate.getMonth()], count: monthApps.length });
    }

    // Breakdown by status
    const byStatus: Record<string, number> = {};
    applications.forEach(a => {
      byStatus[a.status] = (byStatus[a.status] || 0) + 1;
    });

    // Breakdown by service type
    const byServiceType: Record<string, number> = {};
    applications.forEach(a => {
      const type = a.job.serviceType || 'other';
      byServiceType[type] = (byServiceType[type] || 0) + 1;
    });

    // Breakdown by send method
    const bySendMethod: Record<string, number> = {};
    applications.forEach(a => {
      const method = sendMethodMap.get(a.jobId) || 'direct';
      bySendMethod[method] = (bySendMethod[method] || 0) + 1;
    });

    // Benchmarks (mock network averages - in real app would come from actual data)
    const networkAvgApprovalRate = 65;
    const networkAvgTimeToFund = 3.5;

    // Generate recommendations
    const recommendations = generateRecommendations(
      approvalRate,
      avgLoanAmount,
      avgTimeToFund,
      byServiceType,
      bySendMethod
    );

    return NextResponse.json({
      overview: {
        totalApplications,
        approvalRate,
        avgLoanAmount,
        avgTimeToFund,
      },
      trends: {
        approvalRateByMonth,
        fundingByMonth,
        applicationsByMonth,
      },
      breakdown: {
        byStatus,
        byServiceType,
        bySendMethod,
      },
      benchmarks: {
        yourApprovalRate: approvalRate,
        networkAvgApprovalRate,
        yourAvgTimeToFund: avgTimeToFund,
        networkAvgTimeToFund,
      },
      recommendations,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

function getEmptyAnalytics() {
  return {
    overview: {
      totalApplications: 0,
      approvalRate: 0,
      avgLoanAmount: 0,
      avgTimeToFund: 0,
    },
    trends: {
      approvalRateByMonth: [],
      fundingByMonth: [],
      applicationsByMonth: [],
    },
    breakdown: {
      byStatus: {},
      byServiceType: {},
      bySendMethod: {},
    },
    benchmarks: {
      yourApprovalRate: 0,
      networkAvgApprovalRate: 65,
      yourAvgTimeToFund: 0,
      networkAvgTimeToFund: 3.5,
    },
    recommendations: [],
  };
}

function generateRecommendations(
  approvalRate: number,
  avgLoanAmount: number,
  avgTimeToFund: number,
  byServiceType: Record<string, number>,
  bySendMethod: Record<string, number>
): Array<{ id: string; title: string; description: string; impact: 'high' | 'medium' | 'low' }> {
  const recommendations = [];

  // Approval rate recommendation
  if (approvalRate < 60) {
    recommendations.push({
      id: 'approval-rate',
      title: 'Improve approval rate',
      description: 'Consider pre-qualifying customers before sending financing links. Customers with stable income and good credit history have higher approval rates.',
      impact: 'high' as const,
    });
  }

  // QR code adoption
  const qrCount = bySendMethod['qr'] || 0;
  const totalCount = Object.values(bySendMethod).reduce((a, b) => a + b, 0);
  if (totalCount > 0 && qrCount / totalCount < 0.3) {
    recommendations.push({
      id: 'qr-adoption',
      title: 'Try QR codes for faster applications',
      description: 'QR codes have 20% higher completion rates. Show customers the QR code on your phone for instant applications.',
      impact: 'high' as const,
    });
  }

  // Loan amount optimization
  if (avgLoanAmount > 0 && avgLoanAmount < 5000) {
    recommendations.push({
      id: 'loan-amount',
      title: 'Consider offering financing for larger jobs',
      description: 'Customers financing $5,000-$10,000 have the highest approval rates and best repayment performance.',
      impact: 'medium' as const,
    });
  }

  // Service type diversification
  const serviceTypes = Object.keys(byServiceType);
  if (serviceTypes.length === 1) {
    recommendations.push({
      id: 'diversify',
      title: 'Diversify your service offerings',
      description: 'Expanding into related services can increase your financing volume and approval rates.',
      impact: 'low' as const,
    });
  }

  // Time to fund
  if (avgTimeToFund > 4) {
    recommendations.push({
      id: 'speed',
      title: 'Help customers complete applications faster',
      description: 'Applications completed within 24 hours fund 30% faster. Follow up with customers who start but don\'t finish.',
      impact: 'medium' as const,
    });
  }

  return recommendations;
}
