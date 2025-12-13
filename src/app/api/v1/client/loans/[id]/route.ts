// ABOUTME: SuprClient loan detail API
// ABOUTME: Returns detailed loan info with payment schedule

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

    // Get loan with related data
    const loan = await prisma.loan.findUnique({
      where: { id },
      include: {
        application: {
          include: {
            customer: true,
            job: true,
            decision: {
              include: {
                offers: {
                  where: { selected: true },
                },
              },
            },
          },
        },
      },
    });

    if (!loan) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    // Verify ownership
    const contractorJob = await prisma.contractorJob.findUnique({
      where: { jobId: loan.application.jobId },
    });

    if (!contractorJob || contractorJob.contractorId !== user.contractorId) {
      return NextResponse.json({ error: 'Loan not found' }, { status: 404 });
    }

    const selectedOffer = loan.application.decision?.offers[0];

    // Generate payment schedule (mock - in real app would come from loan servicer)
    const termMonths = selectedOffer?.termMonths || 36;
    const monthlyPayment = selectedOffer ? Number(selectedOffer.monthlyPayment) : 0;
    const fundingDate = loan.fundingDate || new Date();
    
    const now = new Date();
    const paymentSchedule = [];
    
    for (let i = 1; i <= termMonths; i++) {
      const dueDate = new Date(fundingDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      let status: 'paid' | 'upcoming' | 'overdue';
      if (dueDate < now) {
        status = 'paid'; // Assume paid if past due date (simplified)
      } else if (dueDate <= new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)) {
        status = 'upcoming';
      } else {
        status = 'upcoming';
      }
      
      paymentSchedule.push({
        month: i,
        dueDate: dueDate.toISOString(),
        amount: monthlyPayment,
        status,
      });
    }

    // Log view
    await logContractorAudit({
      userId: user.id,
      action: 'viewed_loan',
      targetType: 'loan',
      targetId: loan.id,
      ipAddress: request.headers.get('x-forwarded-for') || undefined,
      userAgent: request.headers.get('user-agent') || undefined,
    });

    return NextResponse.json({
      loan: {
        id: loan.id,
        customer: {
          name: `${loan.application.customer.firstName} ${loan.application.customer.lastName}`,
          maskedEmail: maskEmail(loan.application.customer.email),
        },
        fundedAmount: Number(loan.fundedAmount),
        fundingDate: loan.fundingDate?.toISOString(),
        status: loan.status,
        lenderName: loan.lenderName,
        offer: selectedOffer ? {
          termMonths: selectedOffer.termMonths,
          apr: Number(selectedOffer.apr),
          monthlyPayment: Number(selectedOffer.monthlyPayment),
        } : null,
        paymentSchedule,
        applicationId: loan.applicationId,
      },
    });
  } catch (error) {
    console.error('Loan detail API error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}

function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!user || !domain) return '***@***.com';
  const maskedUser = user.charAt(0) + '***' + (user.length > 1 ? user.charAt(user.length - 1) : '');
  return `${maskedUser}@${domain}`;
}
