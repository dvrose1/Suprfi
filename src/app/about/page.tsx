// ABOUTME: About page telling SuprFi's story and mission
// ABOUTME: Builds trust with mission, values, and team information

import React from 'react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'About Us | SuprFi',
  description: 'Learn about SuprFi\'s mission to make home repair financing fast, fair, and accessible for everyone.',
};

export default function AboutPage() {
  const values = [
    {
      title: 'Transparency',
      description: 'No hidden fees. No surprises. Clear terms that you can understand.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
    },
    {
      title: 'Speed',
      description: 'Emergencies don\'t wait. Our technology gets you approved in minutes.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: 'Fairness',
      description: 'We believe everyone deserves access to affordable financing for essential repairs.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
        </svg>
      ),
    },
    {
      title: 'Trust',
      description: 'Recommended by contractors because we treat their customers right.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-teal/5 to-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-display text-navy mb-6">
                Making Home Repairs Affordable
              </h1>
              <p className="text-xl md:text-2xl text-medium-gray leading-relaxed">
                We're on a mission to help homeowners get the repairs they need, 
                when they need them, with financing that's fast, fair, and transparent.
              </p>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold font-display text-navy mb-8 text-center">
                Our Story
              </h2>
              <div className="prose prose-lg mx-auto text-medium-gray space-y-6">
                <p>
                  When your AC breaks in the middle of summer or your water heater fails on a Sunday morning, 
                  you need it fixed fast. But repairs like these can cost thousands of dollars - money that 
                  many families don't have sitting in their bank account.
                </p>
                <p>
                  Traditional lending options are too slow. Credit cards are too expensive. And many homeowners 
                  delay critical repairs because they can't afford the upfront cost, leading to bigger problems 
                  and higher costs down the road.
                </p>
                <p>
                  That's why we built SuprFi. We saw contractors losing jobs because customers couldn't pay, 
                  and homeowners suffering through broken systems because financing was too hard to get. 
                  We knew there had to be a better way.
                </p>
                <p>
                  Today, SuprFi is the leading financing platform purpose-built for home repairs. We've helped 
                  thousands of families get the repairs they need with terms they can afford, and we've helped 
                  contractors grow their businesses by saying "yes" more often.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 md:py-24 bg-light-gray">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold font-display text-navy mb-12 text-center">
                Our Values
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {values.map((value, index) => (
                  <div key={index} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                    <div className="w-12 h-12 rounded-xl bg-teal/10 text-teal flex items-center justify-center mb-4">
                      {value.icon}
                    </div>
                    <h3 className="text-xl font-bold font-display text-navy mb-3">
                      {value.title}
                    </h3>
                    <p className="text-medium-gray leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-16 md:py-24 bg-navy text-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-12 text-center">
                By the Numbers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-5xl font-bold font-display mb-2">$50M+</div>
                  <div className="text-white/60">in repairs financed</div>
                </div>
                <div>
                  <div className="text-5xl font-bold font-display mb-2">10K+</div>
                  <div className="text-white/60">happy homeowners</div>
                </div>
                <div>
                  <div className="text-5xl font-bold font-display mb-2">500+</div>
                  <div className="text-white/60">partner contractors</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold font-display text-navy mb-6">
                We're Just Getting Started
              </h2>
              <p className="text-xl text-medium-gray mb-8 leading-relaxed">
                Our vision is a world where no homeowner has to delay a critical repair because of cost, 
                and where every contractor has the tools to help their customers say yes.
              </p>
              <Link
                href="/waitlist"
                className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-teal text-white font-semibold text-lg transition-all hover:bg-teal/90 hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-teal/50 focus:ring-offset-2"
              >
                Join Our Mission
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
