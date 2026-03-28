// ABOUTME: Shared input component with validation feedback
// ABOUTME: Success states, error animations, and focus effects for delight

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  success?: boolean;
  showSuccessIcon?: boolean;
}

export default function Input({
  label,
  error,
  hint,
  success = false,
  showSuccessIcon = true,
  className = '',
  id,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const inputId = id || props.name;

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const getBorderClasses = () => {
    if (error) return 'border-error focus:ring-error/30 focus:border-error';
    if (success) return 'border-mint focus:ring-mint/30 focus:border-mint';
    return 'border-gray-200 focus:ring-teal/30 focus:border-teal';
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-navy">
          {label}
          {props.required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      
      <div className="relative">
        <motion.div
          animate={error && !prefersReducedMotion ? { x: [0, -4, 4, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
        >
          <input
            id={inputId}
            className={`
              w-full px-4 py-2.5 rounded-xl border
              text-navy placeholder:text-medium-gray
              transition-all duration-200
              focus:outline-none focus:ring-2
              disabled:bg-gray-50 disabled:text-medium-gray disabled:cursor-not-allowed
              ${getBorderClasses()}
              ${success && showSuccessIcon ? 'pr-10' : ''}
              ${className}
            `}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
        </motion.div>
        
        {/* Success checkmark icon */}
        <AnimatePresence>
          {success && showSuccessIcon && (
            <motion.div
              className="absolute right-3 top-1/2 -translate-y-1/2 text-mint"
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Error message with animation */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            className="text-sm text-error"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      
      {/* Hint text */}
      {hint && !error && (
        <p className="text-sm text-medium-gray">{hint}</p>
      )}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: Array<{ value: string; label: string }>;
  success?: boolean;
}

export function Select({
  label,
  error,
  hint,
  options,
  success = false,
  className = '',
  id,
  ...props
}: SelectProps) {
  const prefersReducedMotion = useReducedMotion();
  const selectId = id || props.name;

  const getBorderClasses = () => {
    if (error) return 'border-error focus:ring-error/30 focus:border-error';
    if (success) return 'border-mint focus:ring-mint/30 focus:border-mint';
    return 'border-gray-200 focus:ring-teal/30 focus:border-teal';
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-navy">
          {label}
          {props.required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      
      <motion.div
        animate={error && !prefersReducedMotion ? { x: [0, -4, 4, -4, 4, 0] } : {}}
        transition={{ duration: 0.4 }}
      >
        <select
          id={selectId}
          className={`
            w-full px-4 py-2.5 rounded-xl border bg-white
            text-navy
            transition-all duration-200
            focus:outline-none focus:ring-2
            disabled:bg-gray-50 disabled:text-medium-gray disabled:cursor-not-allowed
            ${getBorderClasses()}
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </motion.div>
      
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            className="text-sm text-error"
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
      
      {hint && !error && (
        <p className="text-sm text-medium-gray">{hint}</p>
      )}
    </div>
  );
}

// Toggle switch with spring physics
interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, disabled = false }: ToggleProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <label className={`inline-flex items-center gap-3 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`
          relative w-11 h-6 rounded-full transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-teal/50 focus:ring-offset-2
          ${checked ? 'bg-teal' : 'bg-gray-300'}
        `}
      >
        <motion.div
          className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
          animate={{ x: checked ? 20 : 0 }}
          transition={prefersReducedMotion ? { duration: 0 } : { type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
      {label && <span className="text-sm text-navy">{label}</span>}
    </label>
  );
}
