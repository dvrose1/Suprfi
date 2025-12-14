// ABOUTME: Borrower portal login page
// ABOUTME: Email-first login - checks if user has password or sends magic link

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Step = 'email' | 'password' | 'magic-link-sent';

export default function PortalLoginPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/portal/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'No account found with this email');
        return;
      }

      if (data.hasPassword) {
        setHasPassword(true);
        setStep('password');
      } else {
        // Send magic link
        const magicRes = await fetch('/api/v1/portal/auth/send-magic-link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.toLowerCase().trim() }),
        });

        if (magicRes.ok) {
          setStep('magic-link-sent');
        } else {
          const magicData = await magicRes.json();
          setError(magicData.error || 'Failed to send login link');
        }
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/portal/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim(), password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Invalid password');
        return;
      }

      router.push('/portal');
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMagicLink = async () => {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/portal/auth/send-magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase().trim() }),
      });

      if (res.ok) {
        setStep('magic-link-sent');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send login link');
      }
    } catch {
      setError('An error occurred. Please try again.');
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

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 'email' && (
            <>
              <h1 className="text-2xl font-bold font-display text-navy mb-2 text-center">
                View Your Loan
              </h1>
              <p className="text-gray-600 text-center mb-6">
                Enter your email to access your account
              </p>

              {error && (
                <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleEmailSubmit} className="space-y-5">
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
                    autoComplete="email"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all"
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal text-white rounded-lg font-semibold px-6 py-3 hover:bg-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Checking...' : 'Continue'}
                </button>
              </form>
            </>
          )}

          {step === 'password' && (
            <>
              <h1 className="text-2xl font-bold font-display text-navy mb-2 text-center">
                Welcome Back
              </h1>
              <p className="text-gray-600 text-center mb-6">
                Enter your password to continue
              </p>

              {error && (
                <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-900">{email}</span>
                    <button
                      type="button"
                      onClick={() => { setStep('email'); setPassword(''); setError(''); }}
                      className="text-teal text-sm hover:underline"
                    >
                      Change
                    </button>
                  </div>
                </div>

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
                    autoComplete="current-password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent transition-all"
                    placeholder="Enter your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal text-white rounded-lg font-semibold px-6 py-3 hover:bg-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>

                {hasPassword && (
                  <button
                    type="button"
                    onClick={handleSendMagicLink}
                    disabled={loading}
                    className="w-full text-teal hover:bg-teal/10 rounded-lg font-medium px-4 py-2 transition-colors"
                  >
                    Send me a login link instead
                  </button>
                )}
              </form>
            </>
          )}

          {step === 'magic-link-sent' && (
            <div className="text-center">
              <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold font-display text-navy mb-2">
                Check Your Email
              </h1>
              <p className="text-gray-600 mb-6">
                We sent a login link to<br />
                <span className="font-medium text-navy">{email}</span>
              </p>
              <p className="text-sm text-gray-500 mb-6">
                Click the link in the email to sign in. The link expires in 15 minutes.
              </p>
              <button
                onClick={() => { setStep('email'); setEmail(''); setError(''); }}
                className="text-teal hover:bg-teal/10 rounded-lg font-medium px-4 py-2 transition-colors"
              >
                Use a different email
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            Need help?{' '}
            <a href="mailto:support@suprfi.com" className="text-teal hover:underline">
              Contact Support
            </a>
          </p>
          <Link href="/" className="text-sm text-gray-500 hover:text-teal mt-2 inline-block">
            Return to SuprFi.com
          </Link>
        </div>
      </div>
    </div>
  );
}
