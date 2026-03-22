// ABOUTME: Homepage for SuprFi - investor-focused pre-launch landing page
// ABOUTME: Showcases market opportunity, product thesis, and technical differentiation

// ABOUTME: Homepage for SuprFi - investor-focused pre-launch landing page
// ABOUTME: Showcases market opportunity, product thesis, and technical differentiation

import React from 'react';
import InvestorHeader from '@/components/marketing/InvestorHeader';
import InvestorHero from '@/components/marketing/InvestorHero';
import MarketSection from '@/components/marketing/MarketSection';
import ProductSection from '@/components/marketing/ProductSection';
import AgenticSection from '@/components/marketing/AgenticSection';
import AgentArchitecture from '@/components/marketing/AgentArchitecture';
import MerchantPortalSection from '@/components/marketing/MerchantPortalSection';
import IntegrationsSection from '@/components/marketing/IntegrationsSection';
import VerticalsSection from '@/components/marketing/VerticalsSection';
import EarlyAccessSection from '@/components/marketing/EarlyAccessSection';
import InvestorFooter from '@/components/marketing/InvestorFooter';
import { ChatProvider } from '@/components/marketing/ChatProvider';
import ChatTeaserWrapper from '@/components/marketing/ChatTeaserWrapper';

export default function Home() {
  return (
    <ChatProvider>
      <InvestorHeader />
      <main>
        <InvestorHero />
        <MarketSection />
        <ProductSection />
        <AgenticSection />
        <AgentArchitecture />
        <MerchantPortalSection />
        <ChatTeaserWrapper />
        <IntegrationsSection />
        <VerticalsSection />
        <EarlyAccessSection />
      </main>
      <InvestorFooter />
    </ChatProvider>
  );
}
