import React from 'react';
import Link from 'next/link';

const CtaSection: React.FC = () => {
  return (
    <section className="py-20 px-6 relative overflow-hidden bg-gradient-primary">
      <div className="max-w-4xl mx-auto text-center relative">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 font-display">
          Ready to get started?
        </h2>
        <p className="text-xl text-white/80 mb-8">
          Check your rate in 60 seconds. No commitment, no credit impact.
        </p>
        <Link 
          href="/apply"
          className="inline-block px-10 py-5 bg-white rounded-xl font-semibold text-lg transition-all hover:scale-105 shadow-xl text-navy"
        >
          Check Your Rate Now
        </Link>
      </div>
    </section>
  );
};

export default CtaSection;
