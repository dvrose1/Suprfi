// ABOUTME: Early access CTA section with email signup form
// ABOUTME: Dark background with investor/contractor dropdown

'use client';

import React, { useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const EarlyAccessSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [type, setType] = useState('contractor');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const prefersReducedMotion = useReducedMotion();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/v1/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          type,
          source: 'investor_homepage',
        }),
      });
      
      if (response.ok) {
        setSubmitted(true);
      } else {
        const data = await response.json();
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="early-access" className="py-16 sm:py-24 bg-navy">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <motion.h2 
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white font-display mb-4 sm:mb-6"
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
        >
          We&apos;re building the future of home services lending.
        </motion.h2>
        
        {/* Subheadline */}
        <motion.p 
          className="text-base sm:text-lg md:text-xl text-white/80 leading-relaxed mb-8 sm:mb-10 max-w-2xl mx-auto"
          initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 0.1 }}
        >
          If you&apos;re a contractor, investor, or partner interested in early access to SuprFi, 
          we&apos;d love to connect.
        </motion.p>
        
        {submitted ? (
          <motion.div 
            className="bg-teal/20 rounded-2xl p-6 sm:p-8 border border-teal/30"
            initial={prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: [0.25, 1, 0.5, 1] }}
          >
            <motion.div
              initial={prefersReducedMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.2, duration: prefersReducedMotion ? 0 : 0.4, ease: [0.25, 1, 0.5, 1] }}
            >
              <svg className="w-12 sm:w-14 h-12 sm:h-14 text-teal mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <motion.path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: prefersReducedMotion ? 1 : 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: prefersReducedMotion ? 0 : 0.4, duration: prefersReducedMotion ? 0 : 0.4, ease: 'easeOut' }}
                />
              </svg>
            </motion.div>
            <motion.p 
              className="text-white text-base sm:text-lg font-medium"
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.5, duration: prefersReducedMotion ? 0 : 0.3 }}
            >
              Thanks for your interest!
            </motion.p>
            <motion.p 
              className="text-white/70 mt-2 text-sm sm:text-base"
              initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: prefersReducedMotion ? 0 : 0.6, duration: prefersReducedMotion ? 0 : 0.3 }}
            >
              We&apos;ll be in touch soon.
            </motion.p>
          </motion.div>
        ) : (
          <motion.form 
            onSubmit={handleSubmit} 
            className="max-w-md mx-auto space-y-3 sm:space-y-4"
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.5, delay: prefersReducedMotion ? 0 : 0.2 }}
          >
            <div>
              <label htmlFor="email-input" className="sr-only">Email address</label>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                autoComplete="email"
                className="w-full px-4 sm:px-5 py-3 sm:py-4 min-h-[48px] rounded-xl bg-white text-navy placeholder-gray-400 focus:ring-2 focus:ring-teal focus:outline-none text-base transition-shadow duration-200 hover:shadow-md focus:shadow-lg"
              />
            </div>
            
            <div>
              <label htmlFor="type-select" className="sr-only">I am a</label>
              <select
                id="type-select"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 sm:px-5 py-3 sm:py-4 min-h-[48px] rounded-xl bg-white text-navy focus:ring-2 focus:ring-teal focus:outline-none text-base transition-shadow duration-200 hover:shadow-md focus:shadow-lg cursor-pointer"
              >
              <option value="contractor">I&apos;m a contractor</option>
              <option value="investor">I&apos;m an investor or partner</option>
            </select>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="group w-full px-6 sm:px-8 py-3 sm:py-4 min-h-[48px] rounded-xl bg-teal text-white font-semibold text-base sm:text-lg transition-all duration-200 hover:bg-teal/90 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:shadow-lg disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Submitting...</span>
                </span>
              ) : 'Get Early Access'}
            </button>
            
            {error && (
              <p className="text-red-300 text-sm mt-2">{error}</p>
            )}
          </motion.form>
        )}
      </div>
    </section>
  );
};

export default EarlyAccessSection;
