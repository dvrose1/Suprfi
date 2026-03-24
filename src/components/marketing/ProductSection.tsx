// ABOUTME: Product overview section showing the lending workflow
// ABOUTME: Includes before/during/after cards plus merchant portal and integrations

'use client';

import React from 'react';

interface FeatureCardProps {
  title: string;
  body: string;
  icon: React.ReactNode;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, body, icon }) => {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-8 shadow-lg border border-gray-100">
      <div className="w-10 sm:w-12 h-10 sm:h-12 rounded-xl bg-teal/10 flex items-center justify-center text-teal mb-4 sm:mb-5">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-semibold text-navy font-display mb-2 sm:mb-3">
        {title}
      </h3>
      <p className="text-medium-gray leading-relaxed text-sm sm:text-base">
        {body}
      </p>
    </div>
  );
};

const ProductSection: React.FC = () => {
  const workflowFeatures = [
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
    <>
      {/* The Opportunity Section */}
      <section id="product-section" className="py-16 sm:py-24 bg-warm-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Eyebrow */}
          <div className="text-sm font-semibold uppercase tracking-wider text-teal mb-3 sm:mb-4">
            The Opportunity
          </div>
          
          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-navy font-display mb-4 sm:mb-6">
            Contractors want to offer financing. Existing tools make it too hard.
          </h2>
          
          {/* Body */}
          <p className="text-base sm:text-lg md:text-xl text-dark-gray leading-relaxed mb-6 sm:mb-8">
            Home services is one of the largest consumer spend categories in the US, yet most jobs 
            are unplanned, urgent, and expensive. Financing consistently helps contractors close more 
            jobs, but most never offer it because existing tools weren&apos;t built for how they work.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-teal font-mono">$800B+</div>
              <div className="text-xs sm:text-sm text-medium-gray mt-1">US home services market*</div>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-teal font-mono">38%</div>
              <div className="text-xs sm:text-sm text-medium-gray mt-1">Close rate without financing**</div>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-teal font-mono">49%</div>
              <div className="text-xs sm:text-sm text-medium-gray mt-1">Close rate with financing**</div>
            </div>
            <div className="bg-white rounded-xl p-4 sm:p-5 shadow-sm border border-gray-100">
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-teal font-mono">63%</div>
              <div className="text-xs sm:text-sm text-medium-gray mt-1">Don&apos;t consistently offer it**</div>
            </div>
          </div>

          {/* Sources */}
          <div className="text-xs text-medium-gray space-y-1">
            <p>* Mordor Intelligence, US Home Service Market (2026)</p>
            <p>** ACCA & Farmington Consulting Group, Contractor of the Future Survey (2026)</p>
          </div>
        </div>
      </section>

      {/* The Platform Section */}
      <section className="py-16 sm:py-24 bg-light-gray">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Eyebrow */}
        <div className="text-sm font-semibold uppercase tracking-wider text-teal mb-3 sm:mb-4">
          The Platform
        </div>
        
        {/* Headline */}
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-navy font-display mb-4 sm:mb-6">
          End-to-end financing infrastructure, built for the field.
        </h2>
        
        {/* Body */}
        <p className="text-base sm:text-lg md:text-xl text-dark-gray leading-relaxed mb-8 sm:mb-12">
          SuprFi integrates directly into the tools contractors already use, making financing 
          available at every stage of the job without adding steps, logins, or manual entry. 
          From first homeowner touchpoint to funding confirmation, SuprFi handles the full 
          financing lifecycle.
        </p>
        
        {/* Workflow Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-16">
          {workflowFeatures.map((feature, index) => (
            <FeatureCard key={index} {...feature} />
          ))}
        </div>

        {/* Merchant Portal + Integrations row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Merchant Portal */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 flex flex-col">
            <h3 className="text-base sm:text-lg font-semibold text-navy font-display mb-2 sm:mb-3">
              Full visibility for your office team.
            </h3>
            <p className="text-medium-gray text-sm leading-relaxed flex-grow">
              While agents handle the heavy lifting, your team keeps full control. The SuprFi merchant 
              portal gives office managers and owners complete visibility into the pipeline and deep 
              analytics to understand your conversion rates, average loan size, approval rates by 
              service type, and trends over time.
            </p>
            <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
              <span className="px-2 sm:px-3 py-1 rounded-full bg-teal/10 text-teal text-xs font-medium">Pipeline</span>
              <span className="px-2 sm:px-3 py-1 rounded-full bg-teal/10 text-teal text-xs font-medium">Analytics</span>
              <span className="px-2 sm:px-3 py-1 rounded-full bg-teal/10 text-teal text-xs font-medium">Team Access</span>
            </div>
          </div>

          {/* Integrations */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 flex flex-col">
            <h3 className="text-base sm:text-lg font-semibold text-navy font-display mb-2 sm:mb-3">
              Deep integration with the tools contractors already use.
            </h3>
            <p className="text-medium-gray text-sm leading-relaxed flex-grow">
              SuprFi connects bidirectionally with the contractor&apos;s CRM. Job details flow in 
              automatically. Status and funding confirmations flow back to the job record. 
              The office manager sees the financing pipeline alongside every job, without a separate login.
            </p>
            <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
              <span className="px-2 sm:px-3 py-1 rounded-full bg-gray-100 text-navy text-xs font-medium">ServiceTitan</span>
              <span className="px-2 sm:px-3 py-1 rounded-full bg-gray-100 text-navy text-xs font-medium">Housecall Pro</span>
              <span className="px-2 sm:px-3 py-1 rounded-full bg-gray-100 text-navy text-xs font-medium">Jobber</span>
              <span className="px-2 sm:px-3 py-1 rounded-full bg-gray-100 text-navy text-xs font-medium">FieldEdge</span>
              <span className="px-2 sm:px-3 py-1 rounded-full bg-gray-100 text-navy text-xs font-medium">Custom API</span>
            </div>
          </div>
        </div>
      </div>
    </section>
    </>
  );
};

export default ProductSection;
