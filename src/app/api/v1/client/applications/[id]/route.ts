// ABOUTME: SuprClient application detail API
// ABOUTME: Returns detailed application info with timeline

import { NextRequest, NextResponse } from 'next/server';
import { getContractorSessionFromCookies } from '@/lib/auth/contractor-session';
import { logContractorAudit } from '@/lib/auth/contractor-audit';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getContractorSessionFromCookies();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get application with all related data
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        customer: true,
        job: true,
        decision: {
          include: {
            offers: true,
          },
        },
        loan: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Verify this application belongs to the contractor
    const contractorJob = await prisma.contractorJob.findUnique({
      where: { jobId: application.jobId },
    });

    if (!contractorJob || contractorJob.contractorId !== user.contractorId) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Build timeline
    const timeline = buildTimeline(application, contractorJob);

    // Log view
    await logContractorAudit({
      userId: user.id,
      action: 'viewed_application',
      targetType: 'application',
      targetId: application.id,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      application: {
        id: application.id,
        status: application.status,
        token: application.token,
        customer: {
          name: `${application.customer.firstName} ${application.customer.lastName}`,
          email: application.customer.email,
          phone: application.customer.phone,
          maskedEmail: maskEmail(application.customer.email),
          maskedPhone: maskPhone(application.customer.phone),
        },
        job: {
          amount: Number(application.job.estimateAmount),
          serviceType: application.job.serviceType,
        },
        decision: application.decision ? {
          status: application.decision.decisionStatus,
          score: application.decision.score,
        } : null,
        offers: application.decision?.offers.map(offer => ({
          id: offer.id,
          termMonths: offer.termMonths,
          apr: Number(offer.apr),
          monthlyPayment: Number(offer.monthlyPayment),
          selected: offer.selected,
        })) || [],
        loan: application.loan ? {
          id: application.loan.id,
          fundedAmount: Number(application.loan.fundedAmount),
          fundingDate: application.loan.fundingDate?.toISOString(),
          status: application.loan.status,
        } : null,
        timeline,
        createdAt: application.createdAt.toISOString(),
        updatedAt: application.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Application detail API error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

interface ApplicationData {
  createdAt: Date;
  updatedAt: Date;
  status: string;
  decision: {
    decidedAt: Date;
    decisionStatus: string;
    offers: Array<{
      selected: boolean;
      selectedAt: Date | null;
    }>;
  } | null;
  loan: {
    fundingDate: Date | null;
  } | null;
}

interface ContractorJobData {
  initiatedAt: Date;
  sendMethod: string | null;
}

function buildTimeline(application: ApplicationData, contractorJob: ContractorJobData) {
  const events = [];

  // Link sent
  events.push({
    event: `Financing link sent${contractorJob.sendMethod ? ` via ${contractorJob.sendMethod.toUpperCase()}` : ''}`,
    timestamp: contractorJob.initiatedAt.toISOString(),
    actor: 'Technician',
  });

  // Application created
  if (application.createdAt > contractorJob.initiatedAt) {
    events.push({
      event: 'Customer started application',
      timestamp: application.createdAt.toISOString(),
    });
  }

  // Submitted
  if (application.status !== 'initiated') {
    events.push({
      event: 'Application submitted',
      timestamp: application.updatedAt.toISOString(),
    });
  }

  // Decision
  if (application.decision) {
    events.push({
      event: `Application ${application.decision.decisionStatus}`,
      timestamp: application.decision.decidedAt.toISOString(),
      actor: 'System',
    });
  }

  // Offer selected
  const selectedOffer = application.decision?.offers.find(o => o.selected);
  if (selectedOffer?.selectedAt) {
    events.push({
      event: 'Customer selected financing offer',
      timestamp: selectedOffer.selectedAt.toISOString(),
    });
  }

  // Funded
  if (application.loan?.fundingDate) {
    events.push({
      event: 'Loan funded',
      timestamp: application.loan.fundingDate.toISOString(),
    });
  }

  // Sort by timestamp descending (newest first)
  return events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!user || !domain) return '***@***.com';
  const maskedUser = user.charAt(0) + '***' + (user.length > 1 ? user.charAt(user.length - 1) : '');
  return `${maskedUser}@${domain}`;
}

function maskPhone(phone: string): string {
  if (!phone || phone.length < 4) return '(***) ***-****';
  return `(***) ***-${phone.slice(-4)}`;
}
