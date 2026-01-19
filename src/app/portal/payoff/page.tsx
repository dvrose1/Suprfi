// ABOUTME: Borrower portal payoff page
// ABOUTME: Shows payoff quote and allows borrower to pay off loan early

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useBorrowerAuth } from '@/lib/auth/borrower-context';

interface PayoffQuote {
  loanId: string;
  remainingPrincipal: number;
  accruedInterest: number;
  fees: number;
  totalPayoff: number;
  validUntil: string;
  breakdown: {
    originalPrincipal: number;
    principalPaid: number;
    interestPaid: number;
    paymentsCompleted: number;
    paymentsRemaining: number;
  };
}

export default function PayoffPage() {
  const { user, loading: authLoading, logout } = useBorrowerAuth();
  const searchParams = useSearchParams();
  const loanId = searchParams.get('loanId');

  const [quote, setQuote] = useState<PayoffQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && user && loanId) {
      fetchQuote();
    }
  }, [authLoading, user, loanId]);

  const fetchQuote = async () => {
    try {
      const res = await fetch(`/api/v1/portal/loan/payoff-quote?loanId=${loanId}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Failed to get payoff quote');
        return;
      }

      setQuote(json);
    } catch (err) {
      setError('Failed to load payoff quote');
    } finally {
      setLoading(false);
    }
  };

  const handlePayoff = async () => {
    if (!quote) return;

    if (!confirm(`Are you sure you want to pay off your loan for ${formatCurrency(quote.totalPayoff)}? This amount will be debited from your linked bank account.`)) {
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const res = await fetch('/api/v1/portal/loan/payoff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loanId }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || 'Failed to process payoff');
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError('Failed to process payoff. Please try again.');
    } finally {
      setProcessing(false);
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
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading payoff quote...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  if (!loanId) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-lg text-center max-w-md">
          <h1 className="text-xl font-bold text-navy mb-2">No Loan Selected</h1>
          <p className="text-gray-600 mb-4">Please select a loan from your dashboard to view payoff options.</p>
          <Link href="/portal" className="text-teal hover:underline">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-warm-white">
        <header className="bg-navy text-white">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <h1 className="text-lg font-bold font-display">Payoff Initiated</h1>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-success" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold font-display text-navy mb-2">Payoff Payment Initiated!</h2>
            <p className="text-gray-600 mb-6">
              Your payoff payment has been submitted. It may take 1-2 business days to process. 
              Once complete, your loan will be marked as paid off.
            </p>
            <Link
              href="/portal"
              className="inline-block py-3 px-6 bg-teal text-white font-semibold rounded-lg hover:bg-teal-600 transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </main>
      </div>
    );
  }

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
              <h1 className="text-lg font-bold font-display">Pay Off Loan</h1>
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
        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error">
            {error}
          </div>
        )}

        {quote && (
          <>
            {/* Payoff Amount Card */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <h2 className="text-sm font-medium text-gray-500 mb-1">Total Payoff Amount</h2>
              <p className="text-4xl font-bold font-display text-navy mb-4">
                {formatCurrency(quote.totalPayoff)}
              </p>
              <p className="text-sm text-gray-500">
                Quote valid until {formatDate(quote.validUntil)}
              </p>
            </div>

            {/* Breakdown */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <h3 className="font-semibold text-navy mb-4">Payoff Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Remaining Principal</span>
                  <span className="font-medium text-navy">{formatCurrency(quote.remainingPrincipal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Accrued Interest</span>
                  <span className="font-medium text-navy">{formatCurrency(quote.accruedInterest)}</span>
                </div>
                {quote.fees > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Fees</span>
                    <span className="font-medium text-navy">{formatCurrency(quote.fees)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3 flex justify-between">
                  <span className="font-semibold text-navy">Total</span>
                  <span className="font-bold text-navy">{formatCurrency(quote.totalPayoff)}</span>
                </div>
              </div>
            </div>

            {/* Loan Progress */}
            <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
              <h3 className="font-semibold text-navy mb-4">Your Progress</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Original Loan</p>
                  <p className="font-semibold text-navy">{formatCurrency(quote.breakdown.originalPrincipal)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Principal Paid</p>
                  <p className="font-semibold text-success">{formatCurrency(quote.breakdown.principalPaid)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payments Made</p>
                  <p className="font-semibold text-navy">{quote.breakdown.paymentsCompleted}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Payments Remaining</p>
                  <p className="font-semibold text-navy">{quote.breakdown.paymentsRemaining}</p>
                </div>
              </div>
            </div>

            {/* Pay Off Button */}
            <button
              onClick={handlePayoff}
              disabled={processing}
              className="w-full py-4 bg-teal text-white font-semibold rounded-xl hover:bg-teal-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Processing...' : `Pay Off Loan - ${formatCurrency(quote.totalPayoff)}`}
            </button>

            {/* Info Note */}
            <div className="mt-6 p-4 bg-teal/10 border border-teal/20 rounded-xl">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-teal flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-navy">About Early Payoff</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Paying off your loan early can save you money on interest. The payoff amount 
                    includes your remaining principal plus any interest accrued to date. There are 
                    no prepayment penalties.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
