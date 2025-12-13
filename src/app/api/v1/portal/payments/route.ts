// ABOUTME: Borrower portal payment history API
// ABOUTME: Returns payment schedule and history for loans

import { NextResponse } from 'next/server';
import { getBorrowerSessionFromCookies } from '@/lib/auth/borrower-session';
import { prisma } from '@/lib/prisma';

interface PaymentScheduleItem {
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}

export async function GET() {
  try {
    const user = await getBorrowerSessionFromCookies();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get customer's loans with payment schedules
    const loans = await prisma.loan.findMany({
      where: {
        application: {
          customerId: user.customerId,
        },
      },
      include: {
        application: {
          include: {
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
      orderBy: { createdAt: 'desc' },
    });

    // Compile all payments across loans
    const allPayments: Array<{
      loanId: string;
      lenderName: string;
      date: string;
      amount: number;
      status: 'paid' | 'pending' | 'overdue';
      paymentNumber: number;
      totalPayments: number;
    }> = [];

    loans.forEach((loan) => {
      const schedule = (loan.paymentSchedule as unknown as PaymentScheduleItem[]) || [];
      const selectedOffer = loan.application.decision?.offers.find((o) => o.selected);
      const totalPayments = selectedOffer?.termMonths || schedule.length;

      schedule.forEach((payment, index) => {
        allPayments.push({
          loanId: loan.id,
          lenderName: loan.lenderName || 'SuprFi',
          date: payment.date,
          amount: payment.amount,
          status: payment.status,
          paymentNumber: index + 1,
          totalPayments,
        });
      });
    });

    // Sort by date descending (most recent first)
    allPayments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Separate paid and upcoming
    const paidPayments = allPayments.filter((p) => p.status === 'paid');
    const upcomingPayments = allPayments
      .filter((p) => p.status === 'pending' || p.status === 'overdue')
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Calculate totals
    const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalUpcoming = upcomingPayments.reduce((sum, p) => sum + p.amount, 0);

    return NextResponse.json({
      summary: {
        totalPaid,
        totalUpcoming,
        paymentsMade: paidPayments.length,
        paymentsRemaining: upcomingPayments.length,
      },
      paidPayments: paidPayments.slice(0, 12), // Last 12 payments
      upcomingPayments: upcomingPayments.slice(0, 6), // Next 6 payments
    });
  } catch (error) {
    console.error('Portal payments error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
