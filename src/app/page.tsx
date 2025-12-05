import React from 'react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import Hero from '@/components/marketing/Hero';
import TrustBar from '@/components/marketing/TrustBar';
import HowItWorks from '@/components/marketing/HowItWorks';
import ServicesGrid from '@/components/marketing/ServicesGrid';
import Testimonials from '@/components/marketing/Testimonials';
import CtaSection from '@/components/marketing/CtaSection';

function ComingSoon() {
  return (
    <div className="min-h-screen bg-warm-white flex flex-col items-center justify-center px-4 sm:px-6 relative overflow-hidden">
      <div 
        className="absolute inset-0 opacity-5"
        style={{ 
          background: 'radial-gradient(ellipse at top right, #2A9D8F 0%, transparent 50%), radial-gradient(ellipse at bottom left, #6EC6A7 0%, transparent 50%)' 
        }}
      />
      
      <div className="relative text-center max-w-2xl">
        <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6 sm:mb-8">
          <svg viewBox="0 0 40 40" className="w-10 h-10 sm:w-12 sm:h-12">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0F2D4A" />
                <stop offset="50%" stopColor="#2A9D8F" />
                <stop offset="100%" stopColor="#6EC6A7" />
              </linearGradient>
            </defs>
            <path d="M20 4L4 16V36H16V24H24V36H36V16L20 4Z" fill="url(#logoGradient)" />
            <path d="M14 18L18 22L26 14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <span className="text-2xl sm:text-3xl font-bold font-display text-navy">
            Supr<span className="text-teal">Fi</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-navy font-display mb-8 sm:mb-12 px-2">
          Financing that works just as fast as you do.
        </h1>

        <div className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-full bg-gradient-primary text-white font-semibold text-sm sm:text-base">
          <span>Coming Soon</span>
        </div>
      </div>
    </div>
  );
}

function MarketingHome() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustBar />
        <HowItWorks />
        <ServicesGrid />
        <Testimonials />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}

export default function Home() {
  const isComingSoon = process.env.NEXT_PUBLIC_COMING_SOON === 'true';
  
  if (isComingSoon) {
    return <ComingSoon />;
  }
  
  return <MarketingHome />;
}
