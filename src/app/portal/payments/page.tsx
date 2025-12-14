// ABOUTME: Borrower portal payment history page
// ABOUTME: Shows paid and upcoming payments

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useBorrowerAuth } from '@/lib/auth/borrower-context';

interface Payment {
  loanId: string;
  lenderName: string;
  date: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  paymentNumber: number;
  totalPayments: number;
}

interface PaymentsData {
  summary: {
    totalPaid: number;
    totalUpcoming: number;
    paymentsMade: number;
    paymentsRemaining: number;
  };
  paidPayments: Payment[];
  upcomingPayments: Payment[];
}

export default function PortalPaymentsPage() {
  const { user, loading: authLoading, logout } = useBorrowerAuth();
  const [data, setData] = useState<PaymentsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming');

  useEffect(() => {
    if (!authLoading && user) {
      fetchPayments();
    }
  }, [authLoading, user]);

  const fetchPayments = async () => {
    try {
      const res = await fetch('/api/v1/portal/payments');
      if (!res.ok) throw new Error('Failed to load payments');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Payments error:', err);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/10 text-success">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Paid
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
            Upcoming
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-error/10 text-error">
            Overdue
          </span>
        );
      default:
        return null;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading payments...</p>
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
            <div className="flex items-center gap-4">
              <Link href="/portal" className="p-2 -ml-2 hover:bg-white/10 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-lg font-bold font-display">Payments</h1>
            </div>
            <button
              onClick={logout}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Summary Cards */}
        {data && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <p className="text-xs text-gray-500 mb-1">Total Paid</p>
              <p className="text-xl font-bold font-display text-success">
                {formatCurrency(data.summary.totalPaid)}
              </p>
              <p className="text-xs text-gray-500">{data.summary.paymentsMade} payments</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg">
              <p className="text-xs text-gray-500 mb-1">Remaining</p>
              <p className="text-xl font-bold font-display text-navy">
                {formatCurrency(data.summary.totalUpcoming)}
              </p>
              <p className="text-xs text-gray-500">{data.summary.paymentsRemaining} payments</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'upcoming'
                ? 'bg-navy text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            Upcoming
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
              activeTab === 'history'
                ? 'bg-navy text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            History
          </button>
        </div>

        {/* Payment List */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {activeTab === 'upcoming' ? (
            data?.upcomingPayments.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-navy font-semibold font-display">All caught up!</p>
                <p className="text-sm text-gray-500">No upcoming payments.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {data?.upcomingPayments.map((payment, i) => (
                  <div key={`${payment.loanId}-${i}`} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-navy">{formatDate(payment.date)}</p>
                      <p className="text-sm text-gray-500">
                        {payment.lenderName} · Payment {payment.paymentNumber} of {payment.totalPayments}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-navy">{formatCurrency(payment.amount)}</p>
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            data?.paidPayments.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500">No payment history yet.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {data?.paidPayments.map((payment, i) => (
                  <div key={`${payment.loanId}-${i}`} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-navy">{formatDate(payment.date)}</p>
                      <p className="text-sm text-gray-500">
                        {payment.lenderName} · Payment {payment.paymentNumber} of {payment.totalPayments}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-navy">{formatCurrency(payment.amount)}</p>
                      {getStatusBadge(payment.status)}
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Info Note */}
        <div className="mt-6 p-4 bg-teal/10 border border-teal/20 rounded-xl">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-navy">About Payments</p>
              <p className="text-sm text-gray-600 mt-1">
                Payments are automatically processed on the due date. If you need to make changes 
                or have questions, please contact our support team.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden safe-area-bottom">
        <div className="flex">
          <Link
            href="/portal"
            className="flex-1 flex flex-col items-center py-3 text-gray-500"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link
            href="/portal/payments"
            className="flex-1 flex flex-col items-center py-3 text-teal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-xs mt-1 font-medium">Payments</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
