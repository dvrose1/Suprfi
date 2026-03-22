// ABOUTME: Technical section showing agent architecture for the loan lifecycle
// ABOUTME: Four agent cards explaining each agent's role

'use client';

import React from 'react';

interface AgentCardProps {
  title: string;
  body: string;
  icon: React.ReactNode;
}

const AgentCard: React.FC<AgentCardProps> = ({ title, body, icon }) => {
  return (
    <div className="bg-navy/80 backdrop-blur rounded-2xl p-6 border-t-4 border-teal">
      <div className="w-12 h-12 rounded-xl bg-teal/20 flex items-center justify-center text-teal mb-5">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white font-display mb-3">
        {title}
      </h3>
      <p className="text-white/70 text-sm leading-relaxed">
        {body}
      </p>
    </div>
  );
};

const AgentArchitecture: React.FC = () => {
  const agents = [
    {
      title: 'Technician Assistant',
      body: 'Lives in WhatsApp and SMS. Receives job details from the tech, generates financing offers, confirms approval status, and writes loan data back to the contractor\'s CRM.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      title: 'Borrower Agent',
      body: 'Guides the homeowner through the application via text or chat. Collects documents via photo upload. Answers questions about payment options, rates, and timelines around the clock.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
        </svg>
      ),
    },
    {
      title: 'Underwriting Agent',
      body: 'Processes applications in real-time. Classifies and verifies uploaded documents. Runs credit decisioning against SuprFi\'s policies. Returns approvals within minutes, not days.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: 'Operations Agent',
      body: 'Monitors the full application pipeline. Flags stalled applications. Triggers follow-up sequences. Generates reporting for SuprFi and for the contractor\'s office team.',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <section className="py-24 bg-navy relative overflow-hidden">
      {/* Background pattern */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{ 
          backgroundImage: 'radial-gradient(circle at 50% 50%, #2A9D8F 0%, transparent 50%)'
        }}
      />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Eyebrow */}
        <div className="text-sm font-semibold uppercase tracking-wider text-teal mb-4">
          Under The Hood
        </div>
        
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white font-display mb-6 max-w-3xl">
          An agent for every step of the loan lifecycle.
        </h2>
        
        {/* Body */}
        <p className="text-lg md:text-xl text-white/80 leading-relaxed mb-12 max-w-3xl">
          SuprFi&apos;s agent architecture is purpose-built for consumer lending in the field. Each agent 
          has a defined role, communicates through shared context, and operates within SuprFi&apos;s credit 
          policies and compliance requirements.
        </p>
        
        {/* Agent Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {agents.map((agent, index) => (
            <AgentCard key={index} {...agent} />
          ))}
        </div>
        
        {/* Bottom note */}
        <p className="text-white/60 text-center max-w-3xl mx-auto">
          All agents share context: the job, the borrower, the contractor, and SuprFi&apos;s current credit 
          policies. When we update terms or tighten policy, every agent adapts immediately.
        </p>
      </div>
    </section>
  );
};

export default AgentArchitecture;
