// ABOUTME: Hero section for investor-focused pre-launch homepage
// ABOUTME: Dark gradient background with headline about lending infrastructure

'use client';

import React from 'react';

const InvestorHero: React.FC = () => {
  const scrollToLearnMore = () => {
    const element = document.getElementById('product-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center bg-gradient-primary overflow-hidden">
      {/* Subtle background pattern */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{ 
          backgroundImage: 'radial-gradient(circle at 25% 25%, #2A9D8F 0%, transparent 50%), radial-gradient(circle at 75% 75%, #6EC6A7 0%, transparent 50%)'
        }}
      />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="max-w-4xl">
          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 font-display" style={{ fontVariantLigatures: 'none' }}>
            AI-powered financing for essential home repairs.
          </h1>
          
          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-white/80 leading-relaxed mb-10 max-w-4xl">
            SuprFi delivers real-time financing to homeowners at the point of need, helping service 
            providers increase close rates, boost ticket sizes, and convert more jobs.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="#early-access"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-navy font-semibold text-lg transition-all hover:bg-white/90 hover:scale-[1.02] shadow-lg"
            >
              Get Early Access
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <button 
              onClick={scrollToLearnMore}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/30 text-white font-semibold text-lg transition-all hover:bg-white/10"
            >
              Learn More
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InvestorHero;
