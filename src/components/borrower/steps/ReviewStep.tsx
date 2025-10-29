'use client'

import type { FormData } from '../ApplicationForm'

interface ReviewStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  job: {
    estimateAmount: number
    serviceType?: string | null
  }
  onSubmit: () => void
  onBack: () => void
  isSubmitting: boolean
}

export function ReviewStep({ formData, updateFormData, job, onSubmit, onBack, isSubmitting }: ReviewStepProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.creditCheckConsent || !formData.termsAccepted || !formData.eSignConsent) {
      alert('Please accept all required consents to continue.')
      return
    }
    
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Review & Submit</h2>
      <p className="text-gray-600 mb-8">
        Please review your information and provide your consent to submit the application.
      </p>

      {/* Loan Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Financing Request</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Service Type:</span>
            <span className="font-medium">{job.serviceType || 'Home Service'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Estimated Amount:</span>
            <span className="font-medium text-lg">${job.estimateAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Personal Info Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <h3 className="font-semibold text-gray-900 mb-4">Your Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Name</div>
            <div className="font-medium">{formData.firstName} {formData.lastName}</div>
          </div>
          <div>
            <div className="text-gray-600">Email</div>
            <div className="font-medium">{formData.email}</div>
          </div>
          <div>
            <div className="text-gray-600">Phone</div>
            <div className="font-medium">{formData.phone}</div>
          </div>
          <div>
            <div className="text-gray-600">Date of Birth</div>
            <div className="font-medium">{formData.dateOfBirth}</div>
          </div>
          <div className="md:col-span-2">
            <div className="text-gray-600">Address</div>
            <div className="font-medium">
              {formData.addressLine1}
              {formData.addressLine2 && `, ${formData.addressLine2}`}
              <br />
              {formData.city}, {formData.state} {formData.postalCode}
            </div>
          </div>
        </div>
      </div>

      {/* Verification Status */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-8">
        <div className="space-y-3">
          <div className="flex items-center">
            <span className="text-green-600 text-xl mr-3">✓</span>
            <span className="text-gray-900">Bank account connected</span>
          </div>
          <div className="flex items-center">
            <span className="text-green-600 text-xl mr-3">✓</span>
            <span className="text-gray-900">Identity verified</span>
          </div>
        </div>
      </div>

      {/* Consents */}
      <div className="space-y-4 mb-8">
        <div className="flex items-start">
          <input
            type="checkbox"
            id="credit-consent"
            checked={formData.creditCheckConsent}
            onChange={(e) => updateFormData({ creditCheckConsent: e.target.checked })}
            className="mt-1 mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="credit-consent" className="text-sm text-gray-700 cursor-pointer">
            I authorize FlowPay to obtain my credit report for underwriting purposes. 
            This will be a <strong>soft pull</strong> and will not affect my credit score.
          </label>
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            id="terms-consent"
            checked={formData.termsAccepted}
            onChange={(e) => updateFormData({ termsAccepted: e.target.checked })}
            className="mt-1 mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="terms-consent" className="text-sm text-gray-700 cursor-pointer">
            I agree to the <a href="#" className="text-blue-600 underline">Terms of Service</a> and{' '}
            <a href="#" className="text-blue-600 underline">Privacy Policy</a>.
          </label>
        </div>

        <div className="flex items-start">
          <input
            type="checkbox"
            id="esign-consent"
            checked={formData.eSignConsent}
            onChange={(e) => updateFormData({ eSignConsent: e.target.checked })}
            className="mt-1 mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
          />
          <label htmlFor="esign-consent" className="text-sm text-gray-700 cursor-pointer">
            I consent to receive documents and notices electronically and agree to use electronic signatures.
          </label>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          ← Back
        </button>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </>
          ) : (
            'Submit Application ✓'
          )}
        </button>
      </div>
    </form>
  )
}
