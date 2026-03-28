// ABOUTME: Admin login page
// ABOUTME: Email/password authentication for SuprOps with animations

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { transitions, layoutClasses } from '@/lib/animations';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/v1/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      window.location.href = '/admin';
    } catch (err) {
      setError('Unable to connect. Check your internet connection and try again.');
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
    <div className="min-h-screen bg-gradient-to-br from-light-gray via-light-gray to-teal/5 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%230F2D4A\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
      
      <motion.div 
        className="sm:mx-auto sm:w-full sm:max-w-md relative z-10"
        initial={prefersReducedMotion ? false : "hidden"}
        animate="visible"
        variants={fadeInUp}
        custom={0}
      >
        <div className="text-center">
          <Link href="/" className="inline-block">
            <img
              src="/logos/wordmark navy and mint.svg"
              alt="SuprFi"
              className="h-10 mx-auto"
            />
          </Link>
          <p className="mt-3 text-sm text-medium-gray">SuprOps Admin Portal</p>
        </div>
      </motion.div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <motion.div 
          className={`${layoutClasses.formCard} shadow-lg`}
          initial={prefersReducedMotion ? false : "hidden"}
          animate="visible"
          variants={fadeInUp}
          custom={0.1}
        >
          <form onSubmit={handleSubmit} className={layoutClasses.formGroup}>
            <AnimatePresence mode="wait">
              {error && (
                <motion.div 
                  id="login-error"
                  role="alert"
                  aria-live="polite"
                  className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-sm"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={transitions.fast}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label htmlFor="email" className={layoutClasses.formLabel}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'login-error' : undefined}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={layoutClasses.formInput}
                placeholder="you@suprfi.com"
              />
            </div>

            <div>
              <label htmlFor="password" className={layoutClasses.formLabel}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                aria-invalid={error ? 'true' : 'false'}
                aria-describedby={error ? 'login-error' : undefined}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={layoutClasses.formInput}
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-teal focus:ring-teal border-gray-300 rounded transition-colors"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-medium-gray">
                  Remember me for 30 days
                </label>
              </div>

              <div className="text-sm">
                <Link
                  href="/admin/forgot-password"
                  className="font-medium text-teal hover:text-teal/80 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div>
              <motion.button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl text-sm font-semibold text-white bg-teal hover:bg-teal/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                ) : 'Sign in'}
              </motion.button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-medium-gray">
                  SuprOps Admin Access Only
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.p 
          className="mt-6 text-center text-sm text-medium-gray"
          initial={prefersReducedMotion ? false : "hidden"}
          animate="visible"
          variants={fadeInUp}
          custom={0.2}
        >
          <Link href="/" className="text-teal hover:text-teal/80 transition-colors">
            ← Back to SuprFi.com
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
