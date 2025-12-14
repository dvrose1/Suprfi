// ABOUTME: Magic link verification page
// ABOUTME: Verifies token, creates session, optionally prompts for password creation

'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function MagicLinkContent() {
  const [status, setStatus] = useState<'verifying' | 'set-password' | 'success' | 'error'>('verifying');
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyToken();
    } else {
      setStatus('error');
      setError('Invalid login link');
    }
  }, [token]);

  const verifyToken = async () => {
    try {
      const res = await fetch('/api/v1/portal/auth/verify-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus('error');
        setError(data.error || 'Invalid or expired link');
        return;
      }

      if (data.needsPassword) {
        setStatus('set-password');
      } else {
        setStatus('success');
        setTimeout(() => router.push('/portal'), 1500);
      }
    } catch {
      setStatus('error');
      setError('Failed to verify login link');
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/v1/portal/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to set password');
        return;
      }

      setStatus('success');
      setTimeout(() => router.push('/portal'), 1500);
    } catch {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-white to-light-gray flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <span className="text-3xl font-bold font-display">
              <span className="text-navy">Supr</span>
              <span className="text-teal">Fi</span>
            </span>
          </Link>
          <p className="text-gray-600 mt-2">Borrower Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {status === 'verifying' && (
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <h1 className="text-xl font-bold font-display text-navy mb-2">
                Verifying your link...
              </h1>
              <p className="text-gray-600">Please wait a moment.</p>
            </div>
          )}

          {status === 'set-password' && (
            <>
              <h1 className="text-2xl font-bold font-display text-navy mb-2 text-center">
                Create a Password
              </h1>
              <p className="text-gray-600 text-center mb-6">
                Set a password so you can sign in faster next time.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSetPassword} className="space-y-5">
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all"
                    placeholder="At least 8 characters"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all"
                    placeholder="Confirm your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal text-white rounded-lg font-semibold px-6 py-3 hover:bg-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Setting password...' : 'Set Password & Continue'}
                </button>

                <button
                  type="button"
                  onClick={() => router.push('/portal')}
                  className="w-full text-teal hover:bg-teal/10 rounded-lg font-medium px-4 py-2 transition-colors"
                >
                  Skip for now
                </button>
              </form>
            </>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-success" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h1 className="text-xl font-bold font-display text-navy mb-2">
                You&apos;re signed in!
              </h1>
              <p className="text-gray-600">Redirecting to your dashboard...</p>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-xl font-bold font-display text-navy mb-2">
                Link Invalid
              </h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <Link
                href="/portal/login"
                className="inline-block bg-teal text-white rounded-lg font-semibold px-6 py-3 hover:bg-teal/90 transition-colors"
              >
                Try Again
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MagicLinkPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-warm-white to-light-gray flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <MagicLinkContent />
    </Suspense>
  );
}
