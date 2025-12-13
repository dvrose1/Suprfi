// ABOUTME: Borrower portal dashboard API
// ABOUTME: Returns loan summary, balance, next payment

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

    // Get customer's loans
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

    if (loans.length === 0) {
      return NextResponse.json({
        hasLoans: false,
        message: 'No active loans found',
      });
    }

    // Calculate loan summaries
    const loanSummaries = loans.map((loan) => {
      const selectedOffer = loan.application.decision?.offers.find((o) => o.selected);
      const paymentSchedule = (loan.paymentSchedule as unknown as PaymentScheduleItem[]) || [];
      
      // Calculate payments made and remaining
      const paidPayments = paymentSchedule.filter((p) => p.status === 'paid');
      const pendingPayments = paymentSchedule.filter((p) => p.status === 'pending');
      const overduePayments = paymentSchedule.filter((p) => p.status === 'overdue');
      
      const totalPaid = paidPayments.reduce((sum, p) => sum + p.amount, 0);
      const remainingBalance = Number(loan.fundedAmount) - totalPaid + 
        (selectedOffer ? Number(selectedOffer.totalAmount) - Number(loan.fundedAmount) : 0);
      
      // Find next payment
      const nextPayment = pendingPayments
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

      return {
        id: loan.id,
        lenderName: loan.lenderName || 'SuprFi',
        fundedAmount: Number(loan.fundedAmount),
        fundingDate: loan.fundingDate?.toISOString(),
        status: loan.status,
        apr: selectedOffer ? Number(selectedOffer.apr) : null,
        termMonths: selectedOffer ? selectedOffer.termMonths : null,
        monthlyPayment: selectedOffer ? Number(selectedOffer.monthlyPayment) : null,
        totalAmount: selectedOffer ? Number(selectedOffer.totalAmount) : null,
        remainingBalance: Math.max(0, remainingBalance),
        paymentsMade: paidPayments.length,
        paymentsRemaining: pendingPayments.length,
        overduePayments: overduePayments.length,
        nextPayment: nextPayment ? {
          date: nextPayment.date,
          amount: nextPayment.amount,
        } : null,
        progress: selectedOffer?.termMonths 
          ? Math.round((paidPayments.length / selectedOffer.termMonths) * 100) 
          : 0,
      };
    });

    // Overall summary
    const totalBalance = loanSummaries.reduce((sum, l) => sum + l.remainingBalance, 0);
    const totalOverdue = loanSummaries.reduce((sum, l) => sum + l.overduePayments, 0);
    const nextPaymentDue = loanSummaries
      .filter((l) => l.nextPayment)
      .sort((a, b) => 
        new Date(a.nextPayment!.date).getTime() - new Date(b.nextPayment!.date).getTime()
      )[0]?.nextPayment;

    return NextResponse.json({
      hasLoans: true,
      summary: {
        totalLoans: loans.length,
        totalBalance,
        totalOverdue,
        nextPaymentDue,
      },
      loans: loanSummaries,
    });
  } catch (error) {
    console.error('Portal dashboard error:', error);
    return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
  }
}
