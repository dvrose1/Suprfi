// ABOUTME: Delightful UI components for success states, celebrations, and micro-interactions
// ABOUTME: Animated checkmark, confetti, success circles for premium fintech feel

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { springs, easing } from '@/lib/animations';

// ============================================
// ANIMATED CHECKMARK - Draw animation on success
// ============================================

interface AnimatedCheckmarkProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  strokeWidth?: number;
  delay?: number;
  onComplete?: () => void;
}

const checkSizes = {
  sm: 24,
  md: 40,
  lg: 64,
  xl: 96,
};

export function AnimatedCheckmark({ 
  size = 'md', 
  color = '#2A9D8F', // teal
  strokeWidth = 3,
  delay = 0,
  onComplete,
}: AnimatedCheckmarkProps) {
  const prefersReducedMotion = useReducedMotion();
  const pixelSize = checkSizes[size];

  return (
    <motion.svg
      width={pixelSize}
      height={pixelSize}
      viewBox="0 0 24 24"
      fill="none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay }}
    >
      <motion.path
        d="M4 12.5L9.5 18L20 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={prefersReducedMotion 
          ? { duration: 0 }
          : { 
              delay: delay + 0.2, 
              duration: 0.4, 
              ease: easing.easeOutQuart,
            }
        }
        onAnimationComplete={onComplete}
      />
    </motion.svg>
  );
}

// ============================================
// SUCCESS CIRCLE - Checkmark with animated circle
// ============================================

interface SuccessCircleProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showConfetti?: boolean;
  delay?: number;
}

const circleSizes = {
  sm: { outer: 48, inner: 24, stroke: 2 },
  md: { outer: 80, inner: 40, stroke: 3 },
  lg: { outer: 120, inner: 64, stroke: 4 },
  xl: { outer: 160, inner: 80, stroke: 5 },
};

export function SuccessCircle({ 
  size = 'md', 
  showConfetti = false,
  delay = 0,
}: SuccessCircleProps) {
  const prefersReducedMotion = useReducedMotion();
  const { outer, inner, stroke } = circleSizes[size];

  return (
    <div className="relative inline-flex items-center justify-center">
      {/* Background circle with scale animation */}
      <motion.div
        className="absolute rounded-full bg-teal"
        style={{ width: outer, height: outer }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={prefersReducedMotion 
          ? { duration: 0 }
          : { ...springs.bouncy, delay }
        }
      />
      
      {/* Checkmark */}
      <div className="relative z-10">
        <AnimatedCheckmark 
          size={size === 'xl' ? 'lg' : size === 'lg' ? 'md' : 'sm'} 
          color="white" 
          strokeWidth={stroke}
          delay={delay + 0.2}
        />
      </div>

      {/* Optional confetti burst */}
      {showConfetti && <ConfettiBurst delay={delay + 0.4} />}
    </div>
  );
}

// ============================================
// CONFETTI BURST - Subtle celebration particles
// ============================================

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  color: string;
}

interface ConfettiBurstProps {
  delay?: number;
  intensity?: 'subtle' | 'normal' | 'celebration';
}

const confettiColors = ['#2A9D8F', '#6EC6A7', '#40C4D3', '#0F2D4A'];

