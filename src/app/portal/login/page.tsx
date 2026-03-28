// ABOUTME: Borrower portal login page
// ABOUTME: Email-first login with animations - checks if user has password or sends magic link

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { transitions, layoutClasses } from '@/lib/animations';

type Step = 'email' | 'password' | 'magic-link-sent';

export default function PortalLoginPage() {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const router = useRouter();
  const prefersReducedMotion = useReducedMotion();

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { ...transitions.entrance, delay: prefersReducedMotion ? 0 : delay },
    }),
  };

  const stepVariants = {
    enter: { opacity: 0, x: prefersReducedMotion ? 0 : 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: prefersReducedMotion ? 0 : -20 },
  };

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
        setError(data.error || 'We couldn\'t find an account with this email. Double-check the address or contact support.');
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
          setError(magicData.error || 'Couldn\'t send login link. Please try again in a few minutes.');
        }
      }
    } catch {
      setError('Unable to connect. Check your internet connection and try again.');
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
        setError(data.error || 'Incorrect password. Try again or use a login link instead.');
        return;
      }

      // Use hard navigation to ensure cookie is recognized
      window.location.href = '/portal';
    } catch {
      setError('Unable to connect. Check your internet connection and try again.');
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
        setError(data.error || 'Couldn\'t send login link. Please try again in a few minutes.');
      }
    } catch {
      setError('Unable to connect. Check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-gray via-light-gray to-cyan/5 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%230F2D4A\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
      
      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div 
          className="text-center mb-8"
          initial={prefersReducedMotion ? false : "hidden"}
          animate="visible"
          variants={fadeInUp}
          custom={0}
        >
          <Link href="/" className="inline-block">
            <img
              src="/logos/wordmark navy and mint.svg"
              alt="SuprFi"
              className="h-10 mx-auto"
            />
          </Link>
          <p className="text-medium-gray mt-3 text-sm">Borrower Portal</p>
        </motion.div>

        {/* Login Card */}
        <motion.div 
          className={`${layoutClasses.formCard} shadow-lg`}
          initial={prefersReducedMotion ? false : "hidden"}
          animate="visible"
          variants={fadeInUp}
          custom={0.1}
        >
          {step === 'email' && (
            <>
              <h1 className="text-2xl font-bold font-display text-navy mb-2 text-center">
                View Your Loan
              </h1>
              <p className="text-medium-gray text-center mb-6">
                Enter your email to access your account
              </p>

              {error && (
                <motion.div 
                  id="login-error"
                  role="alert"
                  aria-live="polite"
                  className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={transitions.fast}
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleEmailSubmit} className={layoutClasses.formGroup}>
                <div>
                  <label htmlFor="email" className={layoutClasses.formLabel}>
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? 'login-error' : undefined}
                    className={layoutClasses.formInput}
                    placeholder="you@example.com"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal text-white rounded-xl font-semibold px-6 py-3 hover:bg-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                  transition={transitions.fast}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span 
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      Checking...
                    </span>
                  ) : 'Continue'}
                </motion.button>
              </form>
            </>
          )}

          {step === 'password' && (
            <>
              <h1 className="text-2xl font-bold font-display text-navy mb-2 text-center">
                Welcome Back
              </h1>
              <p className="text-medium-gray text-center mb-6">
                Enter your password to continue
              </p>

              {error && (
                <motion.div 
                  className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={transitions.fast}
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handlePasswordSubmit} className={layoutClasses.formGroup}>
                <div>
                  <label className={layoutClasses.formLabel}>
                    Email
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-navy">{email}</span>
                    <button
                      type="button"
                      onClick={() => { setStep('email'); setPassword(''); setError(''); }}
                      className="text-teal text-sm hover:text-teal/80 transition-colors"
                    >
                      Change
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className={layoutClasses.formLabel}>
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className={layoutClasses.formInput}
                    placeholder="Enter your password"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal text-white rounded-xl font-semibold px-6 py-3 hover:bg-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
                  whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
                  whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
                  transition={transitions.fast}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <motion.span 
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      />
                      Signing in...
                    </span>
                  ) : 'Sign In'}
                </motion.button>

                {hasPassword && (
                  <button
                    type="button"
                    onClick={handleSendMagicLink}
                    disabled={loading}
                    className="w-full text-teal hover:bg-teal/10 rounded-xl font-medium px-4 py-2 transition-colors"
                  >
                    Send me a login link instead
                  </button>
                )}
              </form>
            </>
          )}

          {step === 'magic-link-sent' && (
            <motion.div 
              className="text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={transitions.normal}
            >
              <motion.div 
                className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-4"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ ...transitions.entrance, delay: 0.1 }}
              >
                <svg className="w-8 h-8 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </motion.div>
              <h1 className="text-2xl font-bold font-display text-navy mb-2">
                Check Your Email
              </h1>
              <p className="text-medium-gray mb-6">
                We sent a login link to<br />
                <span className="font-medium text-navy">{email}</span>
              </p>
              <p className="text-sm text-medium-gray mb-6">
                Click the link in the email to sign in. The link expires in 15 minutes.
              </p>
              <button
                onClick={() => { setStep('email'); setEmail(''); setError(''); }}
                className="text-teal hover:bg-teal/10 rounded-xl font-medium px-4 py-2 transition-colors"
              >
                Use a different email
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center mt-6"
          initial={prefersReducedMotion ? false : "hidden"}
          animate="visible"
          variants={fadeInUp}
          custom={0.2}
        >
          <p className="text-sm text-medium-gray">
            Need help?{' '}
            <a href="mailto:support@suprfi.com" className="text-teal hover:text-teal/80 transition-colors">
              Contact Support
            </a>
          </p>
          <Link href="/" className="text-sm text-medium-gray hover:text-teal mt-2 inline-block transition-colors">
            Return to SuprFi.com
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
