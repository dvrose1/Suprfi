// ABOUTME: About page telling SuprFi's story and mission
// ABOUTME: Builds trust with mission, values, and team information

import React from 'react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'About Us | SuprFi',
  description: 'Learn about SuprFi\'s mission to make home repair financing fast, fair, and accessible for everyone.',
};

export default function AboutPage() {
  const values = [
    {
      title: 'Transparency',
      description: 'No hidden fees. No surprises. Clear terms that you can understand.',
      icon: '🔍',
    },
    {
      title: 'Speed',
      description: 'Emergencies don\'t wait. Our technology gets you approved in minutes.',
      icon: '⚡',
    },
    {
      title: 'Fairness',
      description: 'We believe everyone deserves access to affordable financing for essential repairs.',
      icon: '⚖️',
    },
    {
      title: 'Trust',
      description: 'Recommended by contractors because we treat their customers right.',
      icon: '🤝',
    },
  ];

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="section bg-gradient-to-br from-primary-50 to-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
                Making Home Repairs Affordable
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
                We're on a mission to help homeowners get the repairs they need, 
                when they need them, with financing that's fast, fair, and transparent.
              </p>
            </div>
          </div>
        </section>

        {/* Story */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
                Our Story
              </h2>
              <div className="prose prose-lg mx-auto text-gray-600 space-y-6">
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
        <section className="section bg-gray-50">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
                Our Values
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {values.map((value, index) => (
                  <div key={index} className="bg-white rounded-xl p-8 shadow-sm">
                    <div className="text-4xl mb-4">{value.icon}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {value.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {value.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="section bg-primary-600 text-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
                By the Numbers
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-5xl font-bold mb-2">$50M+</div>
                  <div className="text-primary-100">in repairs financed</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">10K+</div>
                  <div className="text-primary-100">happy homeowners</div>
                </div>
                <div>
                  <div className="text-5xl font-bold mb-2">500+</div>
                  <div className="text-primary-100">partner contractors</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                We're Just Getting Started
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Our vision is a world where no homeowner has to delay a critical repair because of cost, 
                and where every contractor has the tools to help their customers say yes.
              </p>
              <Button variant="primary" size="lg" href="/waitlist">
                Join Our Mission
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
