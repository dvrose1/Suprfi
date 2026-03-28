// ABOUTME: Shared animation configurations, spacing, and variants for Framer Motion
// ABOUTME: Provides consistent, purposeful animations and layout rhythm across all SuprFi products

import { Variants, Transition } from 'framer-motion';

// Spacing scale based on 4px grid
export const spacing = {
  xs: '4px',   // 1
  sm: '8px',   // 2
  md: '12px',  // 3
  lg: '16px',  // 4
  xl: '24px',  // 6
  '2xl': '32px', // 8
  '3xl': '48px', // 12
  '4xl': '64px', // 16
} as const;

// Tailwind class mappings for consistent spacing
export const layoutClasses = {
  // Page containers
  pageWrapper: 'min-h-screen bg-light-gray',
  pageContent: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12',
  
  // Section spacing
  sectionGap: 'space-y-8',
  itemGap: 'space-y-4',
  
  // Card variants
  cardPrimary: 'bg-white rounded-2xl shadow-sm border border-gray-100 p-6',
  cardSecondary: 'bg-white rounded-xl border border-gray-100 p-4',
  cardHero: 'bg-white rounded-2xl shadow-md border-l-4 border-l-teal border border-gray-100 p-6',
  cardInteractive: 'bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer',
  
  // Stats variants
  statHero: 'text-3xl sm:text-4xl font-bold font-display',
  statNormal: 'text-2xl sm:text-3xl font-bold font-display',
  statLabel: 'text-sm text-medium-gray mb-1',
  statSubtext: 'text-xs mt-2',
  
  // Form layouts
  formCard: 'bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8',
  formGroup: 'space-y-4',
  formLabel: 'block text-sm font-medium text-navy mb-1.5',
  formInput: 'w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal focus:border-transparent transition-shadow',
  
  // Grid layouts
  statsGrid: 'grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6',
  twoColGrid: 'grid grid-cols-1 lg:grid-cols-2 gap-6',
  actionGrid: 'grid grid-cols-1 sm:grid-cols-2 gap-3',
} as const;

// Easing curves - refined, professional feel (no bounce/elastic)
export const easing = {
  easeOutQuart: [0.25, 1, 0.5, 1] as const,
  easeOutQuint: [0.22, 1, 0.36, 1] as const,
  easeOutExpo: [0.16, 1, 0.3, 1] as const,
};

// Standard transitions by purpose
export const transitions = {
  // Instant feedback (button press, toggle)
  fast: { duration: 0.15, ease: easing.easeOutQuart } as Transition,
  // State changes (hover, menu open)
  normal: { duration: 0.25, ease: easing.easeOutQuart } as Transition,
  // Layout changes (accordion, modal)
  slow: { duration: 0.4, ease: easing.easeOutQuart } as Transition,
  // Entrance animations (page load)
  entrance: { duration: 0.5, ease: easing.easeOutExpo } as Transition,
};

// Fade in from bottom (default entrance)
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: transitions.entrance,
  },
};

// Fade in from left
export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.entrance,
  },
};

// Fade in from right
export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: transitions.entrance,
  },
};

// Simple fade
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: transitions.normal,
  },
};

// Scale up with fade
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: transitions.entrance,
  },
};

// Stagger container for child animations
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Stagger with faster timing
export const staggerContainerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

// Card hover effect
export const cardHover: Variants = {
  rest: { 
    y: 0, 
    boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  },
  hover: { 
    y: -4, 
    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    transition: transitions.normal,
  },
};

// Button press effect
export const buttonPress: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: transitions.fast },
  tap: { scale: 0.98, transition: { duration: 0.1 } },
};

// Subtle pulse for loading states
export const pulse: Variants = {
  animate: {
    opacity: [1, 0.5, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

// Number counter animation helper
export const countUp = (end: number, duration: number = 1.5) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
});

// Slide in for modals/drawers
export const slideInRight: Variants = {
  hidden: { x: '100%', opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: transitions.slow,
  },
  exit: { 
    x: '100%', 
    opacity: 0,
    transition: { ...transitions.normal, duration: 0.2 },
  },
};

// Slide up for mobile menus
export const slideInUp: Variants = {
  hidden: { y: '100%', opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: transitions.slow,
  },
  exit: { 
    y: '100%', 
    opacity: 0,
    transition: { ...transitions.normal, duration: 0.2 },
  },
};

// Backdrop fade
export const backdropFade: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.normal },
  exit: { opacity: 0, transition: { duration: 0.15 } },
};

// Success checkmark animation
export const checkmark: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: { 
    pathLength: 1, 
    opacity: 1,
    transition: { 
      pathLength: { duration: 0.4, ease: easing.easeOutQuart },
      opacity: { duration: 0.2 },
    },
  },
};

// Shake for error feedback
export const shake: Variants = {
  shake: {
    x: [0, -10, 10, -10, 10, 0],
    transition: { duration: 0.4 },
  },
};

// Progress bar fill
export const progressFill: Variants = {
  hidden: { scaleX: 0, originX: 0 },
  visible: (progress: number) => ({
    scaleX: progress,
    transition: { duration: 0.8, ease: easing.easeOutExpo },
  }),
};
