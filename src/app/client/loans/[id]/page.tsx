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
  // Merchant-relevant fields
  totalSaleAmount: number;
  fundedAmount: number;
  merchantFee: number;
  netFundedAmount: number;
  fundingDate: string;
  status: string;
  lenderName: string | null;
  technicianName: string | null;
  serviceType: string | null;
  crmCustomerId: string | null;
  crmJobId: string | null;
  // Legacy fields for admin portal
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
        {/* Loan Summary - Merchant View */}
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

          {/* Merchant Fee Breakdown - Primary Info */}
          <div className="grid sm:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-1">Total Sale Amount</div>
              <div className="text-3xl font-bold text-navy">${loan.totalSaleAmount.toLocaleString()}</div>
            </div>
            <div className="bg-warning/10 rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-1">Merchant Fee (3%)</div>
              <div className="text-3xl font-bold text-warning">${loan.merchantFee.toLocaleString()}</div>
            </div>
            <div className="bg-mint/10 rounded-xl p-4">
              <div className="text-sm text-gray-500 mb-1">Net Funded Amount</div>
              <div className="text-3xl font-bold text-mint">${loan.netFundedAmount.toLocaleString()}</div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="border-t border-gray-100 pt-4">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Status:</span>
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(loan.status)}`}>
                  {loan.status === 'repaying' ? 'Active' : loan.status.replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Funding Date:</span>
                <span className="ml-2 text-navy">
                  {loan.fundingDate ? new Date(loan.fundingDate).toLocaleDateString() : 'Pending'}
                </span>
              </div>
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
            </div>
            {/* CRM IDs */}
            {(loan.crmCustomerId || loan.crmJobId) && (
              <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100 text-sm">
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
            )}
          </div>
        </div>

        {/* CRM Information */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-navy mb-4">CRM Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-500">CRM</div>
              <div className="font-medium text-navy">{loan.crmCustomerId ? 'ServiceTitan' : '—'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Job ID</div>
              <div className="font-medium text-navy font-mono text-sm">{loan.crmJobId || '—'}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Scheduled Service Date</div>
              <div className="font-medium text-navy">—</div>
            </div>
            <div>
              <div className="text-sm text-gray-500">Service Completed Date</div>
              <div className="font-medium text-navy">—</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
