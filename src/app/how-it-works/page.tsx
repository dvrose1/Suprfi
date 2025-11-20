// ABOUTME: How It Works page explaining the financing process in detail
// ABOUTME: Expanded version with FAQs and step-by-step breakdown

import React from 'react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'How It Works | SuprFi',
  description: 'Learn how to get fast, simple financing for your home repair. Apply in minutes, get approved instantly, choose flexible terms.',
};

export default function HowItWorksPage() {
  const steps = [
    {
      number: '1',
      title: 'Your Contractor Offers Financing',
      description: 'When you need a home repair but don\'t want to pay upfront, your technician or contractor can offer SuprFi financing. They\'ll send you a secure link via text or email to start your application.',
      details: [
        'Get link via text or email',
        'Completely secure and encrypted',
        'Link valid for 48 hours',
        'No obligation to apply',
      ],
    },
    {
      number: '2',
      title: 'Complete Your Application',
      description: 'Fill out a simple application that takes 5 minutes or less. We\'ll ask for basic information like your name, address, and income. No lengthy paperwork required.',
      details: [
        'Basic personal information',
        'Employment and income details',
        'Contact information',
        'Soft credit check (no impact on score)',
      ],
    },
    {
      number: '3',
      title: 'Connect Your Bank',
      description: 'Using secure bank verification (Plaid), we\'ll verify your income and account health. This is the fastest way to get approved and helps us offer you the best rates.',
      details: [
        'Bank-level security',
        'Read-only access',
        'Instant verification',
        'Supports 10,000+ banks',
      ],
    },
    {
      number: '4',
      title: 'Verify Your Identity',
      description: 'Take a quick photo of your ID to verify your identity. This keeps everyone safe and ensures compliance with lending regulations.',
      details: [
        'Takes less than 2 minutes',
        'Photo of ID + selfie',
        'Secure and encrypted',
        'Protects against fraud',
      ],
    },
    {
      number: '5',
      title: 'Get Instant Approval',
      description: 'Our smart decisioning engine analyzes your information and gives you an instant decision. Most customers know within 5 minutes if they\'re approved.',
      details: [
        'Instant decision',
        'Multiple loan options',
        'Clear terms and rates',
        'No surprises or hidden fees',
      ],
    },
    {
      number: '6',
      title: 'Choose Your Terms',
      description: 'Review your loan offers and pick the one that works best for your budget. You\'ll see exact monthly payments, APR, and total cost before accepting.',
      details: [
        'Terms from 12-60 months',
        'Amounts from $2,500-$25,000',
        'Starting APR as low as 14.99%',
        'No prepayment penalties',
      ],
    },
  ];

  const faqs = [
    {
      question: 'How long does approval take?',
      answer: 'Most customers get a decision in 5 minutes or less. The entire process from application to acceptance typically takes 10-15 minutes.',
    },
    {
      question: 'Will checking my rate affect my credit score?',
      answer: 'No! We use a soft credit pull to check your rate, which does not impact your credit score. Only if you accept an offer and finalize the loan will we do a hard credit inquiry.',
    },
    {
      question: 'What do I need to apply?',
      answer: 'You\'ll need a government-issued ID, a bank account in your name, and proof of income. The process is entirely digital - no need to visit a branch or print documents.',
    },
    {
      question: 'Can I pay off my loan early?',
      answer: 'Yes! There are no prepayment penalties. You can pay off your loan early at any time and save on interest.',
    },
    {
      question: 'What if I\'m not approved?',
      answer: 'If you\'re not approved, we\'ll send you a detailed explanation. You may be able to reapply with a co-borrower or wait 30 days and try again.',
    },
  ];

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="section bg-gradient-to-br from-primary-50 to-white">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                How SuprFi Works
              </h1>
              <p className="text-xl text-gray-600">
                Fast, simple financing for your home repair in 6 easy steps
              </p>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="section bg-white">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto space-y-12">
              {steps.map((step, index) => (
                <div key={index} className="flex gap-6">
                  {/* Number */}
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg">
                      {step.number}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-grow">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h2>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {step.description}
                    </p>
                    <ul className="space-y-2">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-start">
                          <svg className="w-5 h-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="section bg-gray-50">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-12 text-center">
                Frequently Asked Questions
              </h2>
              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <Card key={index} padding="lg">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="section bg-primary-600">
          <div className="container-custom">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-primary-100 mb-8">
                Join our waitlist or ask your contractor about SuprFi financing today.
              </p>
              <Button 
                variant="secondary" 
                size="lg" 
                href="/waitlist"
                className="bg-white text-primary-700 hover:bg-gray-100"
              >
                Join Waitlist
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
