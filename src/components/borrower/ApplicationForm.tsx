'use client'

import { useState } from 'react'
import { PersonalInfoStep } from './steps/PersonalInfoStep'
import { BankLinkStep } from './steps/BankLinkStep'
import { KYCStep } from './steps/KYCStep'
import { ReviewStep } from './steps/ReviewStep'

interface ApplicationFormProps {
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    addressLine1?: string | null
    city?: string | null
    state?: string | null
    postalCode?: string | null
  }
  job: {
    id: string
    estimateAmount: number
    serviceType?: string | null
  }
  applicationId: string
  token: string
}

export interface FormData {
  // Personal Info
  firstName: string
  lastName: string
  email: string
  phone: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  postalCode: string
  dateOfBirth: string
  ssn: string
  
  // Bank Info
  plaidAccessToken?: string
  plaidAccountId?: string
  bankName?: string
  accountMask?: string
  
  // KYC Info
  personaInquiryId?: string
  kycStatus?: string
  
  // Consent
  creditCheckConsent: boolean
  termsAccepted: boolean
  eSignConsent: boolean
}

const steps = [
  { id: 1, name: 'Personal Information', description: 'Confirm your details' },
  { id: 2, name: 'Bank Account', description: 'Connect securely' },
  { id: 3, name: 'Identity Verification', description: 'Quick KYC check' },
  { id: 4, name: 'Review & Sign', description: 'Final approval' },
]

export function ApplicationForm({ customer, job, applicationId, token }: ApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    // Pre-fill from customer data
    firstName: customer.firstName,
    lastName: customer.lastName,
    email: customer.email,
    phone: customer.phone,
    addressLine1: customer.addressLine1 || '',
    addressLine2: '',
    city: customer.city || '',
    state: customer.state || '',
    postalCode: customer.postalCode || '',
    dateOfBirth: '',
    ssn: '',
    
    creditCheckConsent: false,
    termsAccepted: false,
    eSignConsent: false,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const goToNextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    
    try {
      console.log('📤 Submitting application...')
      
      // Call submission API
      const response = await fetch(`/api/v1/borrower/${token}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Submission failed')
      }

      console.log('✅ Application submitted successfully:', result)
      
      // Redirect to success page with offers
      window.location.href = `/apply/${token}/offers?decision=${result.decision.id}`
      
    } catch (error) {
      console.error('❌ Error submitting application:', error)
      alert(`Failed to submit application: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex-1 text-center ${
                step.id === currentStep
                  ? 'text-blue-600 font-semibold'
                  : step.id < currentStep
                  ? 'text-green-600'
                  : 'text-gray-400'
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    step.id === currentStep
                      ? 'bg-blue-600 text-white'
                      : step.id < currentStep
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {step.id < currentStep ? '✓' : step.id}
                </div>
              </div>
              <div className="hidden md:block text-xs">{step.name}</div>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-lg shadow-xl p-8">
        {/* Step Content */}
        {currentStep === 1 && (
          <PersonalInfoStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={goToNextStep}
          />
        )}

        {currentStep === 2 && (
          <BankLinkStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        )}

        {currentStep === 3 && (
          <KYCStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={goToNextStep}
            onBack={goToPreviousStep}
          />
        )}

        {currentStep === 4 && (
          <ReviewStep
            formData={formData}
            updateFormData={updateFormData}
            job={job}
            onSubmit={handleSubmit}
            onBack={goToPreviousStep}
            isSubmitting={isSubmitting}
          />
        )}
      </div>

      {/* Security Notice */}
      <div className="mt-6 text-center text-sm text-gray-600">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-green-600">🔒</span>
          <span>256-bit SSL encryption • Your data is secure</span>
        </div>
      </div>
    </div>
  )
}
