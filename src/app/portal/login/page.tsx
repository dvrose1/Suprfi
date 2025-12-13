// ABOUTME: Borrower portal login page
// ABOUTME: Login with email + loan ID

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PortalLoginPage() {
  const [email, setEmail] = useState('');
  const [loanId, setLoanId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/portal/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, loanId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      router.push('/portal');
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-supr-dark to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-white">
              Supr<span className="text-supr-green">Fi</span>
            </h1>
          </Link>
          <p className="mt-2 text-gray-400">Borrower Portal</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            View Your Loan
          </h2>
          <p className="text-gray-600 mb-6">
            Enter your email and Loan ID to access your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supr-green focus:border-transparent outline-none transition"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="loanId" className="block text-sm font-medium text-gray-700 mb-1">
                Loan ID
              </label>
              <input
                id="loanId"
                type="text"
                value={loanId}
                onChange={(e) => setLoanId(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-supr-green focus:border-transparent outline-none transition"
                placeholder="Enter your Loan ID"
              />
              <p className="mt-1 text-xs text-gray-500">
                Your Loan ID was provided in your financing confirmation email.
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-supr-green hover:bg-supr-green/90 text-supr-dark font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-600">
              Need help?{' '}
              <a href="mailto:support@suprfi.com" className="text-supr-dark font-medium hover:underline">
                Contact Support
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <Link href="/" className="hover:text-white transition">
            Return to SuprFi.com
          </Link>
        </div>
      </div>
    </div>
  );
}
