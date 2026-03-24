// ABOUTME: Homepage for SuprFi - investor-focused pre-launch landing page
// ABOUTME: Showcases product thesis and technical differentiation

import React from 'react';
import InvestorHeader from '@/components/marketing/InvestorHeader';
import InvestorHero from '@/components/marketing/InvestorHero';
import ProductSection from '@/components/marketing/ProductSection';
import AgenticSection from '@/components/marketing/AgenticSection';
import EarlyAccessSection from '@/components/marketing/EarlyAccessSection';
import InvestorFooter from '@/components/marketing/InvestorFooter';
import { ChatProvider } from '@/components/marketing/ChatProvider';

export default function Home() {
  return (
    <ChatProvider>
      <InvestorHeader />
      <main>
        <InvestorHero />
        <ProductSection />
        <AgenticSection />
        <EarlyAccessSection />
      </main>
      <InvestorFooter />
    </ChatProvider>
  );
}
