'use client'

import { useState, useEffect, useCallback } from 'react'
import type { FormData } from '../ApplicationForm'

// Declare Persona client type
declare global {
  interface Window {
    Persona: any
  }
}

interface KYCStepProps {
  formData: FormData
  updateFormData: (data: Partial<FormData>) => void
  onNext: () => void
  onBack: () => void
}

export function KYCStep({ formData, updateFormData, onNext, onBack }: KYCStepProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [inquiryData, setInquiryData] = useState<any>(null)
  const [personaLoaded, setPersonaLoaded] = useState(false)
  
  // Allow skipping in sandbox/development mode
  const isSandbox = process.env.NEXT_PUBLIC_PERSONA_ENV === 'sandbox' || process.env.NODE_ENV === 'development'

  // Load Persona script
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.Persona) {
      const script = document.createElement('script')
      script.src = 'https://cdn.withpersona.com/dist/persona-v4.6.0.js'
      script.async = true
      script.onload = () => setPersonaLoaded(true)
      script.onerror = () => setError('Failed to load Persona. Please refresh the page.')
      document.body.appendChild(script)

      return () => {
        document.body.removeChild(script)
      }
    } else if (window.Persona) {
      setPersonaLoaded(true)
    }
  }, [])

  // Create inquiry on component mount
  useEffect(() => {
    async function createInquiry() {
      if (formData.kycStatus === 'verified') {
        return // Already verified
      }

      try {
        setLoading(true)
        const urlToken = window.location.pathname.split('/')[2]

        const response = await fetch(`/api/v1/borrower/${urlToken}/persona/create-inquiry`, {
          method: 'POST',
        })

        if (!response.ok) {
          throw new Error('Failed to create identity verification')
        }

        const data = await response.json()
        setInquiryData(data)
      } catch (err) {
        console.error('Error creating inquiry:', err)
        setError('Failed to initialize identity verification. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    createInquiry()
  }, [formData.kycStatus])

  // Handle skipping verification in sandbox mode
  const handleSkipVerification = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const urlToken = window.location.pathname.split('/')[2]
      
      const response = await fetch(`/api/v1/borrower/${urlToken}/persona/skip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to skip verification')
      }

      updateFormData({
        personaInquiryId: 'skipped-sandbox',
        kycStatus: 'verified',
      })

      setTimeout(() => {
        onNext()
      }, 500)
    } catch (err) {
      console.error('Error skipping verification:', err)
      setError('Failed to skip verification. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [updateFormData, onNext])

  const handleVerify = useCallback(() => {
    if (!personaLoaded || !window.Persona) {
      setError('Persona is still loading. Please wait a moment.')
      return
    }

    if (!inquiryData?.inquiryId) {
      setError('Verification session not ready. Please refresh the page.')
      return
    }

    setLoading(true)
    setError(null)

    const client = new window.Persona.Client({
      inquiryId: inquiryData.inquiryId,
      environment: process.env.NEXT_PUBLIC_PERSONA_ENV || 'sandbox',
      onLoad: () => {
        setLoading(false)
        client.open()
      },
      onComplete: async ({ inquiryId, status }: any) => {
        setLoading(true)
        
        try {
          const urlToken = window.location.pathname.split('/')[2]
          
          const response = await fetch(`/api/v1/borrower/${urlToken}/persona/complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inquiryId,
              status,
            }),
          })

          if (!response.ok) {
            throw new Error('Failed to complete verification')
          }

          const data = await response.json()

          if (data.verified) {
            updateFormData({
              personaInquiryId: inquiryId,
              kycStatus: 'verified',
            })

            setTimeout(() => {
              onNext()
            }, 500)
          } else {
            setError('Verification could not be completed. Please try again or contact support.')
          }
        } catch (err) {
          console.error('Error completing verification:', err)
          setError('Failed to complete verification. Please try again.')
        } finally {
          setLoading(false)
        }
      },
      onCancel: ({ inquiryId }: any) => {
        setError('Verification was cancelled. Click "Verify Identity" to try again.')
        setLoading(false)
      },
      onError: (error: any) => {
        console.error('Persona error:', error)
        setError('An error occurred during verification. Please try again.')
        setLoading(false)
      },
    })
  }, [personaLoaded, inquiryData, updateFormData, onNext])


  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Identity Verification</h2>
      <p className="text-gray-600 mb-8">
        We need to verify your identity to comply with federal regulations and protect against fraud.
      </p>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <div className="text-red-600 text-xl mr-3">⚠️</div>
            <div>
              <div className="font-semibold text-red-900">Verification Error</div>
              <div className="text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

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
            You'll be asked to upload a photo of your government-issued ID. This process takes less than 2 minutes.
          </p>
          
          <button
            type="button"
            onClick={handleVerify}
            disabled={loading || !personaLoaded || !inquiryData?.inquiryId}
            className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : !personaLoaded ? 'Initializing...' : !inquiryData?.inquiryId ? 'Preparing...' : 'Verify Identity'}
          </button>
          
          {/* Skip option for sandbox/development */}
          {isSandbox && (
            <div className="mt-4">
              <button
                type="button"
                onClick={handleSkipVerification}
                disabled={loading}
                className="px-6 py-2 text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Skip verification (Sandbox mode)
              </button>
            </div>
          )}
          
          <div className="mt-6 text-sm text-gray-500">
            <p className="mb-2">✓ Powered by Persona</p>
            <p className="mb-2">✓ Bank-level security</p>
            <p>✓ Your ID is encrypted and secure</p>
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
            className="px-8 py-3 bg-teal text-white rounded-lg font-semibold hover:bg-teal/90 transition-colors"
          >
            Continue →
          </button>
        )}
      </div>
    </div>
  )
}
