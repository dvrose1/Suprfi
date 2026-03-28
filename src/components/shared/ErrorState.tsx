// ABOUTME: Empathetic error states that soften frustrating moments
// ABOUTME: Professional warmth without being dismissive of user problems

'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { springs } from '@/lib/animations';

type ErrorVariant = 
  | 'default'
  | 'not-found'
  | 'network'
  | 'permission'
  | 'expired'
  | 'validation'
  | 'server';

interface ErrorStateProps {
  variant?: ErrorVariant;
  title?: string;
  message?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  showSupport?: boolean;
  compact?: boolean;
}

// Empathetic, professional error messages
const errorContent: Record<ErrorVariant, { title: string; message: string; icon: React.ReactNode }> = {
  default: {
    title: 'Something went wrong',
    message: "We hit an unexpected issue. This is on us, not you. Please try again, or contact support if it keeps happening.",
    icon: <AlertCircleIcon />,
  },
  'not-found': {
    title: "Page not found",
    message: "The page you're looking for doesn't exist or may have been moved. Let's get you back on track.",
    icon: <SearchIcon />,
  },
  network: {
    title: 'Connection issue',
    message: "We're having trouble reaching our servers. Check your internet connection and try again.",
    icon: <WifiOffIcon />,
  },
  permission: {
    title: 'Access restricted',
    message: "You don't have permission to view this page. If you think this is an error, contact your administrator.",
    icon: <LockIcon />,
  },
  expired: {
    title: 'Link expired',
    message: 'This link is no longer valid. Request a new one to continue.',
    icon: <ClockIcon />,
  },
  validation: {
    title: 'Invalid information',
    message: 'Some of the information provided needs to be corrected. Please review and try again.',
    icon: <AlertTriangleIcon />,
  },
  server: {
    title: 'Server error',
    message: "Our servers are temporarily unavailable. We're working on it. Please try again in a few minutes.",
    icon: <ServerIcon />,
  },
};

export function ErrorState({
  variant = 'default',
  title,
  message,
  action,
  secondaryAction,
  showSupport = true,
  compact = false,
}: ErrorStateProps) {
  const prefersReducedMotion = useReducedMotion();
  const content = errorContent[variant];
  const displayTitle = title || content.title;
  const displayMessage = message || content.message;

  return (
    <motion.div
      className={`text-center ${compact ? 'py-8' : 'py-12 px-4'}`}
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Icon with subtle animation */}
      <motion.div
        className="mx-auto mb-4"
        initial={prefersReducedMotion ? {} : { scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={springs.bouncy}
      >
        <div className={`inline-flex items-center justify-center ${compact ? 'w-12 h-12' : 'w-16 h-16'} rounded-full bg-error/10 text-error`}>
          {content.icon}
        </div>
      </motion.div>

      {/* Title */}
      <h2 className={`font-semibold text-navy font-display ${compact ? 'text-lg mb-2' : 'text-xl mb-3'}`}>
        {displayTitle}
      </h2>

      {/* Message */}
      <p className={`text-medium-gray max-w-md mx-auto leading-relaxed ${compact ? 'text-sm mb-4' : 'text-base mb-6'}`}>
        {displayMessage}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center justify-center gap-3 mb-6">
          {action && (
            action.href ? (
              <Link
                href={action.href}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal text-white rounded-xl font-medium hover:bg-teal/90 transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
              >
                {action.label}
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal text-white rounded-xl font-medium hover:bg-teal/90 transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
              >
                {action.label}
              </button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Link
                href={secondaryAction.href}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-navy border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                {secondaryAction.label}
              </Link>
            ) : (
              <button
                onClick={secondaryAction.onClick}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-navy border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                {secondaryAction.label}
              </button>
            )
          )}
        </div>
      )}

      {/* Support link */}
      {showSupport && (
        <p className="text-sm text-medium-gray">
          Need help?{' '}
          <a href="mailto:support@suprfi.com" className="text-teal hover:underline">
            Contact support
          </a>
        </p>
      )}
    </motion.div>
  );
}

// Full-page error wrapper
interface ErrorPageProps extends ErrorStateProps {
  showHeader?: boolean;
}

export function ErrorPage({ showHeader = true, ...props }: ErrorPageProps) {
  return (
    <div className="min-h-screen bg-light-gray flex flex-col">
      {showHeader && (
        <header className="bg-white border-b border-gray-100 py-4 px-6">
          <Link href="/" className="inline-block">
            <img src="/logos/wordmark navy and mint.svg" alt="SuprFi" className="h-8" />
          </Link>
        </header>
      )}
      <div className="flex-1 flex items-center justify-center">
        <ErrorState {...props} />
      </div>
    </div>
  );
}

// Icon components
function AlertCircleIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function WifiOffIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function AlertTriangleIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}

function ServerIcon() {
  return (
    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
    </svg>
  );
}
