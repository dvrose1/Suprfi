// ABOUTME: Delightful empty state component with warm copy and animations
// ABOUTME: Encouraging messages that feel personal, not generic

'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { springs } from '@/lib/animations';

type EmptyStateVariant = 
  | 'default'
  | 'first-time'
  | 'search'
  | 'success'
  | 'filtered';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
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
  compact?: boolean;
  align?: 'center' | 'left';
  variant?: EmptyStateVariant;
  animate?: boolean;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  secondaryAction,
  compact = false,
  align = 'center',
  variant = 'default',
  animate = true,
}: EmptyStateProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animate && !prefersReducedMotion;
  
  const alignClasses = align === 'left' ? 'text-left' : 'text-center';
  const descriptionAlign = align === 'left' ? '' : 'mx-auto';
  
  // Variant-specific background colors
  const variantBgClasses = {
    default: 'bg-navy/5',
    'first-time': 'bg-teal/10',
    search: 'bg-gray-100',
    success: 'bg-mint/10',
    filtered: 'bg-cyan/10',
  };
  
  const variantIconColors = {
    default: 'text-navy/40',
    'first-time': 'text-teal',
    search: 'text-gray-400',
    success: 'text-mint',
    filtered: 'text-cyan',
  };

  const Wrapper = shouldAnimate ? motion.div : 'div';
  const wrapperProps = shouldAnimate ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  } : {};
  
  return (
    <Wrapper 
      className={`${alignClasses} ${compact ? 'py-6' : 'py-12'}`}
      {...wrapperProps}
    >
      {icon && (
        <motion.div 
          className={`${compact ? 'mb-3' : 'mb-4'} ${align === 'left' ? '' : 'flex justify-center'}`} 
          aria-hidden="true"
          initial={shouldAnimate ? { scale: 0.8, opacity: 0 } : undefined}
          animate={shouldAnimate ? { scale: 1, opacity: 1 } : undefined}
          transition={shouldAnimate ? springs.bouncy : undefined}
        >
          <div className={`inline-flex items-center justify-center ${compact ? 'w-10 h-10' : 'w-14 h-14'} rounded-full ${variantBgClasses[variant]} ${variantIconColors[variant]}`}>
            {icon}
          </div>
        </motion.div>
      )}
      <h3 className={`font-semibold text-navy ${compact ? 'text-lg mb-1' : 'text-xl mb-2'}`}>
        {title}
      </h3>
      {description && (
        <p className={`text-navy/60 ${compact ? 'text-sm' : 'text-base'} max-w-md leading-relaxed ${descriptionAlign}`}>
          {description}
        </p>
      )}
      {(action || secondaryAction) && (
        <div className={`flex items-center gap-3 ${align === 'left' ? '' : 'justify-center'} ${compact ? 'mt-3' : 'mt-5'}`}>
          {action && (
            action.href ? (
              <Link
                href={action.href}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal text-white rounded-xl font-medium hover:bg-teal/90 transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
              >
                {action.label}
              </Link>
            ) : (
              <button
                onClick={action.onClick}
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal text-white rounded-xl font-medium hover:bg-teal/90 transition-all hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
              >
                {action.label}
              </button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Link
                href={secondaryAction.href}
                className="inline-flex items-center gap-2 px-4 py-2 text-navy/70 hover:text-navy transition-colors"
              >
                {secondaryAction.label}
              </Link>
            ) : (
              <button
                onClick={secondaryAction.onClick}
                className="inline-flex items-center gap-2 px-4 py-2 text-navy/70 hover:text-navy transition-colors"
              >
                {secondaryAction.label}
              </button>
            )
          )}
        </div>
      )}
    </Wrapper>
  );
}

// Pre-configured empty states with warm, encouraging copy
export const emptyStatePresets = {
  noApplications: {
    title: 'Ready to get started?',
    description: 'Send your first financing link to a customer and watch it appear here.',
    variant: 'first-time' as const,
  },
  noLoans: {
    title: 'No loans yet',
    description: 'When customers accept their financing offers, funded loans will show up here.',
    variant: 'default' as const,
  },
  noSearchResults: {
    title: 'No matches found',
    description: 'Try adjusting your search or clearing filters to see more results.',
    variant: 'search' as const,
  },
  noActivity: {
    title: 'All caught up',
    description: 'No new activity to show. Check back later for updates.',
    variant: 'success' as const,
  },
  emptyInbox: {
    title: 'Inbox zero!',
    description: 'You\'re all caught up. Nice work.',
    variant: 'success' as const,
  },
  noTeamMembers: {
    title: 'Build your team',
    description: 'Invite colleagues to collaborate on financing applications.',
    variant: 'first-time' as const,
  },
};
