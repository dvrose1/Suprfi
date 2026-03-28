// ABOUTME: Reusable animated wrapper components using Framer Motion
// ABOUTME: Provides consistent entrance animations and micro-interactions

'use client';

import { motion, HTMLMotionProps, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';
import {
  fadeInUp,
  fadeIn,
  scaleIn,
  staggerContainer,
  staggerContainerFast,
  cardHover,
  buttonPress,
  transitions,
} from '@/lib/animations';

// Animated container that staggers children
interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  fast?: boolean;
  delay?: number;
}

export function StaggerContainer({ 
  children, 
  fast = false, 
  delay = 0,
  ...props 
}: StaggerContainerProps) {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
  }

  const variants = fast ? staggerContainerFast : staggerContainer;
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        ...variants,
        visible: {
          ...variants.visible,
          transition: {
            ...(variants.visible as { transition?: object }).transition,
            delayChildren: delay,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Animated item that fades in and up
interface FadeInUpProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  delay?: number;
}

export function FadeInUp({ children, delay = 0, ...props }: FadeInUpProps) {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
  }

  return (
    <motion.div
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
      transition={{ ...transitions.entrance, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Animated item for use inside StaggerContainer
interface StaggerItemProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
}

export function StaggerItem({ children, ...props }: StaggerItemProps) {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
  }

  return (
    <motion.div variants={fadeInUp} {...props}>
      {children}
    </motion.div>
  );
}

// Scale in animation
interface ScaleInProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  delay?: number;
}

export function ScaleIn({ children, delay = 0, ...props }: ScaleInProps) {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
  }

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      transition={{ ...transitions.entrance, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Simple fade in
interface FadeInProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  delay?: number;
}

export function FadeIn({ children, delay = 0, ...props }: FadeInProps) {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return <div {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
  }

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      transition={{ ...transitions.normal, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Animated card with hover lift effect
interface AnimatedCardProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
}

export function AnimatedCard({ children, className = '', ...props }: AnimatedCardProps) {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return <div className={className} {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={cardHover}
      initial="rest"
      whileHover="hover"
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Animated button with press feedback
interface AnimatedButtonProps extends HTMLMotionProps<'button'> {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
}

export function AnimatedButton({ 
  children, 
  className = '', 
  disabled = false,
  ...props 
}: AnimatedButtonProps) {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion || disabled) {
    return (
      <button className={className} disabled={disabled} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
        {children}
      </button>
    );
  }

  return (
    <motion.button
      className={className}
      variants={buttonPress}
      initial="rest"
      whileHover="hover"
      whileTap="tap"
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// Animated counter for stats
interface AnimatedCounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({ 
  value, 
  prefix = '', 
  suffix = '', 
  duration = 1.5,
  className = '',
}: AnimatedCounterProps) {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return <span className={className}>{prefix}{value.toLocaleString()}{suffix}</span>;
  }

  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {prefix}
        <CountingNumber value={value} duration={duration} />
        {suffix}
      </motion.span>
    </motion.span>
  );
}

// Internal counting number component
function CountingNumber({ value, duration }: { value: number; duration: number }) {
  return (
    <motion.span
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.span
        key={value}
        initial={{ opacity: 0.5 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {value.toLocaleString()}
      </motion.span>
    </motion.span>
  );
}

// Scroll-triggered animation wrapper
interface ScrollRevealProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
}

export function ScrollReveal({ children, className = '', ...props }: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return <div className={className} {...(props as React.HTMLAttributes<HTMLDivElement>)}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={transitions.entrance}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Page transition wrapper
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = '' }: PageTransitionProps) {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transitions.normal}
    >
      {children}
    </motion.div>
  );
}
