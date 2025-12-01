import React from 'react';
import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';
import Hero from '@/components/marketing/Hero';
import TrustBar from '@/components/marketing/TrustBar';
import HowItWorks from '@/components/marketing/HowItWorks';
import ServicesGrid from '@/components/marketing/ServicesGrid';
import Testimonials from '@/components/marketing/Testimonials';
import CtaSection from '@/components/marketing/CtaSection';

export default function Home() {
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
