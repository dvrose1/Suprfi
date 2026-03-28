// ABOUTME: Shared card component with consistent styling
// ABOUTME: Used for content sections across all products

import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const paddingClasses = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

export default function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
}: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-2xl shadow-sm border border-gray-100
        ${paddingClasses[padding]}
        ${hover ? 'hover:shadow-md hover:border-gray-200 transition-all' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function CardHeader({ title, subtitle, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div>
        <h2 className="text-lg font-semibold text-navy font-display">{title}</h2>
        {subtitle && <p className="text-sm text-medium-gray mt-0.5">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface CardStatProps {
  value: string | number;
  label: string;
  trend?: { value: string; positive: boolean };
  size?: 'sm' | 'md' | 'lg';
}

export function CardStat({ value, label, trend, size = 'md' }: CardStatProps) {
  const valueClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <div>
      <div className={`${valueClasses[size]} font-bold text-navy font-display`}>
        {value}
      </div>
      <div className="text-sm text-medium-gray mt-1">{label}</div>
      {trend && (
        <div className={`text-xs mt-1 ${trend.positive ? 'text-mint' : 'text-error'}`}>
          {trend.positive ? '↑' : '↓'} {trend.value}
        </div>
      )}
    </div>
  );
}