export function ConfettiBurst({ delay = 0, intensity = 'subtle' }: ConfettiBurstProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);
  const prefersReducedMotion = useReducedMotion();

  const particleCounts = {
    subtle: 8,
    normal: 16,
    celebration: 24,
  };

  useEffect(() => {
    if (prefersReducedMotion) return;

    const timer = setTimeout(() => {
      const newPieces: ConfettiPiece[] = [];
      const count = particleCounts[intensity];
      
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const distance = 60 + Math.random() * 40;
        newPieces.push({
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
          rotation: Math.random() * 360,
          scale: 0.5 + Math.random() * 0.5,
          color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
        });
      }
      setPieces(newPieces);
    }, delay * 1000);

    return () => clearTimeout(timer);
  }, [delay, intensity, prefersReducedMotion]);

  if (prefersReducedMotion) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            className="absolute left-1/2 top-1/2 w-2 h-2 rounded-full"
            style={{ backgroundColor: piece.color }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
            animate={{ 
              x: piece.x, 
              y: piece.y, 
              scale: piece.scale,
              rotate: piece.rotation,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: 0.8, 
              ease: easing.easeOutQuart,
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// ============================================
// LOADING DOTS - Elegant loading indicator
// ============================================

interface LoadingDotsProps {
  size?: 'sm' | 'md';
  color?: string;
}

export function LoadingDots({ size = 'md', color = '#2A9D8F' }: LoadingDotsProps) {
  const prefersReducedMotion = useReducedMotion();
  const dotSize = size === 'sm' ? 6 : 8;
  const gap = size === 'sm' ? 4 : 6;

  return (
    <div className="flex items-center" style={{ gap }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="rounded-full"
          style={{ width: dotSize, height: dotSize, backgroundColor: color }}
          animate={prefersReducedMotion ? {} : {
            y: [0, -6, 0],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
}

// ============================================
// PULSE RING - Subtle attention indicator
// ============================================

interface PulseRingProps {
  color?: string;
  size?: number;
}

export function PulseRing({ color = '#2A9D8F', size = 12 }: PulseRingProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <span className="relative inline-flex">
      <span
        className="rounded-full"
        style={{ width: size, height: size, backgroundColor: color }}
      />
      {!prefersReducedMotion && (
        <motion.span
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: color }}
          animate={{
            scale: [1, 2],
            opacity: [0.5, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      )}
    </span>
  );
}

// ============================================
// PROGRESS CELEBRATION - Animated progress bar
// ============================================

interface ProgressCelebrationProps {
  progress: number; // 0-100
  showCelebration?: boolean;
  label?: string;
}

export function ProgressCelebration({ 
  progress, 
  showCelebration = true,
  label,
}: ProgressCelebrationProps) {
  const prefersReducedMotion = useReducedMotion();
  const isComplete = progress >= 100;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-navy">{label}</span>
          <span className="text-sm text-medium-gray">{Math.round(progress)}%</span>
        </div>
      )}
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isComplete ? 'bg-mint' : 'bg-teal'}`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress, 100)}%` }}
          transition={prefersReducedMotion 
            ? { duration: 0 }
            : { duration: 0.6, ease: easing.easeOutQuart }
          }
        />
        {isComplete && showCelebration && !prefersReducedMotion && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: '200%' }}
            transition={{ duration: 0.8, delay: 0.3 }}
          />
        )}
      </div>
    </div>
  );
}

// ============================================
// MILESTONE BADGE - Achievement unlock style
// ============================================

interface MilestoneBadgeProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  isNew?: boolean;
}

export function MilestoneBadge({ icon, title, subtitle, isNew = false }: MilestoneBadgeProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="inline-flex items-center gap-3 px-4 py-3 bg-white rounded-xl shadow-md border border-gray-100"
      initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={springs.bouncy}
    >
      {icon && (
        <div className="flex-shrink-0 w-10 h-10 bg-teal/10 rounded-full flex items-center justify-center text-teal">
          {icon}
        </div>
      )}
      <div>
        <div className="flex items-center gap-2">
          <span className="font-semibold text-navy">{title}</span>
          {isNew && (
            <span className="px-1.5 py-0.5 text-xs font-medium bg-mint/20 text-mint rounded">
              NEW
            </span>
          )}
        </div>
        {subtitle && (
          <span className="text-sm text-medium-gray">{subtitle}</span>
        )}
      </div>
    </motion.div>
  );
}

// ============================================
// TOAST SUCCESS - Animated success notification
// ============================================

interface ToastSuccessProps {
  message: string;
  description?: string;
  isVisible: boolean;
  onClose?: () => void;
  autoHide?: number; // ms
}

export function ToastSuccess({ 
  message, 
  description, 
  isVisible, 
  onClose,
  autoHide = 4000,
}: ToastSuccessProps) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (isVisible && autoHide && onClose) {
      const timer = setTimeout(onClose, autoHide);
      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHide, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-6 right-6 z-50 flex items-start gap-3 px-4 py-3 bg-white rounded-xl shadow-lg border border-gray-100 max-w-sm"
          initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={springs.snappy}
        >
          <div className="flex-shrink-0 mt-0.5">
            <SuccessCircle size="sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-navy">{message}</p>
            {description && (
              <p className="text-sm text-medium-gray mt-0.5">{description}</p>
            )}
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ============================================
// NUMBER TICKER - Animated counting display
// ============================================

interface NumberTickerProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
}

export function NumberTicker({ 
  value, 
  prefix = '', 
  suffix = '',
  duration = 1.5,
  className = '',
}: NumberTickerProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    const startTime = Date.now();
    const startValue = displayValue;
    const diff = value - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);
      // Ease out quart
      const eased = 1 - Math.pow(1 - progress, 4);
      const current = startValue + diff * eased;
      
      setDisplayValue(Math.round(current));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, prefersReducedMotion]);

  return (
    <span className={`tabular-nums ${className}`}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

// ============================================
// SHIMMER BUTTON - Subtle shine effect on hover
// ============================================

interface ShimmerButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

export function ShimmerButton({ 
  children, 
  onClick, 
  className = '',
  disabled = false,
}: ShimmerButtonProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden px-6 py-3 bg-teal text-white font-semibold rounded-xl
        transition-colors hover:bg-teal/90 disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-teal/50 focus:ring-offset-2
        ${className}
      `}
      whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
      whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
    >
      {children}
      {!prefersReducedMotion && !disabled && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full"
          whileHover={{ x: '200%' }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.button>
  );
}
