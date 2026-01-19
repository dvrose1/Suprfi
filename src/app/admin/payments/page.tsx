// ABOUTME: Admin payments management dashboard
// ABOUTME: Shows payment stats, filters, and list of all payments with actions

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { useRouter, useSearchParams } from 'next/navigation';
import { formatCurrency } from '@/lib/utils/format';

interface PaymentStats {
  dueToday: number;
  processing: number;
  completedToday: number;
  failed: number;
  overdue: number;
  collectedThisMonth: number;
}

interface Payment {
  id: string;
  paymentNumber: number;
  amount: string;
  dueDate: string;
  status: string;
  retryCount: number;
  failureReason: string | null;
  requiresAction: boolean;
  loan: {
    id: string;
    status: string;
    application: {
      customer: {
        firstName: string;
        lastName: string;
        email: string;
      };
    };
  };
}

const STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-gray-100 text-gray-800',
  pending: 'bg-blue-100 text-blue-800',
  processing: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  overdue: 'bg-orange-100 text-orange-800',
  cancelled: 'bg-gray-100 text-gray-500',
};

export default function AdminPaymentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setDataLoading(true);
      try {
        // Fetch stats and payments in parallel
        const [statsRes, paymentsRes] = await Promise.all([
          fetch('/api/v1/admin/payments/stats'),
          fetch(`/api/v1/admin/payments?status=${statusFilter}&page=${page}`),
        ]);

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        }

        if (paymentsRes.ok) {
          const paymentsData = await paymentsRes.json();
          setPayments(paymentsData.payments || []);
          setTotalPages(paymentsData.totalPages || 1);
        }
      } catch (err) {
        console.error('Failed to fetch payments data:', err);
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, [user, statusFilter, page]);

  const handleRetryPayment = async (paymentId: string) => {
    if (!confirm('Are you sure you want to retry this payment?')) return;
    
    setActionLoading(paymentId);
    try {
      const res = await fetch(`/api/v1/admin/payments/${paymentId}/retry`, {
        method: 'POST',
      });
      
      if (res.ok) {
        // Refresh the list
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to retry payment');
      }
    } catch (err) {
      alert('Failed to retry payment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkPaid = async (paymentId: string) => {
    const note = prompt('Enter a note (e.g., "Paid by check #1234"):');
    if (!note) return;
    
    setActionLoading(paymentId);
    try {
      const res = await fetch(`/api/v1/admin/payments/${paymentId}/mark-paid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note }),
      });
      
      if (res.ok) {
        window.location.reload();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to mark as paid');
      }
    } catch (err) {
      alert('Failed to mark as paid');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Payment Management</h1>
              <p className="text-gray-600 mt-1">Monitor and manage loan payments</p>
            </div>
            <Link
              href="/admin"
              className="text-teal-600 hover:text-teal-800 text-sm"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard
            label="Due Today"
            value={stats?.dueToday ?? 0}
            color="blue"
            onClick={() => setStatusFilter('scheduled')}
          />
          <StatCard
            label="Processing"
            value={stats?.processing ?? 0}
            color="yellow"
            onClick={() => setStatusFilter('processing')}
          />
          <StatCard
            label="Completed Today"
            value={stats?.completedToday ?? 0}
            color="green"
            onClick={() => setStatusFilter('completed')}
          />
          <StatCard
            label="Failed"
            value={stats?.failed ?? 0}
            color="red"
            highlight={stats?.failed ? stats.failed > 0 : false}
            onClick={() => setStatusFilter('failed')}
          />
          <StatCard
            label="Overdue"
            value={stats?.overdue ?? 0}
            color="orange"
            highlight={stats?.overdue ? stats.overdue > 0 : false}
            onClick={() => setStatusFilter('overdue')}
          />
          <StatCard
            label="Collected (Month)"
            value={formatCurrency(stats?.collectedThisMonth ?? 0)}
            color="teal"
            isAmount
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Filter by Status:</label>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 text-sm"
            >
              <option value="all">All Payments</option>
              <option value="scheduled">Scheduled</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="overdue">Overdue</option>
              <option value="requires_action">Needs Action</option>
            </select>
          </div>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {dataLoading ? (
            <div className="p-8 text-center text-gray-500">Loading payments...</div>
          ) : payments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No payments found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Borrower
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Payment #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Due Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Retries
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className={payment.requiresAction ? 'bg-red-50' : ''}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {payment.loan.application.customer.firstName}{' '}
                          {payment.loan.application.customer.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {payment.loan.application.customer.email}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{payment.paymentNumber}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(Number(payment.amount))}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(payment.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            STATUS_COLORS[payment.status] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {payment.status}
                        </span>
                        {payment.requiresAction && (
                          <span className="ml-2 text-xs text-red-600 font-medium">
                            ⚠️ Action Required
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600">
                        {payment.retryCount > 0 ? (
                          <span className="text-orange-600">{payment.retryCount}/3</span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          {(payment.status === 'failed' || payment.status === 'overdue') && (
                            <button
                              onClick={() => handleRetryPayment(payment.id)}
                              disabled={actionLoading === payment.id}
                              className="text-teal-600 hover:text-teal-800 disabled:opacity-50"
                            >
                              Retry
                            </button>
                          )}
                          {payment.status !== 'completed' && payment.status !== 'cancelled' && (
                            <button
                              onClick={() => handleMarkPaid(payment.id)}
                              disabled={actionLoading === payment.id}
                              className="text-green-600 hover:text-green-800 disabled:opacity-50"
                            >
                              Mark Paid
                            </button>
                          )}
                          <Link
                            href={`/admin/payments/${payment.id}`}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            View
                          </Link>
                        </div>
                        {payment.failureReason && (
                          <div className="text-xs text-red-500 mt-1 max-w-[200px] truncate">
                            {payment.failureReason}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-t border-gray-200">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  highlight = false,
  isAmount = false,
  onClick,
}: {
  label: string;
  value: number | string;
  color: string;
  highlight?: boolean;
  isAmount?: boolean;
  onClick?: () => void;
}) {
  const colorClasses: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-200',
    yellow: 'bg-yellow-50 border-yellow-200',
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    orange: 'bg-orange-50 border-orange-200',
    teal: 'bg-teal-50 border-teal-200',
  };

  const valueClasses: Record<string, string> = {
    blue: 'text-blue-700',
    yellow: 'text-yellow-700',
    green: 'text-green-700',
    red: 'text-red-700',
    orange: 'text-orange-700',
    teal: 'text-teal-700',
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-lg border p-4 ${colorClasses[color]} ${
        onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''
      } ${highlight ? 'ring-2 ring-red-400' : ''}`}
    >
      <p className="text-xs font-medium text-gray-600 uppercase">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${valueClasses[color]}`}>
        {isAmount ? value : value}
      </p>
    </div>
  );
}
