// ABOUTME: Hero section for investor-focused pre-launch homepage
// ABOUTME: Navy background with dot pattern and parallax scrolling

'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

const InvestorHero: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? ['0%', '0%'] : ['0%', '30%']);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], prefersReducedMotion ? [1, 1] : [1, 0.3]);
  const contentY = useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? ['0%', '0%'] : ['0%', '20%']);

  const scrollToLearnMore = () => {
    const element = document.getElementById('product-section');
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section ref={sectionRef} className="relative min-h-screen flex items-center bg-navy overflow-hidden">
      {/* Subtle dot pattern - feels intentional, not decorative gradient */}
      <motion.div 
        className="absolute inset-0 opacity-[0.03]"
        style={{ 
          backgroundImage: 'radial-gradient(circle at center, #fff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
          y: backgroundY,
        }}
      />
      
      <motion.div 
        className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32"
        style={{ opacity: contentOpacity, y: contentY }}
      >
        <div className="max-w-4xl">
          {/* Headline - fluid sizing with tight tracking for display */}
          <motion.h1 
            className="text-white mb-6 font-display tracking-display" 
            style={{ 
              fontSize: 'clamp(2.25rem, 6vw, 4.5rem)',
              lineHeight: 'var(--leading-tight)',
              fontVariantLigatures: 'none',
            }}
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut' }}
          >
            Home repairs don&apos;t wait. Financing shouldn&apos;t either.
          </motion.h1>
          
          {/* Subheadline - prose-lg for optimal reading */}
          <motion.p 
            className="prose-lg text-white/80 mb-10 max-w-3xl"
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut', delay: prefersReducedMotion ? 0 : 0.15 }}
          >
            SuprFi delivers real-time financing at the point of need, embedded into the tools your 
            team already uses. Powered by agentic workflows, SuprFi automates the financing process 
            on both sides of the transaction so technicians can focus on the job while homeowners 
            get approved in seconds. For contractors, that means more closed jobs. For investors, 
            it&apos;s the embedded financing layer for a fragmented $700B market.
          </motion.p>
          
          {/* CTAs */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-3 sm:gap-4"
            initial={prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.6, ease: 'easeOut', delay: prefersReducedMotion ? 0 : 0.3 }}
          >
            <a 
              href="#early-access"
              className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 min-h-[48px] rounded-xl bg-teal text-white font-semibold text-base sm:text-lg transition-all duration-200 hover:bg-teal/90 hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:shadow-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2 focus:ring-offset-navy"
            >
              Get Early Access
              <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </a>
            <button 
              onClick={scrollToLearnMore}
              className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3.5 sm:py-4 min-h-[48px] rounded-xl border-2 border-white/30 text-white font-semibold text-base sm:text-lg transition-all duration-200 hover:bg-white/10 hover:border-white/50 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              Learn More
              <svg className="w-4 h-4 sm:w-5 sm:h-5 transition-transform duration-200 group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
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
