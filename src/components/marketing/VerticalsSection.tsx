// ABOUTME: Verticals section showing supported home service categories
// ABOUTME: Displays HVAC, Plumbing, Roofing, etc. with badges

'use client';

import React from 'react';

const VerticalsSection: React.FC = () => {
  const verticals = [
    'HVAC',
    'Plumbing',
    'Roofing',
    'Electrical',
    'Remodeling',
    'General Contracting',
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow */}
        <div className="text-sm font-semibold uppercase tracking-wider text-teal mb-4">
          Market Focus
        </div>
        
        {/* Headline */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-navy font-display mb-8">
          Every trade. Every job under $25K.
        </h2>
        
        {/* Vertical Badges */}
        <div className="flex flex-wrap justify-center gap-4 mb-10">
          {verticals.map((vertical, index) => (
            <div 
              key={index}
              className="px-6 py-3 rounded-full bg-teal/10 text-teal font-semibold"
            >
              {vertical}
            </div>
          ))}
        </div>
        
        {/* Body */}
        <p className="text-lg md:text-xl text-dark-gray leading-relaxed max-w-2xl mx-auto">
          From a $1,200 water heater replacement to a $22,000 kitchen remodel. If a homeowner 
          needs it and a contractor quotes it, SuprFi can finance it.
        </p>
      </div>
    </section>
  );
};

export default VerticalsSection;
