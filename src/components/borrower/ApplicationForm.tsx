'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { PersonalInfoStep } from './steps/PersonalInfoStep'
import { BankLinkStep } from './steps/BankLinkStep'
import { KYCStep } from './steps/KYCStep'
import { ReviewStep } from './steps/ReviewStep'
import { BorrowerAgentChat } from './BorrowerAgentChat'
import { transitions, layoutClasses } from '@/lib/animations'

type ApplicationMode = 'selector' | 'chat' | 'form'

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
  const [mode, setMode] = useState<ApplicationMode>('selector')
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
  const [direction, setDirection] = useState(1) // 1 = forward, -1 = back
  const prefersReducedMotion = useReducedMotion()

  const updateFormData = (data: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...data }))
  }

  const goToNextStep = () => {
    if (currentStep < steps.length) {
      setDirection(1)
      setCurrentStep(currentStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setDirection(-1)
      setCurrentStep(currentStep - 1)
    }
  }

  // Step transition variants
  const stepVariants = {
    enter: (direction: number) => ({
      x: prefersReducedMotion ? 0 : direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: prefersReducedMotion ? 0 : direction > 0 ? -50 : 50,
      opacity: 0,
    }),
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

  // Mode selector - let user choose between chat and form
  if (mode === 'selector') {
    return (
      <div className="max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h2 className="text-2xl font-bold text-navy text-center mb-2">
            How would you like to apply?
          </h2>
          <p className="text-medium-gray text-center mb-8">
            Choose the experience that works best for you
          </p>
          
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Chat Option */}
            <button
              onClick={() => setMode('chat')}
              className="group p-6 border-2 border-gray-200 rounded-xl hover:border-teal transition-all duration-200 text-left"
            >
              <div className="w-12 h-12 rounded-full bg-teal/10 flex items-center justify-center mb-4 group-hover:bg-teal/20 transition-colors">
                <svg className="w-6 h-6 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="font-semibold text-navy mb-2">Chat with assistant</h3>
              <p className="text-sm text-medium-gray">
                Answer questions one at a time with help along the way. Great if you have questions.
              </p>
              <div className="mt-4 flex items-center text-teal text-sm font-medium">
                <span>Start chatting</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
            
            {/* Form Option */}
            <button
              onClick={() => setMode('form')}
              className="group p-6 border-2 border-gray-200 rounded-xl hover:border-teal transition-all duration-200 text-left"
            >
              <div className="w-12 h-12 rounded-full bg-mint/10 flex items-center justify-center mb-4 group-hover:bg-mint/20 transition-colors">
                <svg className="w-6 h-6 text-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-semibold text-navy mb-2">Fill out form</h3>
              <p className="text-sm text-medium-gray">
                See all fields at once and complete at your own pace. Best if you know what to expect.
              </p>
              <div className="mt-4 flex items-center text-teal text-sm font-medium">
                <span>Go to form</span>
                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>
          
          <p className="text-xs text-medium-gray/60 text-center mt-6">
            Both options collect the same information. You can switch anytime.
          </p>
        </motion.div>
      </div>
    )
  }

  // Chat mode
  if (mode === 'chat') {
    return (
      <div className="max-w-2xl mx-auto px-4">
        <BorrowerAgentChat
          customer={customer}
          job={job}
          applicationId={applicationId}
          token={token}
          onSwitchToForm={() => setMode('form')}
          formData={formData}
          updateFormData={updateFormData}
        />
      </div>
    )
  }

  // Form mode (original)
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0">
      {/* Mode switcher */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setMode('chat')}
          className="text-sm text-teal hover:text-teal/80 transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Switch to chat
        </button>
      </div>

      {/* Progress Bar with better visual hierarchy */}
      <div className="mb-8 sm:mb-10">
        <div className="flex justify-between mb-3">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`flex-1 text-center relative ${
                step.id === currentStep
                  ? 'text-teal font-semibold'
                  : step.id < currentStep
                  ? 'text-mint'
                  : 'text-gray-400'
              }`}
            >
              {/* Connector line between steps */}
              {index > 0 && (
                <div 
                  className={`absolute top-3 sm:top-4 right-1/2 w-full h-0.5 -z-10 ${
                    step.id <= currentStep ? 'bg-teal' : 'bg-gray-200'
                  }`} 
                />
              )}
              <div className="flex items-center justify-center mb-2">
                <div
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm relative z-10 ${
                    step.id === currentStep
                      ? 'bg-teal text-white ring-4 ring-teal/20'
                      : step.id < currentStep
                      ? 'bg-mint text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step.id < currentStep ? '✓' : step.id}
                </div>
              </div>
              <div className="hidden sm:block text-xs leading-tight">{step.name}</div>
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden mt-4">
          <motion.div
            className="bg-gradient-to-r from-teal to-mint h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
          />
        </div>
        <div className="text-center mt-2">
          <span className="text-xs text-medium-gray">Step {currentStep} of {steps.length}</span>
        </div>
      </div>

      {/* Main Form Card */}
      <motion.div 
        className={`${layoutClasses.formCard} shadow-xl`}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transitions.entrance}
      >
        {/* Step Content */}
        <AnimatePresence mode="wait" custom={direction}>
          {currentStep === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transitions.normal}
            >
              <PersonalInfoStep
                formData={formData}
                updateFormData={updateFormData}
                onNext={goToNextStep}
              />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transitions.normal}
            >
              <BankLinkStep
                formData={formData}
                updateFormData={updateFormData}
                onNext={goToNextStep}
                onBack={goToPreviousStep}
              />
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transitions.normal}
            >
              <KYCStep
                formData={formData}
                updateFormData={updateFormData}
                onNext={goToNextStep}
                onBack={goToPreviousStep}
              />
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={transitions.normal}
            >
              <ReviewStep
                formData={formData}
                updateFormData={updateFormData}
                job={job}
                onSubmit={handleSubmit}
                onBack={goToPreviousStep}
                isSubmitting={isSubmitting}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Security Notice */}
      <div className="mt-6 sm:mt-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/50 rounded-full border border-gray-100">
          <svg className="w-4 h-4 text-mint" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
          <span className="text-xs sm:text-sm text-medium-gray">256-bit SSL encryption • Your data is secure</span>
        </div>
      </div>
    </div>
  )
}
