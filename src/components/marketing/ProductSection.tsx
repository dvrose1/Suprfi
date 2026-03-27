// ABOUTME: Product overview section showing the lending workflow
// ABOUTME: Includes before/during/after cards plus merchant portal and integrations

'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';

interface WorkflowStepProps {
  step: number;
  title: string;
  body: string;
  index: number;
}

const WorkflowStep: React.FC<WorkflowStepProps> = ({ step, title, body, index }) => {
  const isLast = step === 3;
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div 
      className="relative flex gap-4 sm:gap-6"
      initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: 'easeOut', delay: prefersReducedMotion ? 0 : index * 0.1 }}
    >
      {/* Number and line column */}
      <div className="flex flex-col items-center">
        <span className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-navy text-white flex items-center justify-center font-bold text-sm sm:text-base font-display">
          {step}
        </span>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gray-200 mt-3" />
        )}
      </div>
      
      {/* Content */}
      <div className={`flex-1 ${!isLast ? 'pb-8 sm:pb-10' : ''}`}>
        <h3 className="text-lg sm:text-xl font-semibold text-navy font-display mb-1.5 sm:mb-2">
          {title}
        </h3>
        <p className="text-medium-gray leading-relaxed text-sm sm:text-base">
          {body}
        </p>
      </div>
    </motion.div>
  );
};

const ProductSection: React.FC = () => {
  const workflowSteps = [
    {
      title: 'Before the visit',
      body: 'The homeowner books a service call. SuprFi can pre-qualify them before the technician arrives, so they know their budget before they see the quote.',
    },
    {
      title: 'During the visit',
      body: 'The technician quotes the job. SuprFi generates personalized monthly payment options the homeowner can review on their phone, right there on-site.',
    },
    {
      title: 'After the visit',
      body: 'The homeowner needs to think about it. SuprFi follows up with financing options specific to the job that was quoted, closing the loop that usually stays open.',
    },
  ];

  return (
    <>
      {/* The Opportunity Section */}
      <section id="product-section" className="py-16 sm:py-24 bg-warm-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Eyebrow */}
          <motion.div 
            className="text-sm font-semibold uppercase tracking-wider text-teal mb-3 sm:mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
          >
            The Opportunity
          </motion.div>
          
          {/* Headline */}
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-navy font-display mb-4 sm:mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Contractors want to offer financing. Existing tools make it too hard.
          </motion.h2>
          
          {/* Body */}
          <motion.p 
            className="text-base sm:text-lg md:text-xl text-dark-gray leading-relaxed mb-6 sm:mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Home services is one of the largest consumer spend categories in the US, yet most jobs 
            are unplanned, urgent, and expensive. Financing consistently helps contractors close more 
            jobs, but most never offer it because existing tools weren&apos;t built for how they work.
          </motion.p>

          {/* Stats - Horizontal on larger screens */}
          <div className="flex flex-wrap gap-x-8 sm:gap-x-12 gap-y-4 mb-8">
            {[
              { value: '$700B', label: 'US home services TAM*' },
              { value: '38%', label: 'Close rate without financing**' },
              { value: '49%', label: 'Close rate with financing**' },
              { value: '63%', label: "Don't consistently offer it**" },
            ].map((stat, index) => (
              <motion.div 
                key={index}
                className="min-w-[140px]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: 0.3 + index * 0.08 }}
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-navy font-mono">{stat.value}</div>
                <div className="text-xs sm:text-sm text-medium-gray mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Sources */}
          <motion.div 
            className="text-xs text-medium-gray space-y-1"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <p>* McKinsey, The investment opportunity in the home services market</p>
            <p>** ACCA & Farmington Consulting Group, Contractor of the Future Survey (2026)</p>
          </motion.div>
        </div>
      </section>

      {/* The Platform Section */}
      <section className="py-16 sm:py-24 bg-light-gray">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Eyebrow */}
        <motion.div 
          className="text-sm font-semibold uppercase tracking-wider text-teal mb-3 sm:mb-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5 }}
        >
          The Platform
        </motion.div>
        
        {/* Headline */}
        <motion.h2 
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-navy font-display mb-4 sm:mb-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          End-to-end financing infrastructure, built for the field.
        </motion.h2>
        
        {/* Body */}
        <motion.p 
          className="text-base sm:text-lg md:text-xl text-dark-gray leading-relaxed mb-8 sm:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          SuprFi integrates directly into the tools contractors already use, making financing 
          available at every stage of the job without adding steps, logins, or manual entry. 
          From first homeowner touchpoint to funding confirmation, SuprFi handles the full 
          financing lifecycle.
        </motion.p>
        
        {/* Workflow Steps - Timeline layout */}
        <div className="max-w-2xl mb-10 sm:mb-16">
          {workflowSteps.map((step, index) => (
            <WorkflowStep 
              key={index} 
              step={index + 1}
              index={index} 
              title={step.title}
              body={step.body}
            />
          ))}
        </div>

        {/* Merchant Portal + Integrations row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {/* Merchant Portal */}
          <motion.div 
            className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5 }}
          >
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
          </motion.div>

          {/* Integrations */}
          <motion.div 
            className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
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
          </motion.div>
        </div>
      </div>
    </section>
    </>
  );
};

export default ProductSection;
