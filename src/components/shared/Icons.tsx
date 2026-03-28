// ABOUTME: Simple SVG icons for professional UI
// ABOUTME: Replaces emoji with clean, brand-aligned icons

import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export function CheckIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      fill="none" 
      className={className}
      aria-hidden="true"
    >
      <path 
        d="M13.5 4.5L6 12L2.5 8.5" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DollarIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      fill="none" 
      className={className}
      aria-hidden="true"
    >
      <path 
        d="M8 1V15M11 4H6.5C5.83696 4 5.20107 4.26339 4.73223 4.73223C4.26339 5.20107 4 5.83696 4 6.5C4 7.16304 4.26339 7.79893 4.73223 8.26777C5.20107 8.73661 5.83696 9 6.5 9H9.5C10.163 9 10.7989 9.26339 11.2678 9.73223C11.7366 10.2011 12 10.837 12 11.5C12 12.163 11.7366 12.7989 11.2678 13.2678C10.7989 13.7366 10.163 14 9.5 14H4" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DocumentIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      fill="none" 
      className={className}
      aria-hidden="true"
    >
      <path 
        d="M9 1H3C2.44772 1 2 1.44772 2 2V14C2 14.5523 2.44772 15 3 15H13C13.5523 15 14 14.5523 14 14V6L9 1Z" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <path 
        d="M9 1V6H14" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RocketIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      fill="none" 
      className={className}
      aria-hidden="true"
    >
      <path 
        d="M10.5 5.5L5 11M14 2C14 2 14.5 5.5 11 9L7 13L3 9L7 5C10.5 1.5 14 2 14 2ZM3 13L1 15M5.5 10.5L3.5 12.5" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChartIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      fill="none" 
      className={className}
      aria-hidden="true"
    >
      <path 
        d="M14 14H2V2M4 10L7 7L10 10L14 6" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LockIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      fill="none" 
      className={className}
      aria-hidden="true"
    >
      <rect 
        x="3" 
        y="7" 
        width="10" 
        height="8" 
        rx="1" 
        stroke="currentColor" 
        strokeWidth="1.5"
      />
      <path 
        d="M5 7V5C5 3.34315 6.34315 2 8 2C9.65685 2 11 3.34315 11 5V7" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AlertIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      fill="none" 
      className={className}
      aria-hidden="true"
    >
      <path 
        d="M8 5V8M8 11H8.01M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LightbulbIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      fill="none" 
      className={className}
      aria-hidden="true"
    >
      <path 
        d="M6 14H10M6.5 11C5.5 10.3 5 9.1 5 8C5 6.34315 6.34315 5 8 5C9.65685 5 11 6.34315 11 8C11 9.1 10.5 10.3 9.5 11M6.5 11V12.5C6.5 13.0523 6.94772 13.5 7.5 13.5H8.5C9.05228 13.5 9.5 13.0523 9.5 12.5V11M6.5 11H9.5M8 2V3M3 8H2M14 8H13M4.5 4.5L3.8 3.8M11.5 4.5L12.2 3.8" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ErrorIcon({ className = '', size = 16 }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 16 16" 
      fill="none" 
      className={className}
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6L6 10M6 6L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Status dot for activity feeds - simpler than icons
export function StatusDot({ color = 'bg-teal' }: { color?: string }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${color}`} aria-hidden="true" />
  );
}
