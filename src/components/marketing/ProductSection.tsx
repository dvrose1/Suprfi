// ABOUTME: Product overview section showing the lending workflow
// ABOUTME: Three columns for before/during/after visit touchpoints

'use client';

import React from 'react';

interface FeatureCardProps {
  title: string;
  body: string;
  icon: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, body, icon }) => {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
      <div className="w-12 h-12 rounded-xl bg-teal/10 flex items-center justify-center text-teal mb-5">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-navy font-display mb-3">
        {title}
      </h3>
      <p className="text-medium-gray leading-relaxed">
        {body}
      </p>
    </div>
  );
};

const ProductSection: React.FC = () => {
  const features = [
    {
      title: 'Before the visit',
      body: 'The homeowner books a service call. SuprFi can pre-qualify them before the technician arrives, so they know their budget before they see the quote.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'During the visit',
      body: 'The technician quotes the job. SuprFi generates personalized monthly payment options the homeowner can review on their phone, right there on-site.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      title: 'After the visit',
      body: 'The homeowner needs to think about it. SuprFi follows up with financing options specific to the job that was quoted, closing the loop that usually stays open.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-24 bg-light-gray">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Eyebrow */}
        <div className="text-sm font-semibold uppercase tracking-wider text-teal mb-4">
          What We&apos;re Building
        </div>
        
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy font-display mb-6 max-w-4xl">
          Unsecured consumer lending that lives inside the contractor&apos;s workflow.
        </h2>
        
        {/* Body */}
        <p className="text-lg md:text-xl text-dark-gray leading-relaxed mb-12 max-w-3xl">
          SuprFi originates loans for home services jobs under $25K. We&apos;re building the lending layer 
          that embeds directly into how contractors already operate: their CRM, their messaging, their 
          on-site sales process. Financing is available before the technician arrives, on-site during 
          the quote, or as a follow-up after the visit.
        </p>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
