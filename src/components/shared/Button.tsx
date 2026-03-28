// ABOUTME: Shared button component with design system variants
// ABOUTME: Press feedback, hover lift, and loading states for delight

'use client';

import React from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { springs } from '@/lib/animations';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  fullWidth?: boolean;
}

const variantClasses = {
  primary: 'bg-teal text-white shadow-sm hover:shadow-md',
  secondary: 'bg-white text-navy border border-gray-200',
  ghost: 'text-navy',
  danger: 'bg-error text-white',
};

const variantHoverClasses = {
  primary: 'hover:bg-teal/90',
  secondary: 'hover:bg-gray-50 hover:border-gray-300',
  ghost: 'hover:bg-gray-100',
  danger: 'hover:bg-error/90',
};

const sizeClasses = {
  sm: 'px-3 py-1.5 text-sm rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  href,
  onClick,
  disabled = false,
  loading = false,
  className = '',
  type = 'button',
  fullWidth = false,
}: ButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-semibold transition-colors duration-200
    focus:outline-none focus:ring-2 focus:ring-teal/50 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variantClasses[variant]}
    ${!disabled && !loading ? variantHoverClasses[variant] : ''}
    ${sizeClasses[size]}
    ${fullWidth ? 'w-full' : ''}
    ${className}
  `.trim();

  const content = (
    <>
      {loading && (
        <motion.svg 
          className="h-4 w-4" 
          fill="none" 
          viewBox="0 0 24 24"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </motion.svg>
      )}
      {children}
    </>
  );

  // Animation variants for hover/tap
  const motionProps = prefersReducedMotion || disabled || loading
    ? {}
    : {
        whileHover: { y: -2, transition: springs.snappy },
        whileTap: { y: 0, scale: 0.98, transition: { duration: 0.1 } },
      };

  if (href && !disabled) {
    return (
      <motion.div {...motionProps} className={fullWidth ? 'w-full' : 'inline-block'}>
        <Link href={href} className={baseClasses}>
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={baseClasses}
      {...motionProps}
    >
      {content}
    </motion.button>
  );
}
