// ABOUTME: Early access CTA section with email signup form
// ABOUTME: Dark background with investor/contractor dropdown

'use client';

import React, { useState } from 'react';

const EarlyAccessSection: React.FC = () => {
  const [email, setEmail] = useState('');
  const [type, setType] = useState('contractor');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
    <section id="early-access" className="py-24 bg-navy">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-display mb-6">
          We&apos;re building the future of home services lending.
        </h2>
        
        {/* Subheadline */}
        <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-10 max-w-2xl mx-auto">
          If you&apos;re a contractor, investor, or partner interested in early access to SuprFi, 
          we&apos;d love to connect.
        </p>
        
        {submitted ? (
          <div className="bg-teal/20 rounded-2xl p-8 border border-teal/30">
            <svg className="w-12 h-12 text-teal mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-white text-lg font-medium">Thanks for your interest!</p>
            <p className="text-white/70 mt-2">We&apos;ll be in touch soon.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              required
              className="w-full px-5 py-4 rounded-xl bg-white text-navy placeholder-gray-400 focus:ring-2 focus:ring-teal focus:outline-none"
            />
            
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-5 py-4 rounded-xl bg-white text-navy focus:ring-2 focus:ring-teal focus:outline-none"
            >
              <option value="contractor">I&apos;m a contractor</option>
              <option value="investor">I&apos;m an investor or partner</option>
            </select>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full px-8 py-4 min-h-[48px] rounded-xl bg-teal text-white font-semibold text-lg transition-all hover:bg-teal/90 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Get Early Access'}
            </button>
            
            {error && (
              <p className="text-red-300 text-sm mt-2">{error}</p>
            )}
          </form>
        )}
      </div>
    </section>
  );
};

export default EarlyAccessSection;
