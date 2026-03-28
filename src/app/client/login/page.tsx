// ABOUTME: SuprClient login page
// ABOUTME: Contractor user login with email/password with animations

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { transitions, layoutClasses } from '@/lib/animations';

export default function ClientLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/client/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        return;
      }

      // Use hard navigation to ensure cookie is recognized
      window.location.href = '/client';
    } catch {
      setError('Unable to connect. Check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: { ...transitions.entrance, delay: prefersReducedMotion ? 0 : delay },
    }),
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-gray via-light-gray to-mint/5 flex items-center justify-center p-4 relative overflow-hidden">
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
          <p className="text-medium-gray mt-3 text-sm">Merchant Portal</p>
        </motion.div>

        {/* Login Card */}
        <motion.div 
          className={`${layoutClasses.formCard} shadow-lg`}
          initial={prefersReducedMotion ? false : "hidden"}
          animate="visible"
          variants={fadeInUp}
          custom={0.1}
        >
          <h1 className="text-2xl font-bold font-display text-navy mb-6 text-center">
            Welcome Back
          </h1>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                id="login-error"
                role="alert"
                aria-live="polite"
                className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={transitions.fast}
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className={layoutClasses.formGroup}>
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
                placeholder="you@company.com"
              />
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
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'login-error' : undefined}
                className={layoutClasses.formInput}
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-teal focus:ring-teal transition-colors"
                />
                <span className="text-sm text-medium-gray">Remember me</span>
              </label>
              <Link
                href="/client/forgot-password"
                className="text-sm text-teal hover:text-teal/80 font-medium transition-colors"
              >
                Forgot password?
              </Link>
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
          </form>
        </motion.div>

        {/* Sign Up Link */}
        <motion.div 
          className="text-center mt-6"
          initial={prefersReducedMotion ? false : "hidden"}
          animate="visible"
          variants={fadeInUp}
          custom={0.2}
        >
          <p className="text-sm text-medium-gray">
            Don&apos;t have an account?{' '}
            <Link href="/client/signup" className="text-teal hover:text-teal/80 font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </motion.div>

        {/* Footer */}
        <motion.div 
          className="text-center mt-4"
          initial={prefersReducedMotion ? false : "hidden"}
          animate="visible"
          variants={fadeInUp}
          custom={0.25}
        >
          <p className="text-sm text-medium-gray">
            Need help?{' '}
            <a href="mailto:support@suprfi.com" className="text-teal hover:text-teal/80 transition-colors">
              Contact Support
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
