// ABOUTME: Shared app header with dark navy background
// ABOUTME: Used across borrower, client, and admin portals for brand consistency

'use client';

import React from 'react';
import Link from 'next/link';

interface AppHeaderProps {
  title?: string;
  subtitle?: string;
  showLogo?: boolean;
  rightContent?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}

export default function AppHeader({
  title,
  subtitle,
  showLogo = true,
  rightContent,
  backHref,
  backLabel = 'Back',
}: AppHeaderProps) {
  return (
    <header className="bg-navy">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {backHref && (
              <Link
                href={backHref}
                className="flex items-center gap-1 text-white/60 hover:text-white text-sm transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                {backLabel}
              </Link>
            )}
            
            {showLogo && (
              <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
                <img
                  src="/logos/wordmark white and mint.svg"
                  alt="SuprFi"
                  className="h-7 w-auto"
                />
              </Link>
            )}
            
            {title && (
              <div className={showLogo ? 'ml-4 pl-4 border-l border-white/20' : ''}>
                <h1 className="text-white font-semibold">{title}</h1>
                {subtitle && (
                  <p className="text-white/60 text-sm">{subtitle}</p>
                )}
              </div>
            )}
          </div>

          {/* Right side */}
          {rightContent && (
            <div className="flex items-center gap-3">
              {rightContent}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
