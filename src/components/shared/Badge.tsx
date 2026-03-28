// ABOUTME: Shared badge/status component
// ABOUTME: Used for status indicators across all products

import React from 'react';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'teal' | 'navy';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-gray-100 text-gray-700',
  success: 'bg-mint/20 text-mint',
  warning: 'bg-warning/20 text-warning',
  error: 'bg-error/20 text-error',
  info: 'bg-cyan/20 text-cyan',
  teal: 'bg-teal/20 text-teal',
  navy: 'bg-navy/10 text-navy',
};

const dotColors: Record<BadgeVariant, string> = {
  default: 'bg-gray-400',
  success: 'bg-mint',
  warning: 'bg-warning',
  error: 'bg-error',
  info: 'bg-cyan',
  teal: 'bg-teal',
  navy: 'bg-navy',
};

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
}: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm';

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${variantClasses[variant]}
        ${sizeClasses}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
}

// Status-specific helpers
export function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; variant: BadgeVariant }> = {
    initiated: { label: 'Initiated', variant: 'default' },
    submitted: { label: 'Submitted', variant: 'info' },
    approved: { label: 'Approved', variant: 'success' },
    declined: { label: 'Declined', variant: 'error' },
    funded: { label: 'Funded', variant: 'teal' },
    manual_review: { label: 'Manual Review', variant: 'warning' },
    pending: { label: 'Pending', variant: 'warning' },
    active: { label: 'Active', variant: 'success' },
    completed: { label: 'Completed', variant: 'navy' },
    expired: { label: 'Expired', variant: 'default' },
  };

  const config = statusConfig[status.toLowerCase()] || { label: status, variant: 'default' as BadgeVariant };

  return (
    <Badge variant={config.variant} dot>
      {config.label}
    </Badge>
  );
}
