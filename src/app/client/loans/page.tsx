// ABOUTME: SuprClient loans list page
// ABOUTME: Shows funded loans with payment progress

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useContractorAuth } from '@/lib/auth/contractor-context';
import ClientHeader from '@/components/client/ClientHeader';
import { formatServiceType, formatCurrency } from '@/lib/utils/format';

interface Loan {
  id: string;
  customer: {
    name: string;
  };
  // Merchant-relevant fields
  totalSaleAmount: number;
  fundedAmount: number;
  merchantFee: number;
  netFundedAmount: number;
  fundingDate: string;
  status: string;
  serviceType: string | null;
  technicianName: string | null;
  crmCustomerId: string | null;
  crmJobId: string | null;
  // Legacy fields (kept for admin portal)
  monthlyPayment: number;
  termMonths: number;
  paymentsRemaining: number;
  paymentProgress: number;
}

type StatusFilter = 'all' | 'approved_not_scheduled' | 'approved_scheduled' | 'in_progress' | 'pending_funding' | 'funded' | 'refunded' | 'cancelled';
type SortField = 'date' | 'amount' | 'technician';
type SortDirection = 'asc' | 'desc';

interface LoanStats {
  loansAccepted30d: number;
  notScheduledCount: number;
  pendingCount: number;
  fundedLast30d: number;
}

export default function LoansPage() {
  const { user, loading: authLoading } = useContractorAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [stats, setStats] = useState<LoanStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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
      if (search) params.set('search', search);

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
        return 'bg-mint/20 text-mint border-mint/30';
      case 'approved_scheduled':
      case 'approved_not_scheduled':
        return 'bg-teal/20 text-teal border-teal/30';
      case 'in_progress':
      case 'pending_funding':
        return 'bg-cyan/20 text-cyan border-cyan/30';
      case 'cancelled':
        return 'bg-error/20 text-error border-error/30';
      case 'refunded':
        return 'bg-warning/20 text-warning border-warning/30';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'approved_not_scheduled':
        return 'Approved - Not Scheduled';
      case 'approved_scheduled':
        return 'Approved - Scheduled';
      case 'refunded':
        return 'Refunded';
      case 'in_progress':
        return 'In Progress';
      case 'pending_funding':
        return 'Pending Funding';
      case 'funded':
        return 'Funded';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
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
          <h1 className="text-3xl font-bold font-display text-navy">Loans</h1>
          <p className="text-gray-600 mt-1">Track your customers&apos; active loans</p>
        </div>

        {/* Stats - 4 tiles */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Loans Accepted</div>
              <div className="text-3xl font-bold text-navy">{stats.loansAccepted30d}</div>
              <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Not Scheduled</div>
              <div className="text-3xl font-bold text-warning">{stats.notScheduledCount}</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Pending</div>
              <div className="text-3xl font-bold text-cyan">{stats.pendingCount}</div>
              <div className="text-xs text-gray-500 mt-1">Jobs in progress</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="text-sm text-gray-600 mb-1">Funded</div>
              <div className="text-3xl font-bold text-mint">{stats.fundedLast30d}</div>
              <div className="text-xs text-gray-500 mt-1">Last 30 days</div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <form onSubmit={(e) => { e.preventDefault(); fetchLoans(); }} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal focus:border-transparent"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal focus:border-transparent bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="approved_not_scheduled">Approved - Not Scheduled</option>
              <option value="approved_scheduled">Approved - Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="pending_funding">Pending Funding</option>
              <option value="funded">Funded</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-') as [SortField, SortDirection];
                setSortField(field);
                setSortDirection(direction);
              }}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal focus:border-transparent bg-white"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
              <option value="technician-asc">Technician A-Z</option>
              <option value="technician-desc">Technician Z-A</option>
            </select>
            <button
              type="submit"
              className="px-6 py-3 bg-navy text-white rounded-xl font-medium hover:bg-navy/90 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Loans List - Simplified Merchant View */}
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
            {[...loans]
              .sort((a, b) => {
                let comparison = 0;
                switch (sortField) {
                  case 'date':
                    comparison = new Date(b.fundingDate).getTime() - new Date(a.fundingDate).getTime();
                    break;
                  case 'amount':
                    comparison = b.fundedAmount - a.fundedAmount;
                    break;
                  case 'technician':
                    comparison = (a.technicianName || '').localeCompare(b.technicianName || '');
                    break;
                }
                return sortDirection === 'asc' ? -comparison : comparison;
              })
              .map((loan) => (
              <Link
                key={loan.id}
                href={`/client/loans/${loan.id}`}
                className="block bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    <div className="min-w-0 flex-shrink-0">
                      <h3 className="font-semibold text-navy text-lg">{loan.customer.name}</h3>
                      <p className="text-sm text-gray-500">
                        {loan.fundingDate ? new Date(loan.fundingDate).toLocaleDateString() : 'Pending'}
                      </p>
                      {loan.technicianName && (
                        <p className="text-xs text-teal">Rep: {loan.technicianName}</p>
                      )}
                    </div>
                    {loan.serviceType && (
                      <div className="hidden md:block text-center min-w-[100px]">
                        <div className="text-sm text-gray-500">Service</div>
                        <div className="text-sm text-navy">{formatServiceType(loan.serviceType)}</div>
                      </div>
                    )}
                    {/* Merchant Fee Breakdown */}
                    <div className="hidden sm:flex items-center gap-4 ml-auto">
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Sale Amount</div>
                        <div className="text-lg font-bold text-navy">{formatCurrency(loan.totalSaleAmount)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Fees</div>
                        <div className="text-lg font-semibold text-warning">${loan.merchantFee.toLocaleString()}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-500">Funded</div>
                        <div className="text-lg font-bold text-mint">{formatCurrency(loan.netFundedAmount)}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <span className="text-gray-400 hidden sm:inline">→</span>
                  </div>
                </div>
                {/* Mobile: Show fee breakdown below */}
                <div className="flex items-center justify-between mt-4 sm:hidden border-t border-gray-100 pt-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Sale</div>
                    <div className="font-bold text-navy">{formatCurrency(loan.totalSaleAmount)}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Fees</div>
                    <div className="font-semibold text-warning">${loan.merchantFee.toLocaleString()}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500">Funded</div>
                    <div className="font-bold text-mint">{formatCurrency(loan.netFundedAmount)}</div>
                  </div>
                </div>
                {/* CRM IDs if available */}
                {(loan.crmCustomerId || loan.crmJobId) && (
                  <div className="flex gap-4 mt-3 text-xs text-gray-400">
                    {loan.crmCustomerId && <span>Customer ID: {loan.crmCustomerId}</span>}
                    {loan.crmJobId && <span>Job ID: {loan.crmJobId}</span>}
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
