// ABOUTME: Waitlist landing page supporting homeowner and contractor signups
// ABOUTME: Uses query param ?type=contractor to switch form variants

'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import WaitlistForm from '@/components/marketing/WaitlistForm';

export default function WaitlistPage() {
  const searchParams = useSearchParams();
  const [type, setType] = useState<'homeowner' | 'contractor'>('homeowner');

  useEffect(() => {
    const typeParam = searchParams.get('type');
    if (typeParam === 'contractor') {
      setType('contractor');
    }
  }, [searchParams]);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
        <div className="container-custom section-lg">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                {type === 'homeowner' ? 'Join the Waitlist' : 'Partner with SuprFi'}
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                {type === 'homeowner'
                  ? 'Be the first to know when direct-to-consumer financing launches. Get early access and exclusive benefits.'
                  : 'Join the network of home service contractors offering SuprFi financing to their customers.'}
              </p>
            </div>

            {/* Toggle */}
            <div className="flex justify-center mb-8">
              <div className="inline-flex rounded-lg bg-gray-100 p-1">
                <button
                  onClick={() => setType('homeowner')}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    type === 'homeowner'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  I'm a Homeowner
                </button>
                <button
                  onClick={() => setType('contractor')}
                  className={`px-6 py-2 rounded-lg font-medium transition-all ${
                    type === 'contractor'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  I'm a Contractor
                </button>
              </div>
            </div>

            {/* Form */}
            <WaitlistForm type={type} />

            {/* Benefits */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
              {type === 'homeowner' ? (
                <>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Early Access</h3>
                    <p className="text-sm text-gray-600">Be first in line when we launch direct applications</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Special Rates</h3>
                    <p className="text-sm text-gray-600">Exclusive launch offers for waitlist members</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Stay Informed</h3>
                    <p className="text-sm text-gray-600">Get updates on features and launch timeline</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Win More Jobs</h3>
                    <p className="text-sm text-gray-600">Help customers say yes with flexible financing</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Get Paid Faster</h3>
                    <p className="text-sm text-gray-600">Direct payment once customer is approved</p>
                  </div>
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 text-primary-600 mb-4">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Simple Integration</h3>
                    <p className="text-sm text-gray-600">Easy setup with your existing workflow</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
