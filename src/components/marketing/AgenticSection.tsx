// ABOUTME: Technology section with agentic comparison and agent architecture
// ABOUTME: Explains why AI agents work better than portals for home services

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
    'Status syncs directly to the contractor\'s CRM',
    'Agent follows up automatically with the specific quote and terms',
  ];

  const agents = [
    {
      title: 'Technician Assistant',
      body: 'Lives in SMS. Receives job details from the tech, generates financing offers, and syncs data back to the CRM.',
    },
    {
      title: 'Borrower Agent',
      body: 'Guides homeowners through the application via text or chat. Collects documents and answers questions 24/7.',
    },
    {
      title: 'Underwriting Agent',
      body: 'Processes applications in real-time. Verifies documents and runs credit decisioning within minutes.',
    },
    {
      title: 'Operations Agent',
      body: 'Monitors the pipeline, flags stalled applications, triggers follow-ups, and generates reporting.',
    },
  ];

  return (
    <>
      {/* Main Technology Section - Navy background */}
      <section className="py-24 bg-navy relative overflow-hidden">
        <div 
          className="absolute inset-0 opacity-5"
          style={{ 
            backgroundImage: 'radial-gradient(circle at 25% 25%, #2A9D8F 0%, transparent 50%), radial-gradient(circle at 75% 75%, #6EC6A7 0%, transparent 50%)'
          }}
        />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Eyebrow */}
          <div className="text-sm font-semibold uppercase tracking-wider text-teal mb-4">
            The Technology
          </div>
          
          {/* Headline */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-display mb-6">
            Why AI agents, not portals.
          </h2>
          
          {/* Body */}
          <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-12">
            Existing solutions rely on portal-based workflows that don&apos;t match how technicians operate. 
            Technicians aren&apos;t behind desks, they&apos;re in the field, which is why adoption remains low. 
            SuprFi augments these systems with autonomous AI agents that orchestrate the financing 
            experience, engaging homeowners from first interaction through post-job support.
          </p>
          
          {/* Comparison Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            {/* Portal Side */}
            <div className="bg-white/10 backdrop-blur rounded-2xl p-8">
              <h3 className="text-xl font-semibold text-white/60 font-display mb-6">
                Portal-Based Lenders
              </h3>
              <ul className="space-y-4">
                {portalFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-white/60">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Agent Side */}
            <div className="bg-teal/20 rounded-2xl p-8 border-2 border-teal/30">
              <h3 className="text-xl font-semibold text-white font-display mb-6 flex items-center gap-2">
                <span className="text-teal">SuprFi:</span> Agent-Powered
              </h3>
              <ul className="space-y-4">
                {agentFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-white">
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
          <div className="bg-white rounded-2xl p-8 text-navy">
            <p className="text-lg md:text-xl leading-relaxed">
              <span className="font-semibold">Technicians focus on the job, not financing.</span>{' '}
              SuprFi&apos;s agents handle the rest: borrower communication, underwriting, and CRM sync. 
              When it&apos;s effortless, financing gets offered every time.
            </p>
          </div>
        </div>
      </section>

      {/* Under the Hood - Agent Architecture - White background */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Eyebrow */}
          <div className="text-sm font-semibold uppercase tracking-wider text-teal mb-4">
            Under The Hood
          </div>
          
          {/* Headline */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy font-display mb-6">
            An agent for every step.
          </h2>
          
          {/* Body */}
          <p className="text-lg md:text-xl text-dark-gray leading-relaxed mb-12">
            SuprFi&apos;s agent architecture is purpose-built for consumer lending in the field. Each agent 
            has a defined role and operates within SuprFi&apos;s credit policies and compliance requirements.
          </p>
          
          {/* Agent Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {agents.map((agent, index) => (
              <div 
                key={index}
                className="bg-light-gray rounded-2xl p-6 border border-gray-200"
              >
                <h3 className="text-lg font-semibold text-navy font-display mb-3">
                  {agent.title}
                </h3>
                <p className="text-medium-gray text-sm leading-relaxed">
                  {agent.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default AgenticSection;
