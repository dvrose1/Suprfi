// ABOUTME: Minimal footer for investor homepage with legal disclaimer
// ABOUTME: Dark background with logo, email, and compliance text

'use client';

import React from 'react';
import Link from 'next/link';

const InvestorFooter: React.FC = () => {
  return (
    <footer className="py-12 bg-dark-gray">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top row */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <img
              src="/logos/suprfi-logo-white.svg"
              alt="SuprFi"
              className="h-6 w-auto"
            />
          </Link>
          
          {/* Contact */}
          <a 
            href="mailto:hello@suprfi.com"
            className="text-white/60 hover:text-white transition-colors"
          >
            hello@suprfi.com
          </a>
        </div>
        
        {/* Divider */}
        <div className="border-t border-white/10 pt-8">
          {/* Copyright */}
          <p className="text-white/40 text-sm mb-4">
            © {new Date().getFullYear()} SuprFi. All rights reserved.
          </p>
          
          {/* Legal disclaimer */}
          <p className="text-white/30 text-xs leading-relaxed max-w-4xl">
            SuprFi is a DBA of Home Services Financing Solutions Corporation. Loans subject to credit approval. Terms, rates, and 
            availability vary by state and are not guaranteed. This website is for informational 
            purposes only and does not constitute an offer or solicitation to lend. SuprFi is 
            not currently originating loans in all states.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default InvestorFooter;
