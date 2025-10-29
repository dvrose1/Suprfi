'use client'

import type { FormData } from '../ApplicationForm'

interface BankLinkStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
  onBack: () => void
}

export function BankLinkStep({ formData, updateFormData, onNext, onBack }: BankLinkStepProps) {
  const handleConnect = () => {
    // TODO: Integrate Plaid Link in next session
    // For now, simulate connection
    updateFormData({
      plaidAccessToken: 'mock_access_token',
      plaidAccountId: 'mock_account_id',
      bankName: 'Chase Bank',
      accountMask: '1234',
    })
    
    setTimeout(() => {
      alert('Bank connected successfully! (Mock)');
      onNext()
    }, 1000)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Connect Your Bank Account</h2>
      <p className="text-gray-600 mb-8">
        We use Plaid to securely connect to your bank account. This helps us verify your income and financial stability.
      </p>

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
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 mb-8 text-center">
          <div className="text-blue-600 text-5xl mb-4">🏦</div>
          <h3 className="text-lg font-semibold mb-2">Secure Bank Connection</h3>
          <p className="text-gray-600 mb-6">
            Your credentials are never stored. Plaid uses bank-level encryption.
          </p>
          
          <button
            type="button"
            onClick={handleConnect}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Connect Bank Account
          </button>
          
          <div className="mt-6 text-sm text-gray-500">
            <p className="mb-2">✓ 256-bit SSL encryption</p>
            <p className="mb-2">✓ Read-only access</p>
            <p>✓ Trusted by 8,000+ financial apps</p>
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
            className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  )
}
