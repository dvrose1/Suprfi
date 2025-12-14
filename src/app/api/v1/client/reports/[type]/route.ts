// ABOUTME: SuprClient report download API
// ABOUTME: Generates CSV reports for applications, loans, and summary

import { NextRequest, NextResponse } from 'next/server';
import { getContractorSessionFromCookies } from '@/lib/auth/contractor-session';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  try {
    const user = await getContractorSessionFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = await params;
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get contractor's job IDs
    const contractorJobs = await prisma.contractorJob.findMany({
      where: { contractorId: user.contractorId },
      select: { jobId: true, initiatedBy: true },
    });
    const jobIds = contractorJobs.map(cj => cj.jobId);
    const jobTechnicianMap = new Map(contractorJobs.map(cj => [cj.jobId, cj.initiatedBy]));

    // Get technicians
    const technicians = await prisma.contractorUser.findMany({
      where: { contractorId: user.contractorId },
      select: { id: true, name: true, email: true },
    });
    const technicianMap = new Map(technicians.map(t => [t.id, t.name || t.email]));

    let csv = '';
    
    if (type === 'applications') {
      const applications = await prisma.application.findMany({
        where: {
          jobId: { in: jobIds },
          createdAt: { gte: startDate },
        },
        include: {
          customer: true,
          job: true,
          loan: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      csv = 'Date,Customer Name,Email,Phone,Status,Amount,Service Type,Technician,CRM Customer ID,CRM Job ID\n';
      applications.forEach(app => {
        const techId = jobTechnicianMap.get(app.jobId);
        const techName = techId ? technicianMap.get(techId) || '' : '';
        csv += `${app.createdAt.toISOString().split('T')[0]},`;
        csv += `"${app.customer.firstName} ${app.customer.lastName}",`;
        csv += `${app.customer.email},`;
        csv += `${app.customer.phone},`;
        csv += `${app.status},`;
        csv += `${app.job.estimateAmount},`;
        csv += `${app.job.serviceType || ''},`;
        csv += `"${techName}",`;
        csv += `${app.customer.crmCustomerId || ''},`;
        csv += `${app.job.crmJobId || ''}\n`;
      });
    } else if (type === 'loans') {
      const applications = await prisma.application.findMany({
        where: {
          jobId: { in: jobIds },
          status: 'funded',
          loan: { isNot: null },
        },
        include: {
          customer: true,
          job: true,
          loan: true,
          decision: {
            include: {
              offers: { where: { selected: true } },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      csv = 'Funding Date,Customer Name,Email,Funded Amount,Term (months),APR,Monthly Payment,Status,Technician,CRM Customer ID,CRM Job ID\n';
      applications.forEach(app => {
        if (!app.loan) return;
        const techId = jobTechnicianMap.get(app.jobId);
        const techName = techId ? technicianMap.get(techId) || '' : '';
        const offer = app.decision?.offers[0];
        csv += `${app.loan.fundingDate?.toISOString().split('T')[0] || ''},`;
        csv += `"${app.customer.firstName} ${app.customer.lastName}",`;
        csv += `${app.customer.email},`;
        csv += `${app.loan.fundedAmount},`;
        csv += `${offer?.termMonths || ''},`;
        csv += `${offer?.apr || ''},`;
        csv += `${offer?.monthlyPayment || ''},`;
        csv += `${app.loan.status},`;
        csv += `"${techName}",`;
        csv += `${app.customer.crmCustomerId || ''},`;
        csv += `${app.job.crmJobId || ''}\n`;
      });
    } else if (type === 'summary') {
      const applications = await prisma.application.findMany({
        where: {
          jobId: { in: jobIds },
          createdAt: { gte: startDate },
        },
        include: {
          job: true,
          loan: true,
        },
      });

      const totalApps = applications.length;
      const submitted = applications.filter(a => a.status !== 'initiated').length;
      const approved = applications.filter(a => ['approved', 'funded'].includes(a.status)).length;
      const funded = applications.filter(a => a.status === 'funded').length;
      const fundedAmount = applications
        .filter(a => a.loan)
        .reduce((sum, a) => sum + Number(a.loan!.fundedAmount), 0);
      const avgLoanSize = funded > 0 ? fundedAmount / funded : 0;
      const approvalRate = submitted > 0 ? Math.round((approved / submitted) * 100) : 0;

      csv = 'Summary Report\n';
      csv += `Period,Last ${days} days\n`;
      csv += `Generated,${new Date().toISOString()}\n\n`;
      csv += 'Metric,Value\n';
      csv += `Total Applications,${totalApps}\n`;
      csv += `Submitted,${submitted}\n`;
      csv += `Approved,${approved}\n`;
      csv += `Funded,${funded}\n`;
      csv += `Approval Rate,${approvalRate}%\n`;
      csv += `Total Funded Amount,$${fundedAmount.toLocaleString()}\n`;
      csv += `Average Loan Size,$${Math.round(avgLoanSize).toLocaleString()}\n`;
    } else {
      return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${type}-report.csv"`,
      },
    });
  } catch (error) {
    console.error('Report API error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
