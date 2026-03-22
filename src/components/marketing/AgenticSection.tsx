// ABOUTME: Agentic advantage section comparing portal vs AI agent approach
// ABOUTME: Side-by-side comparison showing why AI agents beat traditional portals

'use client';

import React from 'react';

const AgenticSection: React.FC = () => {
  const portalFeatures = [
    'Technician logs into a separate portal',
    'Manually enters job details and customer info',
    'Homeowner is handed a tablet or URL',
    'Application only works at the point of sale',
    'No support after hours',
    'Office manager checks a separate dashboard',
    'If the homeowner doesn\'t finish, nobody follows up',
  ];

  const agentFeatures = [
    'Technician texts job details or it flows from the CRM',
    'Agent generates payment options in seconds',
    'Homeowner gets a personalized link on their phone',
    'Works before, during, or after the service call',
    'Agent answers borrower questions 24/7',
    'Loan status syncs directly to the contractor\'s CRM',
    'Agent follows up automatically with the specific quote and terms',
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Eyebrow */}
        <div className="text-sm font-semibold uppercase tracking-wider text-teal mb-4">
          The Technology
        </div>
        
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy font-display mb-6 max-w-3xl">
          Why AI agents, not portals.
        </h2>
        
        {/* Body */}
        <p className="text-lg md:text-xl text-dark-gray leading-relaxed mb-6 max-w-4xl">
          Every existing home services financing product works the same way: the contractor logs into 
          a portal, enters the customer&apos;s information, and hopes the homeowner completes the application. 
          It doesn&apos;t work. Technicians aren&apos;t software users. They&apos;re in crawl spaces and on rooftops. 
          The portal model is why financing adoption is so low in this industry.
        </p>
        
        <p className="text-lg md:text-xl text-dark-gray leading-relaxed mb-12 max-w-4xl">
          SuprFi replaces the portal with autonomous AI agents that handle the entire lending workflow, 
          from the technician&apos;s first text to the borrower&apos;s last payment question.
        </p>
        
        {/* Comparison Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
          {/* Portal Side */}
          <div className="bg-gray-100 rounded-2xl p-8">
            <h3 className="text-xl font-semibold text-gray-500 font-display mb-6">
              Portal-Based Lenders
            </h3>
            <ul className="space-y-4">
              {portalFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3 text-gray-500">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Agent Side */}
          <div className="bg-teal/5 rounded-2xl p-8 border-2 border-teal/20">
            <h3 className="text-xl font-semibold text-navy font-display mb-6 flex items-center gap-2">
              <span className="text-teal">SuprFi:</span> Agent-Powered
            </h3>
            <ul className="space-y-4">
              {agentFeatures.map((feature, index) => (
                <li key={index} className="flex items-start gap-3 text-navy">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Callout Box */}
        <div className="bg-navy rounded-2xl p-8 text-white">
          <p className="text-lg md:text-xl leading-relaxed">
            <span className="font-semibold">The technician&apos;s only job is to quote the work.</span>{' '}
            SuprFi&apos;s agents handle origination, borrower communication, document collection, underwriting, 
            and CRM sync, all autonomously. When offering financing requires zero effort from the tech, it gets 
            offered on every job.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AgenticSection;
