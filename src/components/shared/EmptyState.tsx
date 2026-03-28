// ABOUTME: Reusable empty state component for consistent "no data" displays
// ABOUTME: Supports SVG icons or React nodes, titles, descriptions, and optional action buttons

import React from 'react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  compact?: boolean;
  align?: 'center' | 'left';
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  compact = false,
  align = 'center'
}: EmptyStateProps) {
  const alignClasses = align === 'left' ? 'text-left' : 'text-center';
  const descriptionAlign = align === 'left' ? '' : 'mx-auto';
  
  return (
    <div className={`${alignClasses} ${compact ? 'py-6' : 'py-12'}`}>
      {icon && (
        <div className={`${compact ? 'mb-3' : 'mb-4'} ${align === 'left' ? '' : 'flex justify-center'}`} aria-hidden="true">
          <div className={`inline-flex items-center justify-center ${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-full bg-navy/5 text-navy/40`}>
            {icon}
          </div>
        </div>
      )}
      <h3 className={`font-semibold text-navy ${compact ? 'text-lg mb-1' : 'text-xl mb-2'}`}>
        {title}
      </h3>
      {description && (
        <p className={`text-navy/60 ${compact ? 'text-sm' : 'text-base'} max-w-md ${descriptionAlign}`}>
          {description}
        </p>
      )}
      {action && (
        <div className={compact ? 'mt-3' : 'mt-5'}>
          <Link
            href={action.href}
            className="inline-block px-4 py-2 bg-teal text-white rounded-xl font-medium hover:bg-teal/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
          >
            {action.label}
          </Link>
        </div>
      )}
    </div>
  );
}
