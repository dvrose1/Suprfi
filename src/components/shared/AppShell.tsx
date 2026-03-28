// ABOUTME: Shared app shell layout with header and content area
// ABOUTME: Provides consistent structure across all SuprFi products

'use client';

import React from 'react';
import AppHeader from './AppHeader';

interface AppShellProps {
  children: React.ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
  headerRight?: React.ReactNode;
  showLogo?: boolean;
  backHref?: string;
  backLabel?: string;
  contentClassName?: string;
  fullWidth?: boolean;
}

export default function AppShell({
  children,
  headerTitle,
  headerSubtitle,
  headerRight,
  showLogo = true,
  backHref,
  backLabel,
  contentClassName = '',
  fullWidth = false,
}: AppShellProps) {
  return (
    <div className="min-h-screen bg-light-gray">
      <AppHeader
        title={headerTitle}
        subtitle={headerSubtitle}
        showLogo={showLogo}
        rightContent={headerRight}
        backHref={backHref}
        backLabel={backLabel}
      />
      
      <main className={fullWidth ? '' : 'max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8'}>
        <div className={contentClassName}>
          {children}
        </div>
      </main>
    </div>
  );
}
