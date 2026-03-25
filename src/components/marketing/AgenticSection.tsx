// ABOUTME: Technology section with agentic comparison and agent architecture
// ABOUTME: Explains why AI agents work better than portals for home services

'use client';

import React from 'react';
import { motion } from 'framer-motion';

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
      title: 'Technician Agent',
      body: 'Receives job details from the technician via SMS or CRM, generates personalized financing offers in seconds, and syncs application status back to the job record automatically.',
    },
    {
      title: 'Borrower Agent',
      body: 'Guides homeowners through the application via text or chat. Collects documents and answers questions 24/7 without escalating to your team.',
    },
    {
      title: 'Underwriting Agent',
      body: 'Processes applications in real-time. Verifies documents and runs credit decisioning within minutes.',
    },
    {
      title: 'Operations Agent',
      body: 'Monitors the full financing pipeline in real time, flags stalled applications, triggers automatic follow-ups, and surfaces reporting for office managers and owners keeping the process moving without manual oversight.',
    },
  ];

  return (
    <>
      {/* Main Technology Section - Navy background */}
      <section className="py-16 sm:py-24 bg-navy relative overflow-hidden">
        {/* Subtle dot pattern - matches hero */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{ 
            backgroundImage: 'radial-gradient(circle at center, #fff 1px, transparent 1px)',
            backgroundSize: '32px 32px'
          }}
        />
        
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Eyebrow */}
          <motion.div 
            className="text-sm font-semibold uppercase tracking-wider text-teal mb-3 sm:mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
          >
            A Different Approach
          </motion.div>
          
          {/* Headline */}
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white font-display mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Why AI agents, not portals.
          </motion.h2>
          
          {/* Body */}
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-white/80 leading-relaxed mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Existing solutions rely on portal-based workflows that don&apos;t match how technicians operate. 
            Technicians aren&apos;t behind desks, they&apos;re in the field, which is why adoption remains low. 
            SuprFi replaces these workflows with autonomous AI agents that handle borrower communication, 
            underwriting, and follow-up automatically, without requiring anything from the technician in the field.
          </motion.p>
          
          {/* Comparison Grid - Asymmetric layout favoring SuprFi */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 mb-12">
            {/* Portal Side - Smaller, faded */}
            <motion.div 
              className="lg:col-span-2 bg-white/5 rounded-2xl p-5 sm:p-6"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-base sm:text-lg font-semibold text-white/40 font-display mb-4 sm:mb-5">
                Portal-Based Lenders
              </h3>
              <ul className="space-y-2.5 sm:space-y-3">
                {portalFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2.5 text-white/40 text-sm">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            {/* Agent Side - Larger, prominent */}
            <motion.div 
              className="lg:col-span-3 bg-teal/20 rounded-2xl p-5 sm:p-8 border-2 border-teal/40"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-lg sm:text-xl font-semibold text-white font-display mb-4 sm:mb-6 flex items-center gap-2">
                <span className="text-teal">SuprFi:</span> Agent-Powered
              </h3>
              <ul className="space-y-3 sm:space-y-4">
                {agentFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3 text-white text-sm sm:text-base">
                    <svg className="w-5 h-5 mt-0.5 flex-shrink-0 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
          
          {/* Callout Box */}
          <motion.div 
            className="bg-white rounded-2xl p-5 sm:p-8 text-navy transition-all duration-300 hover:shadow-lg"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <p className="text-base sm:text-lg md:text-xl leading-relaxed">
              <span className="font-semibold">Technicians focus on the job, not financing.</span>{' '}
              SuprFi&apos;s agents handle the rest: borrower communication, underwriting, and CRM sync. 
              When it&apos;s effortless, financing gets offered every time.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Under the Hood - Agent Architecture - White background */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Eyebrow */}
          <motion.div 
            className="text-sm font-semibold uppercase tracking-wider text-teal mb-3 sm:mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
          >
            Under The Hood
          </motion.div>
          
          {/* Headline */}
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-navy font-display mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Purpose-built agents for every stage of the financing lifecycle.
          </motion.h2>
          
          {/* Body */}
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-dark-gray leading-relaxed mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            SuprFi&apos;s agent architecture is purpose-built for consumer lending in the field. Each agent 
            has a defined role, operates within SuprFi&apos;s credit policies and compliance requirements, 
            and works autonomously so no single step in the financing process depends on a human to move it forward.
          </motion.p>
          
          {/* Agent Cards - Varied layout: 2 larger on top, 2 smaller below */}
          <div className="space-y-4 sm:space-y-6">
            {/* Primary agents - larger */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {agents.slice(0, 2).map((agent, index) => (
                <motion.div 
                  key={index}
                  className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                >
                  <div className="flex items-center gap-3 mb-3 sm:mb-4">
                    <span className="w-8 h-8 rounded-lg bg-teal/10 flex items-center justify-center text-teal font-bold text-sm">
                      {index + 1}
                    </span>
                    <h3 className="text-lg sm:text-xl font-semibold text-navy font-display">
                      {agent.title}
                    </h3>
                  </div>
                  <p className="text-medium-gray text-sm sm:text-base leading-relaxed">
                    {agent.body}
                  </p>
                </motion.div>
              ))}
            </div>
            
            {/* Supporting agents - smaller, in a row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {agents.slice(2).map((agent, index) => (
                <motion.div 
                  key={index + 2}
                  className="bg-light-gray rounded-xl p-5 sm:p-6 border border-gray-100 transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-y-0.5"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                >
                  <div className="flex items-center gap-2.5 mb-2 sm:mb-3">
                    <span className="w-6 h-6 rounded bg-gray-200 flex items-center justify-center text-medium-gray font-semibold text-xs">
                      {index + 3}
                    </span>
                    <h3 className="text-base sm:text-lg font-semibold text-navy font-display">
                      {agent.title}
                    </h3>
                  </div>
                  <p className="text-medium-gray text-sm leading-relaxed">
                    {agent.body}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default AgenticSection;
