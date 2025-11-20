// ABOUTME: Waitlist signup form with homeowner/contractor variants
// ABOUTME: Handles form validation, submission, and success states

'use client';

import React, { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';

interface WaitlistFormProps {
  type?: 'homeowner' | 'contractor';
}

interface FormData {
  email: string;
  name: string;
  phone: string;
  // Homeowner fields
  zipCode?: string;
  repairType?: string;
  // Contractor fields
  businessName?: string;
  serviceType?: string;
  state?: string;
}

interface FormErrors {
  [key: string]: string;
}

const WaitlistForm: React.FC<WaitlistFormProps> = ({ type = 'homeowner' }) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    name: '',
    phone: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Name validation
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }

    // Type-specific validation
    if (type === 'homeowner') {
      if (!formData.zipCode) {
        newErrors.zipCode = 'ZIP code is required';
      } else if (!/^\d{5}$/.test(formData.zipCode)) {
        newErrors.zipCode = 'Please enter a valid 5-digit ZIP code';
      }
    } else {
      if (!formData.businessName) {
        newErrors.businessName = 'Business name is required';
      }
      if (!formData.state) {
        newErrors.state = 'State is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/v1/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          ...formData,
          source: window.location.pathname,
          referrer: document.referrer,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
      } else {
        setErrors({ submit: data.error || 'Something went wrong. Please try again.' });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (isSuccess) {
    return (
      <Card padding="lg" className="max-w-md mx-auto text-center">
        <div className="mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 text-primary-600 mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">You're on the list!</h3>
          <p className="text-gray-600">
            We'll send you an email confirmation shortly. You'll be the first to know when we launch!
          </p>
        </div>
        {type === 'contractor' && (
          <p className="text-sm text-gray-500 border-t border-gray-200 pt-4">
            Want to learn more about our contractor program? Email us at{' '}
            <a href="mailto:contractors@suprfi.com" className="text-primary-600 hover:underline">
              contractors@suprfi.com
            </a>
          </p>
        )}
      </Card>
    );
  }

  return (
    <Card padding="lg" className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          id="email"
          name="email"
          type="email"
          label="Email Address"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <Input
          id="name"
          name="name"
          type="text"
          label={type === 'contractor' ? 'Contact Name' : 'Full Name'}
          placeholder={type === 'contractor' ? 'John Smith' : 'Your name'}
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

        <Input
          id="phone"
          name="phone"
          type="tel"
          label="Phone Number"
          placeholder="(555) 123-4567"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
        />

        {type === 'homeowner' ? (
          <>
            <Input
              id="zipCode"
              name="zipCode"
              type="text"
              label="ZIP Code"
              placeholder="90210"
              value={formData.zipCode || ''}
              onChange={handleChange}
              error={errors.zipCode}
              required
            />

            <div>
              <label htmlFor="repairType" className="block text-sm font-medium text-gray-700 mb-2">
                What type of repair do you need?
              </label>
              <select
                id="repairType"
                name="repairType"
                value={formData.repairType || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select repair type</option>
                <option value="hvac">HVAC (Heating/Cooling)</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="roofing">Roofing</option>
                <option value="other">Other Home Repair</option>
              </select>
            </div>
          </>
        ) : (
          <>
            <Input
              id="businessName"
              name="businessName"
              type="text"
              label="Business Name"
              placeholder="ABC Home Services"
              value={formData.businessName || ''}
              onChange={handleChange}
              error={errors.businessName}
              required
            />

            <div>
              <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-2">
                Primary Service Type
                <span className="text-accent-500 ml-1">*</span>
              </label>
              <select
                id="serviceType"
                name="serviceType"
                value={formData.serviceType || ''}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                required
              >
                <option value="">Select service type</option>
                <option value="hvac">HVAC</option>
                <option value="plumbing">Plumbing</option>
                <option value="electrical">Electrical</option>
                <option value="roofing">Roofing</option>
                <option value="general">General Contracting</option>
                <option value="other">Other</option>
              </select>
            </div>

            <Input
              id="state"
              name="state"
              type="text"
              label="State"
              placeholder="CA"
              value={formData.state || ''}
              onChange={handleChange}
              error={errors.state}
              required
            />
          </>
        )}

        {errors.submit && (
          <div className="p-4 bg-accent-50 border border-accent-200 rounded-lg">
            <p className="text-sm text-accent-700">{errors.submit}</p>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Joining...' : 'Join Waitlist'}
        </Button>

        <p className="text-xs text-gray-500 text-center">
          By joining, you agree to receive updates from SuprFi. Unsubscribe anytime.
        </p>
      </form>
    </Card>
  );
};

export default WaitlistForm;
