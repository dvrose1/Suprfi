'use client'

import { useState, useCallback, useEffect } from 'react'
import { usePlaidLink } from 'react-plaid-link'
import type { FormData } from '../ApplicationForm'
import { ManualBankForm, type ManualBankData } from '../ManualBankForm'

interface BankLinkStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
  onBack: () => void
}

export function BankLinkStep({ formData, updateFormData, onNext, onBack }: BankLinkStepProps) {
  const [linkToken, setLinkToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showManualEntry, setShowManualEntry] = useState(false)
  const [manualEntryLoading, setManualEntryLoading] = useState(false)

  // Fetch link token on component mount
  useEffect(() => {
    async function fetchLinkToken() {
      try {
        // Extract token from URL (assuming it's passed as a URL param or available in context)
        const urlToken = window.location.pathname.split('/')[2] // /apply/[token]
        
        const response = await fetch(`/api/v1/borrower/${urlToken}/plaid/link-token`, {
          method: 'POST',
        })

        if (!response.ok) {
          throw new Error('Failed to create link token')
        }

        const data = await response.json()
        setLinkToken(data.linkToken)
      } catch (err) {
        console.error('Error fetching link token:', err)
        setError('Failed to initialize Plaid. Please try again.')
      }
    }

    // Only fetch if we don't already have a bank connected
    if (!formData.plaidAccessToken) {
      fetchLinkToken()
    }
  }, [formData.plaidAccessToken])

  // Handle successful Plaid Link
  const onSuccess = useCallback(async (publicToken: string, metadata: any) => {
    setLoading(true)
    setError(null)

    try {
      const urlToken = window.location.pathname.split('/')[2]
      
      const response = await fetch(`/api/v1/borrower/${urlToken}/plaid/exchange`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicToken,
          metadata,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to connect bank account')
      }

      const data = await response.json()
      
      // Update form data with bank connection details
      updateFormData({
        plaidAccessToken: 'connected', // We don't store the actual token in form data
        plaidAccountId: metadata.account_id,
        bankName: data.bankName,
        accountMask: data.accountMask,
      })

      // Auto-advance to next step
      setTimeout(() => {
        onNext()
      }, 500)
    } catch (err) {
      console.error('Error connecting bank:', err)
      setError('Failed to connect your bank account. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [updateFormData, onNext])

  // Handle Plaid Link exit
  const onExit = useCallback((err: any, metadata: any) => {
    if (err != null) {
      console.error('Plaid Link error:', err)
      setError('Bank connection was cancelled or failed. Please try again.')
    }
  }, [])

  // Configure Plaid Link
  const config = {
    token: linkToken,
    onSuccess,
    onExit,
  }

  const { open, ready } = usePlaidLink(config)

  const handleConnect = () => {
    if (ready) {
      open()
    } else {
      setError('Plaid is still loading. Please wait a moment and try again.')
    }
  }

  // Handle manual bank entry submission
  const handleManualBankSubmit = async (data: ManualBankData) => {
    setManualEntryLoading(true)
    setError(null)

    try {
      const urlToken = window.location.pathname.split('/')[2]
      
      const response = await fetch(`/api/v1/borrower/${urlToken}/bank/manual`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save bank details')
      }

      // Update form data to indicate bank is connected (manually)
      updateFormData({
        plaidAccessToken: 'manual_entry',
        bankName: data.bankName,
        accountMask: data.accountNumber.slice(-4),
      })

      // Auto-advance to next step
      setTimeout(() => {
        onNext()
      }, 500)
    } catch (err) {
      console.error('Error saving manual bank details:', err)
      setError(err instanceof Error ? err.message : 'Failed to save bank details. Please try again.')
    } finally {
      setManualEntryLoading(false)
    }
  }

  // If showing manual entry form
  if (showManualEntry) {
    return (
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Enter Bank Details Manually</h2>
        <p className="text-gray-600 mb-8">
          Please enter your bank account information below. This will be used for loan disbursement and payments.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="text-red-600 text-xl mr-3">!</div>
              <div>
                <div className="font-semibold text-red-900">Error</div>
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        <ManualBankForm
          onSubmit={handleManualBankSubmit}
          onCancel={() => setShowManualEntry(false)}
          loading={manualEntryLoading}
        />
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Connect Your Bank Account</h2>
      <p className="text-gray-600 mb-8">
        We use Plaid to securely connect to your bank account. This helps us verify your income and financial stability.
      </p>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="text-red-600 text-xl mr-3">⚠️</div>
            <div>
              <div className="font-semibold text-red-900">Connection Error</div>
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {formData.plaidAccessToken ? (
        // Already connected
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <div className="text-green-600 text-3xl mr-4">✓</div>
            <div>
              <div className="font-semibold text-gray-900">Bank Connected</div>
              <div className="text-sm text-gray-600">
                {formData.bankName} (...{formData.accountMask})
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Not connected yet
        <div className="bg-teal/10 border border-teal/20 rounded-lg p-8 mb-8 text-center">
          <div className="text-teal text-5xl mb-4">🏦</div>
          <h3 className="text-lg font-semibold mb-2">Secure Bank Connection</h3>
          <p className="text-gray-600 mb-6">
            Your credentials are never stored. Plaid uses bank-level encryption.
          </p>
          
          <button
            type="button"
            onClick={handleConnect}
            disabled={!ready || loading}
            className="px-8 py-3 bg-teal text-white rounded-lg font-semibold hover:bg-teal/90 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Connecting...' : !ready ? 'Loading...' : 'Connect Bank Account'}
          </button>
          
          <div className="mt-6 text-sm text-gray-500">
            <p className="mb-2">✓ 256-bit SSL encryption</p>
            <p className="mb-2">✓ Read-only access</p>
            <p>✓ Trusted by 8,000+ financial apps</p>
          </div>

          {/* Manual Entry Link */}
          <div className="mt-6 pt-4 border-t border-teal/20">
            <button
              type="button"
              onClick={() => setShowManualEntry(true)}
              className="text-sm text-teal hover:text-teal/80 underline"
            >
              Having trouble? Enter bank details manually
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        
        {formData.plaidAccessToken && (
          <button
            type="button"
            onClick={onNext}
            className="px-8 py-3 bg-teal text-white rounded-lg font-semibold hover:bg-teal/90 transition-colors"
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  )
}
