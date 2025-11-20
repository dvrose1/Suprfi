import React from 'react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import Hero from '@/components/marketing/Hero';
import HowItWorks from '@/components/marketing/HowItWorks';
import WhySuprFi from '@/components/marketing/WhySuprFi';
import CtaSection from '@/components/marketing/CtaSection';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <WhySuprFi />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
