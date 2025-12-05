import React from 'react';
import Link from 'next/link';

const CtaSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 relative overflow-hidden bg-gradient-primary">
      <div className="max-w-4xl mx-auto text-center relative">
        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 font-display">
          Ready to get started?
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-white/80 mb-6 sm:mb-8">
          Check your rate in 60 seconds. No commitment, no credit impact.
        </p>
        <Link 
          href="/apply"
          className="inline-block px-6 sm:px-10 py-3 sm:py-5 bg-white rounded-xl font-semibold text-base sm:text-lg transition-all hover:scale-105 shadow-xl text-navy"
        >
          Check Your Rate Now
        </Link>
      </div>
    </section>
  );
};

export default CtaSection;
