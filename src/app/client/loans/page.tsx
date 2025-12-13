// ABOUTME: SuprClient loans list page
// ABOUTME: Shows funded loans with payment progress

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useContractorAuth } from '@/lib/auth/contractor-context';
import ClientHeader from '@/components/client/ClientHeader';

interface Loan {
  id: string;
  customer: {
    name: string;
  };
  fundedAmount: number;
  fundingDate: string;
  status: string;
  monthlyPayment: number;
  termMonths: number;
  paymentsRemaining: number;
  paymentProgress: number;
}

interface LoanStats {
  totalLoans: number;
  activeLoans: number;
  totalFunded: number;
  fundedThisMonth: number;
  fundedYTD: number;
}

export default function LoansPage() {
  const { user, loading: authLoading } = useContractorAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [stats, setStats] = useState<LoanStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (user) {
      fetchLoans();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, statusFilter]);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`/api/v1/client/loans?${params}`);
      if (res.ok) {
        const data = await res.json();
        setLoans(data.loans);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch loans:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'funded':
      case 'repaying':
        return 'bg-mint/20 text-mint border-mint/30';
      case 'paid_off':
        return 'bg-teal/20 text-teal border-teal/30';
      case 'defaulted':
        return 'bg-error/20 text-error border-error/30';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white">
      <ClientHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-navy">Funded Loans</h1>
          <p className="text-gray-600 mt-1">Track your customers&apos; active loans</p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Total Loans</div>
              <div className="text-3xl font-bold text-navy">{stats.totalLoans}</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Active</div>
              <div className="text-3xl font-bold text-mint">{stats.activeLoans}</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-1">This Month</div>
              <div className="text-2xl font-bold text-navy">${stats.fundedThisMonth.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-1">YTD</div>
              <div className="text-2xl font-bold text-navy">${stats.fundedYTD.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Lifetime</div>
              <div className="text-2xl font-bold text-teal">${stats.totalFunded.toLocaleString()}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          {['all', 'repaying', 'paid_off'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === status
                  ? 'bg-teal text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {status === 'all' ? 'All' : status === 'repaying' ? 'Active' : 'Paid Off'}
            </button>
          ))}
        </div>

        {/* Loans List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-teal border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading loans...</p>
          </div>
        ) : loans.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-5xl mb-4">💰</div>
            <h3 className="text-xl font-semibold text-navy mb-2">No loans yet</h3>
            <p className="text-gray-600 mb-6">
              Loans will appear here once customers complete their financing.
            </p>
            <Link
              href="/client/applications"
              className="inline-flex items-center gap-2 bg-teal text-white rounded-lg font-semibold px-6 py-3 hover:bg-teal/90 transition-colors"
            >
              View Applications
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {loans.map((loan) => (
              <Link
                key={loan.id}
                href={`/client/loans/${loan.id}`}
                className="block bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-navy text-lg">{loan.customer.name}</h3>
                    <p className="text-sm text-gray-500">
                      Funded {new Date(loan.fundingDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(loan.status)}`}>
                    {loan.status === 'repaying' ? 'Active' : loan.status.replace('_', ' ')}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Funded Amount</div>
                    <div className="text-xl font-bold text-navy">${loan.fundedAmount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Monthly Payment</div>
                    <div className="text-xl font-bold text-navy">${loan.monthlyPayment.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Payments Remaining</div>
                    <div className="text-xl font-bold text-navy">{loan.paymentsRemaining} / {loan.termMonths}</div>
                  </div>
                </div>
                {/* Payment Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Payment Progress</span>
                    <span className="text-teal font-medium">{loan.paymentProgress}%</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal rounded-full transition-all"
                      style={{ width: `${loan.paymentProgress}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
