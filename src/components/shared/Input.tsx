// ABOUTME: Shared input component with consistent styling
// ABOUTME: Supports text, email, password, and other input types

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export default function Input({
  label,
  error,
  hint,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || props.name;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-navy">
          {label}
          {props.required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      
      <input
        id={inputId}
        className={`
          w-full px-4 py-2.5 rounded-xl border
          text-navy placeholder:text-medium-gray
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal
          disabled:bg-gray-50 disabled:text-medium-gray disabled:cursor-not-allowed
          ${error ? 'border-error focus:ring-error/30 focus:border-error' : 'border-gray-200'}
          ${className}
        `}
        {...props}
      />
      
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
      
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
}

export function Select({
  label,
  error,
  hint,
  options,
  className = '',
  id,
  ...props
}: SelectProps) {
  const selectId = id || props.name;

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-medium text-navy">
          {label}
          {props.required && <span className="text-error ml-0.5">*</span>}
        </label>
      )}
      
      <select
        id={selectId}
        className={`
          w-full px-4 py-2.5 rounded-xl border bg-white
          text-navy
          transition-colors duration-200
          focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal
          disabled:bg-gray-50 disabled:text-medium-gray disabled:cursor-not-allowed
          ${error ? 'border-error focus:ring-error/30 focus:border-error' : 'border-gray-200'}
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
      
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}
      
      {hint && !error && (
        <p className="text-sm text-medium-gray">{hint}</p>
      )}
    </div>
  );
}
