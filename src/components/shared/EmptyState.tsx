// ABOUTME: Reusable empty state component for consistent "no data" displays
// ABOUTME: Supports icons, titles, descriptions, and optional action buttons

import Link from 'next/link';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    href: string;
  };
  compact?: boolean;
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action,
  compact = false 
}: EmptyStateProps) {
  return (
    <div className={`text-center ${compact ? 'py-6' : 'py-12'}`}>
      {icon && (
        <div className={`${compact ? 'text-4xl mb-3' : 'text-5xl mb-4'}`} aria-hidden="true">
          {icon}
        </div>
      )}
      <h3 className={`font-semibold text-navy ${compact ? 'text-lg mb-1' : 'text-xl mb-2'}`}>
        {title}
      </h3>
      {description && (
        <p className={`text-medium-gray ${compact ? 'text-sm' : 'text-base'} max-w-md mx-auto`}>
          {description}
        </p>
      )}
      {action && (
        <Link
          href={action.href}
          className="inline-block mt-4 px-4 py-2 bg-teal text-white rounded-xl font-medium hover:bg-teal/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
