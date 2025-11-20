// ABOUTME: Homeowners landing page explaining benefits and process
// ABOUTME: Focuses on affordability, speed, and ease of getting financing

import React from 'react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'For Homeowners | SuprFi',
  description: 'Get the home repairs you need now, pay over time. Fast approval, flexible terms, no surprises. From $2,500 to $25,000.',
};

export default function HomeownersPage() {
  const benefits = [
    {
      title: 'Fast Approval',
      description: 'Get a decision in 5 minutes. No waiting days for loan approval - we use modern technology to give you instant answers.',
      icon: '⚡',
    },
    {
      title: 'Flexible Terms',
      description: 'Choose from 12 to 60 months. Pick monthly payments that fit your budget and lifestyle.',
      icon: '📅',
    },
    {
      title: 'No Hidden Fees',
      description: 'What you see is what you get. Clear APR, no origination fees, no prepayment penalties.',
      icon: '💰',
    },
    {
      title: 'Easy Application',
      description: 'All online, all mobile-friendly. Complete your application in 10 minutes from your phone.',
      icon: '📱',
    },
  ];

  const useCases = [
    {
      title: 'HVAC Repairs',
      description: 'Don\'t sweat it out. Get your heating or cooling system fixed now.',
      amount: '$3,500 - $15,000',
      icon: '❄️',
    },
    {
      title: 'Plumbing Emergencies',
      description: 'Burst pipe? Water heater failed? Get it fixed today.',
      amount: '$2,500 - $8,000',
      icon: '🚰',
    },
    {
      title: 'Electrical Work',
      description: 'Panel upgrades, rewiring, or emergency repairs.',
      amount: '$3,000 - $12,000',
      icon: '⚡',
    },
    {
      title: 'Roofing',
      description: 'Storm damage or full replacement. Protect your biggest investment.',
      amount: '$5,000 - $25,000',
      icon: '🏠',
    },
  ];

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="section bg-gradient-to-br from-primary-600 to-primary-700 text-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
                Fix It Now. Pay Over Time.
              </h1>
              <p className="text-xl md:text-2xl text-primary-100 mb-10">
                Don't put off critical home repairs. Get the financing you need 
                with fast approval and terms that fit your budget.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="secondary" 
                  size="lg"
                  href="/waitlist"
                  className="bg-white text-primary-700 hover:bg-gray-100"
                >
                  Join Waitlist
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  href="/how-it-works"
                  className="border-white text-white hover:bg-white/10"
                >
                  How It Works
                </Button>
              </div>

              {/* Trust indicators */}
              <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-primary-100">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-gold-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>4.8/5 from 2,000+ homeowners</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Licensed lender</span>
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Bank-level security</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Why Homeowners Choose SuprFi
              </h2>
              <p className="text-xl text-gray-600">
                Built specifically for home repair financing
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="text-5xl mb-4">{benefit.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="section bg-gray-50">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                What You Can Finance
              </h2>
              <p className="text-xl text-gray-600">
                From emergency repairs to major upgrades
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {useCases.map((useCase, index) => (
                <Card key={index} padding="lg" hover>
                  <div className="flex items-start gap-4">
                    <div className="text-4xl flex-shrink-0">{useCase.icon}</div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {useCase.title}
                      </h3>
                      <p className="text-gray-600 mb-3 text-sm">
                        {useCase.description}
                      </p>
                      <div className="text-sm font-semibold text-primary-600">
                        Typical Range: {useCase.amount}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-gray-600 mb-6">
                And many other home repairs from $2,500 to $25,000
              </p>
            </div>
          </div>
        </section>

        {/* Rates */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Simple, Transparent Pricing
                </h2>
                <p className="text-xl text-gray-600">
                  No hidden fees or surprises
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card padding="lg" className="text-center">
                  <div className="text-sm text-gray-500 uppercase font-semibold mb-2">Loan Amount</div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">$2.5K - $25K</div>
                  <div className="text-sm text-gray-600">Based on creditworthiness</div>
                </Card>
                
                <Card padding="lg" className="text-center">
                  <div className="text-sm text-gray-500 uppercase font-semibold mb-2">Starting APR</div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">14.99%</div>
                  <div className="text-sm text-gray-600">Rates from 14.99% - 29.99%</div>
                </Card>
                
                <Card padding="lg" className="text-center">
                  <div className="text-sm text-gray-500 uppercase font-semibold mb-2">Loan Terms</div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">12-60 mo</div>
                  <div className="text-sm text-gray-600">Choose what works for you</div>
                </Card>
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-gray-500">
                  Example: A $10,000 loan at 19.99% APR for 36 months = $370/month
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Process */}
        <section className="section bg-primary-50">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
                Ready in 3 Simple Steps
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div>
                  <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">1</div>
                  <h3 className="font-bold text-gray-900 mb-2">Get a Link</h3>
                  <p className="text-sm text-gray-600">Your contractor sends you a secure application link</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">2</div>
                  <h3 className="font-bold text-gray-900 mb-2">Apply Online</h3>
                  <p className="text-sm text-gray-600">Complete a short application in 10 minutes</p>
                </div>
                <div>
                  <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">3</div>
                  <h3 className="font-bold text-gray-900 mb-2">Get Approved</h3>
                  <p className="text-sm text-gray-600">Receive your decision instantly and start repairs</p>
                </div>
              </div>
              <Button variant="primary" size="lg" href="/how-it-works">
                Learn More About the Process
              </Button>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-white mb-6">
                Don't Wait for Your Next Emergency
              </h2>
              <p className="text-xl text-primary-100 mb-10">
                Join our waitlist to be first in line when we launch direct applications. 
                Or ask your contractor if they offer SuprFi today.
              </p>
              <Button 
                variant="secondary" 
                size="lg"
                href="/waitlist"
                className="bg-white text-primary-700 hover:bg-gray-100"
              >
                Join Waitlist Now
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
