// ABOUTME: SuprClient loan detail page
// ABOUTME: Shows full loan details with payment schedule

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useContractorAuth } from '@/lib/auth/contractor-context';

interface LoanDetail {
  id: string;
  customer: {
    name: string;
    maskedEmail: string;
  };
  fundedAmount: number;
  fundingDate: string;
  status: string;
  lenderName: string | null;
  technicianName: string | null;
  serviceType: string | null;
  crmCustomerId: string | null;
  crmJobId: string | null;
  offer: {
    termMonths: number;
    apr: number;
    monthlyPayment: number;
  } | null;
  paymentSchedule: Array<{
    month: number;
    dueDate: string;
    amount: number;
    status: 'paid' | 'upcoming' | 'overdue';
  }>;
  applicationId: string;
}

export default function LoanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useContractorAuth();
  const [loan, setLoan] = useState<LoanDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && params.id) {
      fetchLoan();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, params.id]);

  const fetchLoan = async () => {
    try {
      const res = await fetch(`/api/v1/client/loans/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setLoan(data.loan);
      } else if (res.status === 404) {
        setError('Loan not found');
      } else {
        setError('Failed to load loan');
      }
    } catch (err) {
      console.error('Failed to fetch loan:', err);
      setError('Failed to load loan');
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'repaying':
      case 'funded':
        return 'bg-mint text-white';
      case 'paid_off':
        return 'bg-teal text-white';
      case 'defaulted':
        return 'bg-error text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const getPaymentStatusStyle = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-mint/20 text-mint';
      case 'upcoming':
        return 'bg-gray-100 text-gray-600';
      case 'overdue':
        return 'bg-error/20 text-error';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-teal border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading loan...</p>
        </div>
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-navy mb-2">{error || 'Loan not found'}</h2>
          <Link href="/client/loans" className="text-teal hover:underline">
            ← Back to Loans
          </Link>
        </div>
      </div>
    );
  }

  const paidPayments = loan.paymentSchedule.filter(p => p.status === 'paid').length;
  const totalPayments = loan.paymentSchedule.length;
  const progressPercent = Math.round((paidPayments / totalPayments) * 100);

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="text-gray-600 hover:text-navy">
                ← Back
              </button>
              <span className="text-gray-300">|</span>
              <span className="font-medium text-navy">Loan Details</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(loan.status)}`}>
              {loan.status === 'repaying' ? 'Active' : loan.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loan Summary */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-navy">{loan.customer.name}</h1>
              <p className="text-gray-500">{loan.customer.maskedEmail}</p>
              {loan.technicianName && (
                <p className="text-sm text-teal mt-1">Sales Rep: {loan.technicianName}</p>
              )}
            </div>
            <Link
              href={`/client/applications/${loan.applicationId}`}
              className="text-teal hover:text-teal/80 text-sm font-medium"
            >
              View Application →
            </Link>
          </div>

          <div className="grid sm:grid-cols-4 gap-6 mb-6">
            <div>
              <div className="text-sm text-gray-500 mb-1">Funded Amount</div>
              <div className="text-3xl font-bold text-navy">${loan.fundedAmount.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Monthly Payment</div>
              <div className="text-3xl font-bold text-navy">
                ${loan.offer?.monthlyPayment.toLocaleString() || 0}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">Term</div>
              <div className="text-3xl font-bold text-navy">{loan.offer?.termMonths || 0} mo</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">APR</div>
              <div className="text-3xl font-bold text-navy">{loan.offer?.apr || 0}%</div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="border-t border-gray-100 pt-4">
            <div className="grid sm:grid-cols-4 gap-4 text-sm">
              {loan.serviceType && (
                <div>
                  <span className="text-gray-500">Service Type:</span>
                  <span className="ml-2 text-navy capitalize">{loan.serviceType}</span>
                </div>
              )}
              {loan.lenderName && (
                <div>
                  <span className="text-gray-500">Lender:</span>
                  <span className="ml-2 text-navy">{loan.lenderName}</span>
                </div>
              )}
              {loan.crmCustomerId && (
                <div>
                  <span className="text-gray-500">CRM Customer ID:</span>
                  <span className="ml-2 text-navy font-mono text-xs">{loan.crmCustomerId}</span>
                </div>
              )}
              {loan.crmJobId && (
                <div>
                  <span className="text-gray-500">CRM Job ID:</span>
                  <span className="ml-2 text-navy font-mono text-xs">{loan.crmJobId}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Payment Progress */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-navy mb-4">Payment Progress</h2>
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-500">{paidPayments} of {totalPayments} payments made</span>
              <span className="text-teal font-medium">{progressPercent}% complete</span>
            </div>
            <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal to-mint rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-mint/10 rounded-xl">
              <div className="text-2xl font-bold text-mint">{paidPayments}</div>
              <div className="text-sm text-gray-500">Paid</div>
            </div>
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-600">{totalPayments - paidPayments}</div>
              <div className="text-sm text-gray-500">Remaining</div>
            </div>
            <div className="p-4 bg-teal/10 rounded-xl">
              <div className="text-2xl font-bold text-teal">
                ${((totalPayments - paidPayments) * (loan.offer?.monthlyPayment || 0)).toLocaleString()}
              </div>
              <div className="text-sm text-gray-500">Balance</div>
            </div>
          </div>
        </div>

        {/* Payment Schedule */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-navy mb-4">Payment Schedule</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {loan.paymentSchedule.map((payment) => (
              <div
                key={payment.month}
                className="flex items-center justify-between p-3 rounded-xl bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-sm font-medium text-navy">
                    {payment.month}
                  </div>
                  <div>
                    <div className="font-medium text-navy">
                      ${payment.amount.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      Due {new Date(payment.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPaymentStatusStyle(payment.status)}`}>
                  {payment.status === 'paid' ? '✓ Paid' : payment.status === 'overdue' ? 'Overdue' : 'Upcoming'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
