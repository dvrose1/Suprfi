// ABOUTME: Homeowners landing page explaining benefits and process
// ABOUTME: Focuses on affordability, speed, and ease of getting financing

import React from 'react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'For Homeowners | SuprFi',
  description: 'Get the home repairs you need now, pay over time. Fast approval, flexible terms, no surprises. From $2,500 to $25,000.',
};

export default function HomeownersPage() {
  const benefits = [
    {
      title: 'Fast Approval',
      description: 'Get a decision in 5 minutes. No waiting days for loan approval - we use modern technology to give you instant answers.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: 'Flexible Terms',
      description: 'Choose from 12 to 60 months. Pick monthly payments that fit your budget and lifestyle.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'No Hidden Fees',
      description: 'What you see is what you get. Clear APR, no origination fees, no prepayment penalties.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Easy Application',
      description: 'All online, all mobile-friendly. Complete your application in 10 minutes from your phone.',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  const useCases = [
    {
      title: 'HVAC Repairs',
      description: 'Don\'t sweat it out. Get your heating or cooling system fixed now.',
      amount: '$3,500 - $15,000',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Plumbing Emergencies',
      description: 'Burst pipe? Water heater failed? Get it fixed today.',
      amount: '$2,500 - $8,000',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      title: 'Electrical Work',
      description: 'Panel upgrades, rewiring, or emergency repairs.',
      amount: '$3,000 - $12,000',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: 'Roofing',
      description: 'Storm damage or full replacement. Protect your biggest investment.',
      amount: '$5,000 - $25,000',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 bg-navy text-white">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-4 sm:mb-6">
                Fix It Now. Pay Over Time.
              </h1>
              <p className="text-base sm:text-xl md:text-2xl text-white/70 mb-6 sm:mb-10">
                Don't put off critical home repairs. Get the financing you need 
                with fast approval and terms that fit your budget.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link 
                  href="/waitlist"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-teal text-white font-semibold text-lg transition-all hover:bg-teal/90 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal/50"
                >
                  Join Waitlist
                </Link>
                <Link 
                  href="/how-it-works"
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl border-2 border-white/30 text-white font-semibold text-lg transition-all hover:bg-white/10 hover:border-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
                >
                  How It Works
                </Link>
              </div>

              {/* Trust indicators */}
              <div className="mt-8 sm:mt-12 flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-white/60">
                <div className="flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-warning mr-1.5 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>4.8/5 from 2,000+ homeowners</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Licensed lender</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Bank-level security</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-display text-navy mb-3 sm:mb-4">
                Why Homeowners Choose SuprFi
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-medium-gray">
                Built specifically for home repair financing
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-teal/10 text-teal flex items-center justify-center mx-auto mb-2 sm:mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-base sm:text-lg md:text-xl font-bold font-display text-navy mb-2 sm:mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-medium-gray text-xs sm:text-sm">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-light-gray">
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold font-display text-navy mb-3 sm:mb-4">
                What You Can Finance
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-medium-gray">
                From emergency repairs to major upgrades
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-5xl mx-auto">
              {useCases.map((useCase, index) => (
                <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 transition-all hover:shadow-lg hover:-translate-y-1">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-12 h-12 rounded-xl bg-teal/10 text-teal flex items-center justify-center flex-shrink-0">
                      {useCase.icon}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg sm:text-xl font-bold font-display text-navy mb-1 sm:mb-2">
                        {useCase.title}
                      </h3>
                      <p className="text-medium-gray mb-2 sm:mb-3 text-xs sm:text-sm">
                        {useCase.description}
                      </p>
                      <div className="text-xs sm:text-sm font-semibold text-teal">
                        Typical Range: {useCase.amount}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 sm:mt-12 text-center">
              <p className="text-sm sm:text-base text-medium-gray mb-4 sm:mb-6">
                And many other home repairs from $2,500 to $25,000
              </p>
            </div>
          </div>
        </section>

        {/* Rates */}
        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8 sm:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-navy mb-3 sm:mb-4">
                  Simple, Transparent Pricing
                </h2>
                <p className="text-base sm:text-lg md:text-xl text-medium-gray">
                  No hidden fees or surprises
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                  <div className="text-xs sm:text-sm text-medium-gray uppercase font-semibold tracking-wide mb-1 sm:mb-2">Loan Amount</div>
                  <div className="text-2xl sm:text-3xl font-bold font-display text-navy mb-1 sm:mb-2">$2.5K - $25K</div>
                  <div className="text-xs sm:text-sm text-medium-gray">Based on creditworthiness</div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                  <div className="text-xs sm:text-sm text-medium-gray uppercase font-semibold tracking-wide mb-1 sm:mb-2">Starting APR</div>
                  <div className="text-2xl sm:text-3xl font-bold font-display text-navy mb-1 sm:mb-2">14.99%</div>
                  <div className="text-xs sm:text-sm text-medium-gray">Rates from 14.99% - 29.99%</div>
                </div>
                
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
                  <div className="text-xs sm:text-sm text-medium-gray uppercase font-semibold tracking-wide mb-1 sm:mb-2">Loan Terms</div>
                  <div className="text-2xl sm:text-3xl font-bold font-display text-navy mb-1 sm:mb-2">12-60 mo</div>
                  <div className="text-xs sm:text-sm text-medium-gray">Choose what works for you</div>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 text-center">
                <p className="text-xs sm:text-sm text-medium-gray">
                  Example: A $10,000 loan at 19.99% APR for 36 months = $370/month
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-teal/5">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-navy mb-6 sm:mb-8">
                Ready in 3 Simple Steps
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
                <div>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold font-display mx-auto mb-3 sm:mb-4">1</div>
                  <h3 className="font-bold font-display text-navy mb-1 sm:mb-2 text-sm sm:text-base">Get a Link</h3>
                  <p className="text-xs sm:text-sm text-medium-gray">Your contractor sends you a secure application link</p>
                </div>
                <div>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold font-display mx-auto mb-3 sm:mb-4">2</div>
                  <h3 className="font-bold font-display text-navy mb-1 sm:mb-2 text-sm sm:text-base">Apply Online</h3>
                  <p className="text-xs sm:text-sm text-medium-gray">Complete a short application in 10 minutes</p>
                </div>
                <div>
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-teal text-white rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold font-display mx-auto mb-3 sm:mb-4">3</div>
                  <h3 className="font-bold font-display text-navy mb-1 sm:mb-2 text-sm sm:text-base">Get Approved</h3>
                  <p className="text-xs sm:text-sm text-medium-gray">Receive your decision instantly and start repairs</p>
                </div>
              </div>
              <Link 
                href="/how-it-works"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-navy text-white font-semibold text-lg transition-all hover:bg-navy/90 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-navy/50"
              >
                Learn More About the Process
              </Link>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-navy">
          <div className="max-w-6xl mx-auto">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold font-display text-white mb-4 sm:mb-6">
                Don't Wait for Your Next Emergency
              </h2>
              <p className="text-base sm:text-lg md:text-xl text-white/70 mb-6 sm:mb-10">
                Join our waitlist to be first in line when we launch direct applications. 
                Or ask your contractor if they offer SuprFi today.
              </p>
              <Link 
                href="/waitlist"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-teal text-white font-semibold text-lg transition-all hover:bg-teal/90 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal/50"
              >
                Join Waitlist Now
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
