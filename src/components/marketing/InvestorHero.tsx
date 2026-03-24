// ABOUTME: Hero section for investor-focused pre-launch homepage
// ABOUTME: Dark gradient background with headline about lending infrastructure

'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const InvestorHero: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.3]);
  const contentY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  const scrollToLearnMore = () => {
    const element = document.getElementById('product-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center bg-gradient-primary overflow-hidden">
      {/* Subtle background pattern with parallax */}
      <motion.div 
        className="absolute inset-0 opacity-10"
        style={{ 
          backgroundImage: 'radial-gradient(circle at 25% 25%, #2A9D8F 0%, transparent 50%), radial-gradient(circle at 75% 75%, #6EC6A7 0%, transparent 50%)',
          y: backgroundY,
        }}
      />
      
      <motion.div 
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <div className="max-w-4xl">
          {/* Headline */}
          <motion.h1 
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6 font-display" 
            style={{ fontVariantLigatures: 'none' }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            Home repairs don&apos;t wait. Financing shouldn&apos;t either.
          </motion.h1>
          
          {/* Subheadline */}
          <motion.p 
            className="text-lg sm:text-xl md:text-2xl text-white/80 leading-relaxed mb-10 max-w-4xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.15 }}
          >
            SuprFi delivers real-time financing at the point of need, embedded into the tools your 
            team already uses. Powered by agentic workflows, SuprFi automates the financing process 
            on both sides of the transaction so technicians can focus on the job while homeowners 
            get approved in seconds. For contractors, that means more closed jobs. For investors, 
            it&apos;s the embedded financing layer for a fragmented $800B+ market.
          </motion.p>
          
          {/* CTAs */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.3 }}
          >
            <a 
              href="#early-access"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-navy font-semibold text-lg transition-all hover:bg-white/90 hover:scale-[1.02] shadow-lg"
            >
              Get Early Access
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <button 
              onClick={scrollToLearnMore}
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-white/30 text-white font-semibold text-lg transition-all hover:bg-white/10"
            >
              Learn More
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};

export default InvestorHero;
