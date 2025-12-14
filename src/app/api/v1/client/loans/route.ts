// ABOUTME: SuprClient loans list API
// ABOUTME: Returns funded loans for the contractor

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
    const status = searchParams.get('status');

    // Get contractor's job IDs
    const contractorJobs = await prisma.contractorJob.findMany({
      where: { contractorId: user.contractorId },
      select: { jobId: true },
    });
    const jobIds = contractorJobs.map(cj => cj.jobId);

    if (jobIds.length === 0) {
      return NextResponse.json({
        loans: [],
        stats: {
          totalLoans: 0,
          activeLoans: 0,
          totalFunded: 0,
          fundedThisMonth: 0,
          fundedYTD: 0,
        },
      });
    }

    // Get applications with loans
    const applications = await prisma.application.findMany({
      where: {
        jobId: { in: jobIds },
        loan: { isNot: null },
      },
      include: {
        customer: true,
        job: true,
        loan: true,
        decision: {
          include: {
            offers: {
              where: { selected: true },
            },
          },
        },
      },
    });

    // Filter by status if provided
    let filteredApps = applications;
    if (status && status !== 'all') {
      filteredApps = applications.filter(a => a.loan?.status === status);
    }

    // Calculate stats
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const allLoans = applications.filter(a => a.loan);
    const totalFunded = allLoans.reduce((sum, a) => sum + Number(a.loan!.fundedAmount), 0);
    const fundedThisMonth = allLoans
      .filter(a => a.loan!.fundingDate && a.loan!.fundingDate >= startOfMonth)
      .reduce((sum, a) => sum + Number(a.loan!.fundedAmount), 0);
    const fundedYTD = allLoans
      .filter(a => a.loan!.fundingDate && a.loan!.fundingDate >= startOfYear)
      .reduce((sum, a) => sum + Number(a.loan!.fundedAmount), 0);
    const activeLoans = allLoans.filter(a => a.loan!.status === 'repaying' || a.loan!.status === 'funded').length;

    // Get contractor job info for each application
    const appJobIds = applications.map(a => a.jobId);
    const contractorJobsData = await prisma.contractorJob.findMany({
      where: { jobId: { in: appJobIds } },
      include: { contractor: true },
    });
    const contractorJobMap = new Map(contractorJobsData.map(cj => [cj.jobId, cj]));

    // Get technician names
    const initiatorIds = contractorJobsData
      .filter(cj => cj.initiatedBy)
      .map(cj => cj.initiatedBy as string);
    const technicians = initiatorIds.length > 0
      ? await prisma.contractorUser.findMany({
          where: { id: { in: initiatorIds } },
          select: { id: true, name: true, email: true },
        })
      : [];
    const technicianMap = new Map(technicians.map(t => [t.id, t.name || t.email]));

    // Format loans with merchant-relevant info
    const loans = filteredApps.map(app => {
      const selectedOffer = app.decision?.offers[0];
      const termMonths = selectedOffer?.termMonths || 36;
      const monthlyPayment = selectedOffer ? Number(selectedOffer.monthlyPayment) : 0;
      
      // Get job and contractor info
      const job = app.job;
      const contractorJob = contractorJobMap.get(app.jobId);
      const technicianName = contractorJob?.initiatedBy 
        ? technicianMap.get(contractorJob.initiatedBy) 
        : null;
      
      // Calculate merchant fee (default 3% - in production would come from contractor settings)
      const totalSaleAmount = Number(job.estimateAmount);
      const fundedAmount = Number(app.loan!.fundedAmount);
      const merchantFeeRate = 0.03; // 3% default
      const merchantFee = Math.round(fundedAmount * merchantFeeRate * 100) / 100;
      const netFundedAmount = fundedAmount - merchantFee;
      
      // Calculate payment progress (mock - in real app would track actual payments)
      const daysSinceFunding = app.loan!.fundingDate
        ? Math.floor((now.getTime() - app.loan!.fundingDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;
      const monthsSinceFunding = Math.floor(daysSinceFunding / 30);
      const paymentsMade = Math.min(monthsSinceFunding, termMonths);
      const paymentsRemaining = termMonths - paymentsMade;
      const paymentProgress = Math.round((paymentsMade / termMonths) * 100);

      return {
        id: app.loan!.id,
        customer: {
          name: `${app.customer.firstName} ${app.customer.lastName.charAt(0)}.`,
        },
        // Merchant-relevant fields
        totalSaleAmount,
        fundedAmount,
        merchantFee,
        netFundedAmount,
        fundingDate: app.loan!.fundingDate?.toISOString(),
        status: app.loan!.status,
        serviceType: job.serviceType,
        technicianName,
        crmCustomerId: app.customer.crmCustomerId,
        crmJobId: job.crmJobId,
        // Keep legacy fields for backwards compatibility (will port to admin)
        monthlyPayment,
        termMonths,
        paymentsRemaining,
        paymentProgress,
      };
    });

    // Sort by funding date descending
    loans.sort((a, b) => {
      if (!a.fundingDate) return 1;
      if (!b.fundingDate) return -1;
      return new Date(b.fundingDate).getTime() - new Date(a.fundingDate).getTime();
    });

    return NextResponse.json({
      loans,
      stats: {
        totalLoans: allLoans.length,
        activeLoans,
        totalFunded,
        fundedThisMonth,
        fundedYTD,
      },
    });
  } catch (error) {
    console.error('Loans API error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
