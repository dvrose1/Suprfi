'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const Hero: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState(5000);

  const calculatePayment = (amount: number, months: number) => {
    const rate = 0.1499 / 12;
    const payment = (amount * rate * Math.pow(1 + rate, months)) / (Math.pow(1 + rate, months) - 1);
    return Math.round(payment);
  };

  return (
    <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 relative overflow-hidden">
      {/* Background gradient */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{ 
          background: 'radial-gradient(ellipse at top right, #2A9D8F 0%, transparent 50%), radial-gradient(ellipse at bottom left, #6EC6A7 0%, transparent 50%)' 
        }}
      />
      
      <div className="max-w-6xl mx-auto relative">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal/10 text-xs sm:text-sm mb-4 sm:mb-6 text-teal">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-medium">Decisions in under 60 seconds</span>
            </div>
            
            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6 font-display text-navy">
              Home repairs can&apos;t wait.
              <br />
              <span className="text-teal">Neither should your financing.</span>
            </h1>
            
            {/* Subheadline */}
            <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
              Get approved for $2,500 – $25,000 in under a minute. No hidden fees. 
              No hard credit check to see your options.
            </p>
            
            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
              <Link 
                href="/apply"
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-white font-semibold text-base sm:text-lg transition-all hover:scale-105 flex items-center justify-center gap-2 shadow-lg bg-gradient-primary"
              >
                Check Your Rate
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link 
                href="/how-it-works"
                className="px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg border-2 border-navy text-navy transition-all hover:bg-gray-50 text-center"
              >
                See How It Works
              </Link>
            </div>
            
            {/* Trust note */}
            <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Checking your rate won&apos;t affect your credit score
            </p>
          </div>
          
          {/* Rate Calculator Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-8 border border-gray-100 mt-8 lg:mt-0">
            <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 text-navy font-display">See your estimated payment</h3>
            
            <div className="mb-4 sm:mb-6">
              <label className="text-xs sm:text-sm text-gray-600 mb-2 block">How much do you need?</label>
              <div className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4 text-navy font-mono">
                ${loanAmount.toLocaleString()}
              </div>
              <input 
                type="range" 
                min="2500" 
                max="25000" 
                step="500"
                value={loanAmount}
                onChange={(e) => setLoanAmount(Number(e.target.value))}
                className="w-full h-2 rounded-full appearance-none cursor-pointer"
                style={{ 
                  background: `linear-gradient(to right, #2A9D8F 0%, #2A9D8F ${((loanAmount - 2500) / 22500) * 100}%, #E5E7EB ${((loanAmount - 2500) / 22500) * 100}%, #E5E7EB 100%)` 
                }}
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>$2,500</span>
                <span>$25,000</span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
              {[24, 36, 48].map(term => (
                <div 
                  key={term} 
                  className="text-center p-2 sm:p-4 rounded-xl bg-gray-50 hover:bg-teal/10 transition-colors cursor-pointer"
                >
                  <div className="text-lg sm:text-2xl font-bold text-navy font-mono">
                    ${calculatePayment(loanAmount, term).toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-500">{term} mo</div>
                </div>
              ))}
            </div>
            
            <Link
              href="/apply"
              className="block w-full py-3 sm:py-4 rounded-xl text-white font-semibold text-sm sm:text-base text-center transition-all hover:opacity-90 bg-gradient-accent"
            >
              Get Your Personalized Rate
            </Link>
            
            <p className="text-xs text-gray-400 text-center mt-3 sm:mt-4">
              Rates from 14.99% APR. Your rate will depend on your credit profile.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
