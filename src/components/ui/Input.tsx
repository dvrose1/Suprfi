// ABOUTME: Reusable form input component with label, error states, and validation
// ABOUTME: Supports text, email, tel, password types with consistent styling

import React from 'react';

export interface InputProps {
  id: string;
  name: string;
  type?: 'text' | 'email' | 'tel' | 'password' | 'number';
  label?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const Input: React.FC<InputProps> = ({
  id,
  name,
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  disabled = false,
  className = '',
}) => {
  const inputClasses = `
    w-full px-4 py-3 rounded-lg border
    ${error ? 'border-accent-500 focus:ring-accent-500' : 'border-gray-300 focus:ring-primary-500'}
    focus:outline-none focus:ring-2 focus:border-transparent
    disabled:bg-gray-100 disabled:cursor-not-allowed
    transition-colors duration-200
  `;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-accent-500 ml-1">*</span>}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={inputClasses}
      />
      {error && (
        <p className="mt-2 text-sm text-accent-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
