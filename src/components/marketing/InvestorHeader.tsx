// ABOUTME: Minimal sticky header for investor homepage
// ABOUTME: Transparent on hero, solid navy on scroll

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useChat } from './ChatProvider';

const InvestorHeader: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const { openChat } = useChat();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled ? 'bg-navy shadow-lg' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img
              src="/logos/suprfi-logo-white.svg"
              alt="SuprFi"
              className="h-8 w-auto"
            />
          </Link>

          {/* CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={openChat}
              className="hidden sm:flex px-4 py-2.5 min-h-[44px] items-center rounded-lg border border-white/30 text-white text-sm font-medium transition-all hover:bg-white/10"
            >
              Have questions?
            </button>
            <a
              href="#early-access"
              className="px-4 sm:px-5 py-2.5 min-h-[44px] flex items-center rounded-lg bg-white text-navy text-sm font-semibold transition-all hover:bg-white/90 whitespace-nowrap"
            >
              Get Early Access
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default InvestorHeader;
