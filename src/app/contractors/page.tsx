// ABOUTME: Contractor landing page explaining partnership benefits
// ABOUTME: Focuses on closing more jobs, getting paid faster, and simple integration

import React from 'react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'For Contractors | SuprFi',
  description: 'Win more jobs and get paid faster. Offer your customers instant financing for home repairs. Simple integration, fast approvals, direct payment.',
};

export default function ContractorsPage() {
  const benefits = [
    {
      title: 'Win More Jobs',
      description: 'Don\'t lose customers who can\'t afford to pay upfront. Give them flexible payment options and close more high-ticket repairs.',
      icon: '📈',
      stat: '35%',
      statLabel: 'Average increase in close rate',
    },
    {
      title: 'Get Paid Faster',
      description: 'No more waiting for customers to pay. We pay you directly once the loan is approved - usually within 24 hours.',
      icon: '💰',
      stat: '24 hours',
      statLabel: 'Average time to payment',
    },
    {
      title: 'Simple Integration',
      description: 'Works with your existing workflow. No hardware required. Just send your customer a link and we handle the rest.',
      icon: '⚡',
      stat: '5 min',
      statLabel: 'Setup time',
    },
    {
      title: 'Protect Your Cash Flow',
      description: 'No more extending credit yourself. Let us handle the financing while you focus on delivering great service.',
      icon: '🛡️',
      stat: '0%',
      statLabel: 'Risk to your business',
    },
  ];

  const howItWorks = [
    {
      step: '1',
      title: 'Customer Needs Financing',
      description: 'When presenting an estimate, offer SuprFi as a payment option.',
    },
    {
      step: '2',
      title: 'Send Application Link',
      description: 'Text or email your customer a secure application link from your SuprFi dashboard or CRM.',
    },
    {
      step: '3',
      title: 'Customer Gets Approved',
      description: 'Your customer completes their application in minutes and receives instant approval.',
    },
    {
      step: '4',
      title: 'Start the Job',
      description: 'Once approved, you can start work immediately. We\'ll pay you directly.',
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
                Win More Jobs. Get Paid Faster.
              </h1>
              <p className="text-xl md:text-2xl text-primary-100 mb-10">
                Offer your customers instant financing for home repairs. Close more high-ticket jobs with flexible payment options.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="secondary" 
                  size="lg"
                  href="/waitlist?type=contractor"
                  className="bg-white text-primary-700 hover:bg-gray-100"
                >
                  Become a Partner
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  href="#how-it-works"
                  className="border-white text-white hover:bg-white/10"
                >
                  See How It Works
                </Button>
              </div>

              {/* Trust bar */}
              <div className="mt-12 flex flex-wrap justify-center items-center gap-8 text-sm text-primary-100">
                <div>
                  <div className="text-3xl font-bold text-white">$50M+</div>
                  <div>Repairs Financed</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">500+</div>
                  <div>Partner Contractors</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white">4.9/5</div>
                  <div>Contractor Rating</div>
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
                Why Partner with SuprFi?
              </h2>
              <p className="text-xl text-gray-600">
                We're built specifically for home service contractors
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => (
                <Card key={index} padding="lg" hover>
                  <div className="text-4xl mb-6">
                    {benefit.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {benefit.description}
                  </p>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="text-3xl font-bold text-primary-600">{benefit.stat}</div>
                    <div className="text-sm text-gray-500">{benefit.statLabel}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section id="how-it-works" className="section bg-gray-50">
          <div className="container-custom">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Simple 4-Step Process
              </h2>
              <p className="text-xl text-gray-600">
                Get your customers approved and start work in minutes
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
              {howItWorks.map((item, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-4">
                  Transparent Pricing
                </h2>
                <p className="text-xl text-gray-600">
                  Simple, predictable fees with no surprises
                </p>
              </div>

              <Card padding="lg" className="max-w-2xl mx-auto">
                <div className="text-center mb-8">
                  <div className="text-5xl font-bold text-primary-600 mb-2">2.5%</div>
                  <div className="text-xl text-gray-600">Merchant discount rate</div>
                </div>
                
                <div className="space-y-4 text-gray-600">
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-primary-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>No setup fees or monthly minimums</span>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-primary-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>You only pay when a loan is funded</span>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-primary-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Paid directly to your account within 24 hours</span>
                  </div>
                  <div className="flex items-start">
                    <svg className="w-6 h-6 text-primary-600 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>No chargebacks or collection risk</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Grow Your Business?
              </h2>
              <p className="text-xl text-primary-100 mb-10">
                Join hundreds of contractors using SuprFi to close more jobs and get paid faster.
              </p>
              <Button 
                variant="secondary" 
                size="lg"
                href="/waitlist?type=contractor"
                className="bg-white text-primary-700 hover:bg-gray-100"
              >
                Become a Partner Today
              </Button>
              <p className="mt-6 text-primary-100 text-sm">
                Questions? Email us at{' '}
                <a href="mailto:contractors@suprfi.com" className="underline hover:text-white">
                  contractors@suprfi.com
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
