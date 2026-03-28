// ABOUTME: Contact page with contact information and inquiry form
// ABOUTME: Multiple contact methods and quick links to common questions

import React from 'react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import Link from 'next/link';

export const metadata = {
  title: 'Contact Us | SuprFi',
  description: 'Get in touch with SuprFi. Questions about financing, contractor partnerships, or support.',
};

export default function ContactPage() {
  const contactMethods = [
    {
      title: 'General Inquiries',
      email: 'support@suprfi.com',
      description: 'Questions about SuprFi or our services',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Contractor Partnerships',
      email: 'contractors@suprfi.com',
      description: 'Interested in offering SuprFi to your customers?',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'Customer Support',
      email: 'support@suprfi.com',
      description: 'Have an active loan? Need help with your application?',
      icon: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
  ];

  const quickLinks = [
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'For Contractors', href: '/contractors' },
    { label: 'Join Waitlist', href: '/waitlist' },
    { label: 'About Us', href: '/about' },
  ];

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 md:py-24 bg-gradient-to-br from-teal/5 to-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold font-display text-navy mb-6">
                Get in Touch
              </h1>
              <p className="text-xl text-medium-gray">
                We'd love to hear from you. Choose the best way to reach us below.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {contactMethods.map((method, index) => (
                <div key={index} className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 text-center transition-all hover:shadow-xl hover:-translate-y-1">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-teal text-white mb-6 shadow-md">
                    {method.icon}
                  </div>
                  <h3 className="text-xl font-bold font-display text-navy mb-3">
                    {method.title}
                  </h3>
                  <p className="text-medium-gray mb-4 text-sm">
                    {method.description}
                  </p>
                  <a
                    href={`mailto:${method.email}`}
                    className="text-teal hover:text-teal/80 font-medium transition-colors"
                  >
                    {method.email}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Link */}
        <section className="py-16 md:py-24 bg-light-gray">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl p-8 shadow-md border border-gray-100 text-center">
                <h2 className="text-2xl font-bold font-display text-navy mb-4">
                  Looking for Answers?
                </h2>
                <p className="text-medium-gray mb-6">
                  Check out our How It Works page for frequently asked questions about the application process, approval times, and more.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {quickLinks.map((link, index) => (
                    <Link
                      key={index}
                      href={link.href}
                      className="px-6 py-3 rounded-xl bg-teal/10 text-teal hover:bg-teal/20 font-medium transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Office Info */}
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold font-display text-navy mb-4">
                Mailing Address
              </h2>
              <p className="text-medium-gray">
                SuprFi Financial Services<br />
                [Address Line 1]<br />
                [City, State ZIP]
              </p>
              <p className="text-sm text-medium-gray/70 mt-6">
                Licensed lender in [states]. NMLS #[pending]
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
