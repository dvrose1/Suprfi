// ABOUTME: Merchant portal section highlighting dashboard, analytics, and loan management
// ABOUTME: Shows that contractors get a full portal for tracking and insights

'use client';

import React from 'react';

const MerchantPortalSection: React.FC = () => {
  const features = [
    {
      title: 'Application Pipeline',
      description: 'Track every financing request from submission to funding. See status updates in real-time without leaving your workflow.',
    },
    {
      title: 'Loan Management',
      description: 'View active loans, payment history, and funding schedules. Everything your office team needs in one place.',
    },
    {
      title: 'Deep Analytics',
      description: 'Understand your financing performance. Conversion rates, average loan size, approval rates by service type, and trends over time.',
    },
    {
      title: 'Team Access',
      description: 'Role-based permissions for your team. Technicians see what they need, office managers get the full picture.',
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Eyebrow */}
        <div className="text-sm font-semibold uppercase tracking-wider text-teal mb-4">
          Merchant Portal
        </div>
        
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy font-display mb-6 max-w-3xl">
          Full visibility for your office team.
        </h2>
        
        {/* Body */}
        <p className="text-lg md:text-xl text-dark-gray leading-relaxed mb-12 max-w-3xl">
          While agents handle the heavy lifting, your team keeps full control. The SuprFi merchant portal 
          gives office managers and owners complete visibility into every application, loan, and payment, 
          plus the analytics to make better decisions.
        </p>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="border-l-2 border-teal pl-6">
              <h3 className="text-lg font-semibold text-navy font-display mb-2">
                {feature.title}
              </h3>
              <p className="text-medium-gray leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MerchantPortalSection;
