'use client'

import { useState } from 'react'
import { z } from 'zod'

interface ManualBankFormProps {
  onSubmit: (data: ManualBankData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export interface ManualBankData {
  bankName: string
  accountHolderName: string
  routingNumber: string
  accountNumber: string
  accountType: 'checking' | 'savings'
}

// Routing number validation (9 digits with ABA checksum)
function validateRoutingNumber(routing: string): boolean {
  if (!/^\d{9}$/.test(routing)) return false
  
  // ABA routing number checksum algorithm
  const digits = routing.split('').map(Number)
  const checksum = 
    3 * (digits[0] + digits[3] + digits[6]) +
    7 * (digits[1] + digits[4] + digits[7]) +
    1 * (digits[2] + digits[5] + digits[8])
  
  return checksum % 10 === 0
}

const ManualBankSchema = z.object({
  bankName: z.string().min(2, 'Bank name is required'),
  accountHolderName: z.string().min(2, 'Account holder name is required'),
  routingNumber: z.string()
    .length(9, 'Routing number must be 9 digits')
    .regex(/^\d+$/, 'Routing number must contain only numbers')
    .refine(validateRoutingNumber, 'Invalid routing number'),
  accountNumber: z.string()
    .min(4, 'Account number must be at least 4 digits')
    .max(17, 'Account number must be 17 digits or less')
    .regex(/^\d+$/, 'Account number must contain only numbers'),
  accountNumberConfirm: z.string(),
  accountType: z.enum(['checking', 'savings']),
}).refine(data => data.accountNumber === data.accountNumberConfirm, {
  message: 'Account numbers do not match',
  path: ['accountNumberConfirm'],
})

export function ManualBankForm({ onSubmit, onCancel, loading = false }: ManualBankFormProps) {
  const [formData, setFormData] = useState({
    bankName: '',
    accountHolderName: '',
    routingNumber: '',
    accountNumber: '',
    accountNumberConfirm: '',
    accountType: 'checking' as 'checking' | 'savings',
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showAccountNumber, setShowAccountNumber] = useState(false)

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Validate
    const result = ManualBankSchema.safeParse(formData)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach(issue => {
        const field = issue.path[0] as string
        fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      return
    }

    // Submit (excluding confirmation field)
    await onSubmit({
      bankName: formData.bankName,
      accountHolderName: formData.accountHolderName,
      routingNumber: formData.routingNumber,
      accountNumber: formData.accountNumber,
      accountType: formData.accountType,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <span className="text-yellow-600 text-xl mr-3">⚠️</span>
          <div className="text-sm text-yellow-800">
            <p className="font-semibold mb-1">Manual Entry Notice</p>
            <p>
              Without instant bank verification, your application may require additional review 
              and could have different terms than applications verified through Plaid.
            </p>
          </div>
        </div>
      </div>

      {/* Bank Name */}
      <div>
        <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
          Bank Name *
        </label>
        <input
          type="text"
          id="bankName"
          value={formData.bankName}
          onChange={(e) => handleChange('bankName', e.target.value)}
          placeholder="e.g., Chase, Bank of America, Wells Fargo"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.bankName ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.bankName && <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>}
      </div>

      {/* Account Holder Name */}
      <div>
        <label htmlFor="accountHolderName" className="block text-sm font-medium text-gray-700 mb-1">
          Account Holder Name *
        </label>
        <input
          type="text"
          id="accountHolderName"
          value={formData.accountHolderName}
          onChange={(e) => handleChange('accountHolderName', e.target.value)}
          placeholder="Name as it appears on your account"
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.accountHolderName ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.accountHolderName && <p className="mt-1 text-sm text-red-600">{errors.accountHolderName}</p>}
      </div>

      {/* Account Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Account Type *
        </label>
        <div className="flex gap-4">
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="accountType"
              value="checking"
              checked={formData.accountType === 'checking'}
              onChange={(e) => handleChange('accountType', e.target.value)}
              className="mr-2 h-4 w-4 text-blue-600"
            />
            <span className="text-gray-700">Checking</span>
          </label>
          <label className="flex items-center cursor-pointer">
            <input
              type="radio"
              name="accountType"
              value="savings"
              checked={formData.accountType === 'savings'}
              onChange={(e) => handleChange('accountType', e.target.value)}
              className="mr-2 h-4 w-4 text-blue-600"
            />
            <span className="text-gray-700">Savings</span>
          </label>
        </div>
      </div>

      {/* Routing Number */}
      <div>
        <label htmlFor="routingNumber" className="block text-sm font-medium text-gray-700 mb-1">
          Routing Number *
        </label>
        <input
          type="text"
          id="routingNumber"
          value={formData.routingNumber}
          onChange={(e) => handleChange('routingNumber', e.target.value.replace(/\D/g, '').slice(0, 9))}
          placeholder="9-digit routing number"
          maxLength={9}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono ${
            errors.routingNumber ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.routingNumber && <p className="mt-1 text-sm text-red-600">{errors.routingNumber}</p>}
        <p className="mt-1 text-xs text-gray-500">Find this on the bottom left of your check</p>
      </div>

      {/* Account Number */}
      <div>
        <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
          Account Number *
        </label>
        <div className="relative">
          <input
            type={showAccountNumber ? 'text' : 'password'}
            id="accountNumber"
            value={formData.accountNumber}
            onChange={(e) => handleChange('accountNumber', e.target.value.replace(/\D/g, '').slice(0, 17))}
            placeholder="Your account number"
            maxLength={17}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono pr-12 ${
              errors.accountNumber ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowAccountNumber(!showAccountNumber)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showAccountNumber ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
        {errors.accountNumber && <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>}
      </div>

      {/* Confirm Account Number */}
      <div>
        <label htmlFor="accountNumberConfirm" className="block text-sm font-medium text-gray-700 mb-1">
          Confirm Account Number *
        </label>
        <input
          type={showAccountNumber ? 'text' : 'password'}
          id="accountNumberConfirm"
          value={formData.accountNumberConfirm}
          onChange={(e) => handleChange('accountNumberConfirm', e.target.value.replace(/\D/g, '').slice(0, 17))}
          placeholder="Re-enter your account number"
          maxLength={17}
          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono ${
            errors.accountNumberConfirm ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.accountNumberConfirm && <p className="mt-1 text-sm text-red-600">{errors.accountNumberConfirm}</p>}
      </div>

      {/* Check Image Helper */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-2 font-medium">Where to find your bank details:</p>
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center">
            <span className="inline-block w-16 h-6 bg-gray-300 rounded mr-2 text-center leading-6 font-mono">123456789</span>
            <span>Routing #</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-20 h-6 bg-gray-300 rounded mr-2 text-center leading-6 font-mono">0001234567</span>
            <span>Account #</span>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">Located at the bottom of your checks</p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Submitting...' : 'Submit Bank Details'}
        </button>
      </div>
    </form>
  )
}
