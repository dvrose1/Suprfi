// ABOUTME: Branded loading spinner with context-aware messages
// ABOUTME: Rotating product-specific messages for delight during waits

'use client';

import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

type LoadingContext = 
  | 'default'
  | 'application'
  | 'offers'
  | 'dashboard'
  | 'verification'
  | 'payment'
  | 'documents';

interface LoadingSpinnerProps {
  message?: string;
  fullPage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  context?: LoadingContext;
  showRotatingMessages?: boolean;
}

// Product-specific loading messages (not generic AI slop)
const contextMessages: Record<LoadingContext, string[]> = {
  default: [
    'Loading...',
  ],
  application: [
    'Reviewing your information...',
    'Checking available options...',
    'Preparing your application...',
  ],
  offers: [
    'Finding the best rates for you...',
    'Calculating payment options...',
    'Preparing personalized offers...',
  ],
  dashboard: [
    'Loading your dashboard...',
    'Fetching latest activity...',
    'Syncing your data...',
  ],
  verification: [
    'Verifying your identity...',
    'Confirming your details...',
    'Almost there...',
  ],
  payment: [
    'Processing payment details...',
    'Securing your transaction...',
    'Confirming payment info...',
  ],
  documents: [
    'Preparing your documents...',
    'Generating agreement...',
    'Finalizing paperwork...',
  ],
};

export function LoadingSpinner({ 
  message,
  fullPage = false,
  size = 'md',
  context = 'default',
  showRotatingMessages = false,
}: LoadingSpinnerProps) {
  const prefersReducedMotion = useReducedMotion();
  const [messageIndex, setMessageIndex] = useState(0);
  const messages = contextMessages[context];

  useEffect(() => {
    if (!showRotatingMessages || messages.length <= 1) return;

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % messages.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [showRotatingMessages, messages.length]);

  const displayMessage = message || messages[messageIndex];

  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const spinner = (
    <div className="text-center">
      {/* Animated logo-style spinner */}
      <div className="relative mx-auto mb-4" style={{ width: size === 'sm' ? 20 : size === 'lg' ? 48 : 32, height: size === 'sm' ? 20 : size === 'lg' ? 48 : 32 }}>
        {/* Outer ring */}
        <motion.div
          className={`absolute inset-0 rounded-full border-2 border-teal/20`}
          animate={prefersReducedMotion ? {} : { rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        />
        {/* Inner spinning arc */}
        <motion.div
          className={`absolute inset-0 rounded-full border-2 border-transparent border-t-teal border-r-teal`}
          animate={prefersReducedMotion ? {} : { rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        {/* Center dot */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-teal"
          animate={prefersReducedMotion ? {} : { scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>
      
      {/* Message with fade transition */}
      <motion.p
        key={displayMessage}
        className="text-medium-gray text-sm"
        initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        role="status"
        aria-live="polite"
      >
        {displayMessage}
      </motion.p>
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
}

// Skeleton loader for content placeholders
interface SkeletonProps {
  className?: string;
  animate?: boolean;
}

export function Skeleton({ className = '', animate = true }: SkeletonProps) {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <div 
      className={`bg-gray-200 rounded ${animate && !prefersReducedMotion ? 'animate-pulse' : ''} ${className}`}
      aria-hidden="true"
    />
  );
}

// Skeleton card for dashboard loading states
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-32 mb-2" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
