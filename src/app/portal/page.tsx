// ABOUTME: Borrower portal dashboard page
// ABOUTME: Shows loan balance, next payment, and loan status

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useBorrowerAuth } from '@/lib/auth/borrower-context';

interface LoanSummary {
  id: string;
  lenderName: string;
  fundedAmount: number;
  fundingDate: string | null;
  status: string;
  apr: number | null;
  termMonths: number | null;
  monthlyPayment: number | null;
  totalAmount: number | null;
  remainingBalance: number;
  paymentsMade: number;
  paymentsRemaining: number;
  overduePayments: number;
  nextPayment: { date: string; amount: number } | null;
  progress: number;
}

interface DashboardData {
  hasLoans: boolean;
  message?: string;
  summary?: {
    totalLoans: number;
    totalBalance: number;
    totalOverdue: number;
    nextPaymentDue: { date: string; amount: number } | null;
  };
  loans?: LoanSummary[];
}

export default function PortalDashboardPage() {
  const { user, loading: authLoading, logout } = useBorrowerAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && user) {
      fetchDashboard();
    }
  }, [authLoading, user]);

  const fetchDashboard = async () => {
    try {
      const res = await fetch('/api/v1/portal/dashboard');
      if (!res.ok) throw new Error('Failed to load dashboard');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load your loan information');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'funded':
      case 'repaying':
        return 'bg-success/10 text-success';
      case 'paid_off':
        return 'bg-teal/10 text-teal';
      case 'pending':
        return 'bg-warning/10 text-warning';
      case 'defaulted':
        return 'bg-error/10 text-error';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header */}
      <header className="bg-navy text-white">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold font-display">
                <span className="text-white">Supr</span>
                <span className="text-teal">Fi</span>
              </span>
              <p className="text-sm text-gray-400">Borrower Portal</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300 hidden sm:block">
                {user.name}
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Welcome */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold font-display text-navy">
            Welcome, {user.firstName}
          </h1>
          <p className="text-gray-600">Here&apos;s an overview of your loan.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error">
            {error}
          </div>
        )}

        {data && !data.hasLoans && (
          <div className="bg-white rounded-2xl p-8 text-center shadow-lg">
            <div className="w-16 h-16 bg-light-gray rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold font-display text-navy mb-2">No Active Loans</h2>
            <p className="text-gray-600">
              You don&apos;t have any active loans yet. Check back later once your financing is approved.
            </p>
          </div>
        )}

        {data?.hasLoans && data.summary && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-2xl p-5 shadow-lg">
                <p className="text-sm text-gray-500 mb-1">Total Balance</p>
                <p className="text-2xl font-bold font-display text-navy">
                  {formatCurrency(data.summary.totalBalance)}
                </p>
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-lg">
                <p className="text-sm text-gray-500 mb-1">Next Payment</p>
                {data.summary.nextPaymentDue ? (
                  <>
                    <p className="text-2xl font-bold font-display text-navy">
                      {formatCurrency(data.summary.nextPaymentDue.amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      Due {formatDate(data.summary.nextPaymentDue.date)}
                    </p>
                  </>
                ) : (
                  <p className="text-lg text-gray-400">No upcoming</p>
                )}
              </div>
              <div className="bg-white rounded-2xl p-5 shadow-lg">
                <p className="text-sm text-gray-500 mb-1">Active Loans</p>
                <p className="text-2xl font-bold font-display text-navy">
                  {data.summary.totalLoans}
                </p>
                {data.summary.totalOverdue > 0 && (
                  <p className="text-sm text-error">
                    {data.summary.totalOverdue} overdue payment{data.summary.totalOverdue > 1 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Loan Cards */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold font-display text-navy">Your Loans</h2>
              
              {data.loans?.map((loan) => (
                <div key={loan.id} className="bg-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold font-display text-navy">{loan.lenderName}</h3>
                      <p className="text-sm text-gray-500">Loan ID: {loan.id.slice(-8).toUpperCase()}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(loan.status)}`}>
                      {loan.status.replace('_', ' ').charAt(0).toUpperCase() + loan.status.slice(1).replace('_', ' ')}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progress</span>
                      <span className="text-navy font-medium">{loan.progress}%</span>
                    </div>
                    <div className="h-2 bg-light-gray rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-teal rounded-full transition-all"
                        style={{ width: `${loan.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {loan.paymentsMade} of {loan.paymentsMade + loan.paymentsRemaining} payments made
                    </p>
                  </div>

                  {/* Loan Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">Original Amount</p>
                      <p className="font-semibold text-navy">{formatCurrency(loan.fundedAmount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Remaining</p>
                      <p className="font-semibold text-navy">{formatCurrency(loan.remainingBalance)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Monthly Payment</p>
                      <p className="font-semibold text-navy">
                        {loan.monthlyPayment ? formatCurrency(loan.monthlyPayment) : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">APR</p>
                      <p className="font-semibold text-navy">{loan.apr ? `${loan.apr}%` : 'N/A'}</p>
                    </div>
                  </div>

                  {/* Next Payment Alert */}
                  {loan.nextPayment && (
                    <div className="mt-4 p-3 bg-teal/10 border border-teal/20 rounded-xl">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-navy">Next Payment</p>
                          <p className="text-xs text-gray-600">Due {formatDate(loan.nextPayment.date)}</p>
                        </div>
                        <p className="text-lg font-bold font-display text-navy">
                          {formatCurrency(loan.nextPayment.amount)}
                        </p>
                      </div>
                    </div>
                  )}

                  {loan.overduePayments > 0 && (
                    <div className="mt-4 p-3 bg-error/10 border border-error/20 rounded-xl">
                      <p className="text-sm font-medium text-error">
                        {loan.overduePayments} overdue payment{loan.overduePayments > 1 ? 's' : ''} - Please contact support
                      </p>
                    </div>
                  )}

                  {/* Pay Off Button - only show for active loans */}
                  {(loan.status === 'funded' || loan.status === 'repaying') && loan.remainingBalance > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <Link
                        href={`/portal/payoff?loanId=${loan.id}`}
                        className="block w-full py-3 px-4 bg-navy/10 text-navy text-center text-sm font-semibold rounded-lg hover:bg-navy/20 transition-colors"
                      >
                        Pay Off Loan Early
                      </Link>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Links */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/portal/payments"
                className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-teal/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-navy">Payment History</p>
                  <p className="text-sm text-gray-500">View all your payments</p>
                </div>
              </Link>
              <a
                href="mailto:support@suprfi.com"
                className="bg-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-shadow flex items-center gap-4"
              >
                <div className="w-10 h-10 bg-cyan/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-navy">Get Help</p>
                  <p className="text-sm text-gray-500">Contact our support team</p>
                </div>
              </a>
            </div>
          </>
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden safe-area-bottom">
        <div className="flex">
          <Link
            href="/portal"
            className="flex-1 flex flex-col items-center py-3 text-teal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1 font-medium">Home</span>
          </Link>
          <Link
            href="/portal/payments"
            className="flex-1 flex flex-col items-center py-3 text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs mt-1">Payments</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
