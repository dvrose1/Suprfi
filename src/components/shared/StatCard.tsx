// ABOUTME: Reusable stat card component for dashboard metrics
// ABOUTME: Supports hero variant for primary stats, interactive hover states

'use client';

import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { transitions } from '@/lib/animations';

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  href?: string;
  hero?: boolean;
  loading?: boolean;
  valueColor?: string;
  subtextColor?: string;
  highlight?: boolean;
}

export function StatCard({
  label,
  value,
  subtext,
  href,
  hero = false,
  loading = false,
  valueColor = 'text-navy',
  subtextColor = 'text-medium-gray',
  highlight = false,
}: StatCardProps) {
  const prefersReducedMotion = useReducedMotion();
  
  const baseClasses = hero
    ? 'bg-white rounded-2xl shadow-md border-l-4 border-l-teal border border-gray-100 p-6'
    : 'bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all';
  
  const highlightClasses = highlight
    ? 'border-l-4 border-l-warning bg-warning/5'
    : '';

  const content = (
    <>
      <div className="text-sm text-medium-gray mb-1">{label}</div>
      <div className={`${hero ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'} font-bold font-display ${valueColor}`}>
        {loading ? '...' : value}
      </div>
      {subtext && (
        <div className={`text-xs mt-2 ${subtextColor}`}>
          {subtext}
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <motion.div
        whileHover={prefersReducedMotion ? {} : { y: -4, transition: transitions.fast }}
      >
        <Link 
          href={href} 
          className={`block ${baseClasses} ${highlightClasses} ${hero ? 'hover:shadow-lg' : ''}`}
        >
          {content}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      className={`${baseClasses} ${highlightClasses}`}
      whileHover={prefersReducedMotion ? {} : { y: -4, transition: transitions.fast }}
    >
      {content}
    </motion.div>
  );
}
