// ABOUTME: Integrations section showing CRM and data provider connections
// ABOUTME: Displays ServiceTitan, Housecall Pro, Jobber, etc.

'use client';

import React from 'react';

const IntegrationsSection: React.FC = () => {
  const crmIntegrations = [
    'ServiceTitan',
    'Housecall Pro',
    'Jobber',
    'FieldEdge',
    'Custom via API',
  ];

  return (
    <section className="py-24 bg-light-gray">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Eyebrow */}
        <div className="text-sm font-semibold uppercase tracking-wider text-teal mb-4">
          Integrations
        </div>
        
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy font-display mb-6 max-w-3xl">
          Deep integration with the tools contractors already use.
        </h2>
        
        {/* Body */}
        <p className="text-lg md:text-xl text-dark-gray leading-relaxed mb-12 max-w-3xl">
          SuprFi connects bidirectionally with the contractor&apos;s CRM. Job details flow in automatically. 
          Loan status, approval amounts, and funding confirmations flow back to the job record. The office 
          manager sees the financing pipeline alongside every job, without a separate login.
        </p>
        
        {/* Integration Pills */}
        <div className="flex flex-wrap gap-3 mb-12">
          {crmIntegrations.map((integration, index) => (
            <div 
              key={index}
              className="px-6 py-3 rounded-full bg-white border border-gray-200 text-navy font-medium shadow-sm"
            >
              {integration}
            </div>
          ))}
        </div>
        
        {/* Additional integrations note */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 max-w-2xl">
          <p className="text-medium-gray">
            Plus direct integrations with <span className="text-navy font-medium">bank verification providers</span> for 
            income and account verification, and <span className="text-navy font-medium">credit bureaus</span> for 
            real-time decisioning.
          </p>
        </div>
      </div>
    </section>
  );
};

export default IntegrationsSection;
