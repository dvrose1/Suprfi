// ABOUTME: Market opportunity section with stats about home services industry
// ABOUTME: Displays $650B market size and contractor close rate data

'use client';

import React, { useEffect, useRef, useState } from 'react';

interface StatCardProps {
  number: string;
  label: string;
  subtext: string;
  delay: number;
}

const StatCard: React.FC<StatCardProps> = ({ number, label, subtext, delay }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
        }
      },
      { threshold: 0.2 }
    );

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => observer.disconnect();
  }, [delay]);

  return (
    <div 
      ref={cardRef}
      className={`bg-white rounded-2xl p-6 shadow-lg border border-gray-100 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <div className="text-4xl md:text-5xl font-bold text-teal font-mono mb-2">
        {number}
      </div>
      <div className="text-lg font-semibold text-navy font-display mb-1">
        {label}
      </div>
      <div className="text-sm text-medium-gray">
        {subtext}
      </div>
    </div>
  );
};

const MarketSection: React.FC = () => {
  return (
    <section id="market-section" className="py-24 bg-warm-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Eyebrow */}
        <div className="text-sm font-semibold uppercase tracking-wider text-teal mb-4">
          The Opportunity
        </div>
        
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy font-display mb-6 max-w-3xl">
          A $650 billion market with a broken financing layer.
        </h2>
        
        {/* Body */}
        <p className="text-lg md:text-xl text-dark-gray leading-relaxed mb-12 max-w-3xl">
          Home services (HVAC, plumbing, roofing, electrical, remodeling) is one of the largest 
          consumer spend categories in the US. Most jobs are unplanned, expensive, and urgent. 
          Homeowners rarely have the cash on hand. Contractors who offer financing close significantly 
          more jobs. But the majority don&apos;t offer it consistently, because the tools don&apos;t fit how they work.
        </p>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            number="$650B+"
            label="US home services market"
            subtext="Annual consumer spend"
            delay={0}
          />
          <StatCard 
            number="38%"
            label="Contractor close rate"
            subtext="Without financing offered"
            delay={100}
          />
          <StatCard 
            number="49%"
            label="Close rate with financing"
            subtext="+11 points, same contractors"
            delay={200}
          />
          <StatCard 
            number="63%"
            label="Only sometimes mention it"
            subtext="Current tools don't fit fieldwork"
            delay={300}
          />
        </div>
      </div>
    </section>
  );
};

export default MarketSection;
