'use client'

import type { FormData } from '../ApplicationForm'

interface KYCStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
  onBack: () => void
}

export function KYCStep({ formData, updateFormData, onNext, onBack }: KYCStepProps) {
  const handleVerify = () => {
    // TODO: Integrate Persona in next session
    // For now, simulate verification
    updateFormData({
      personaInquiryId: 'mock_inquiry_id',
      kycStatus: 'verified',
    })
    
    setTimeout(() => {
      alert('Identity verified successfully! (Mock)')
      onNext()
    }, 1000)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Identity Verification</h2>
      <p className="text-gray-600 mb-8">
        We need to verify your identity to comply with federal regulations and protect against fraud.
      </p>

      {formData.kycStatus === 'verified' ? (
        // Already verified
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <div className="text-green-600 text-3xl mr-4">✓</div>
            <div>
              <div className="font-semibold text-gray-900">Identity Verified</div>
              <div className="text-sm text-gray-600">
                Your identity has been successfully verified.
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Not verified yet
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-8 mb-8 text-center">
          <div className="text-purple-600 text-5xl mb-4">🪪</div>
          <h3 className="text-lg font-semibold mb-2">Quick Identity Check</h3>
          <p className="text-gray-600 mb-6">
            You'll be asked to provide a photo ID and take a selfie. This process takes less than 2 minutes.
          </p>
          
          <button
            type="button"
            onClick={handleVerify}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
          >
            Verify Identity
          </button>
          
          <div className="mt-6 text-sm text-gray-500">
            <p className="mb-2">✓ Powered by Persona</p>
            <p className="mb-2">✓ Bank-level security</p>
            <p>✓ Your photos are encrypted</p>
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
        
        {formData.kycStatus === 'verified' && (
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
