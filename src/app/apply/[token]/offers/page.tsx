'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'

interface Offer {
  id: string
  type: 'bnpl' | 'installment'
  name: string
  termWeeks?: number
  termMonths?: number
  paymentFrequency: 'biweekly' | 'monthly'
  apr: number
  originationFee: number
  downPaymentPercent: number
  downPaymentAmount: number
  installmentAmount: number
  numberOfPayments: number
  totalAmount: number
  loanAmount: number
}

interface Decision {
  id: string
  decisionStatus: string
  application: {
    customer: {
      firstName: string
      lastName: string
    }
    job: {
      estimateAmount: number
      serviceType: string | null
    }
  }
  offers: Offer[]
}

function generateOffers(loanAmount: number): Offer[] {
  // Option 1: BNPL - 6 weeks, biweekly payments (RECOMMENDED)
  const bnpl6Week = {
    id: 'bnpl-6-week',
    type: 'bnpl' as const,
    name: 'Pay in 4',
    termWeeks: 6,
    paymentFrequency: 'biweekly' as const,
    apr: 0,
    originationFee: 0,
    downPaymentPercent: 25,
    downPaymentAmount: loanAmount * 0.25,
    installmentAmount: loanAmount * 0.25,
    numberOfPayments: 3, // 3 payments after down payment
    totalAmount: loanAmount,
    loanAmount: loanAmount,
  }

  // Option 2: BNPL - 3 months, monthly payments
  const bnpl3Month = {
    id: 'bnpl-3-month',
    type: 'bnpl' as const,
    name: 'Pay in 4 Monthly',
    termMonths: 3,
    paymentFrequency: 'monthly' as const,
    apr: 0,
    originationFee: 0,
    downPaymentPercent: 25,
    downPaymentAmount: loanAmount * 0.25,
    installmentAmount: loanAmount * 0.25,
    numberOfPayments: 3, // 3 payments after down payment
    totalAmount: loanAmount,
    loanAmount: loanAmount,
  }

  // Option 3: Installment loan - 6 months, 14.99% APR
  const monthlyRate = 0.1499 / 12
  const numPayments = 6
  const monthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
                         (Math.pow(1 + monthlyRate, numPayments) - 1)
  const totalWithInterest = monthlyPayment * numPayments

  const installment6Month = {
    id: 'installment-6-month',
    type: 'installment' as const,
    name: '6 Month Plan',
    termMonths: 6,
    paymentFrequency: 'monthly' as const,
    apr: 14.99,
    originationFee: 0,
    downPaymentPercent: 0,
    downPaymentAmount: 0,
    installmentAmount: monthlyPayment,
    numberOfPayments: 6,
    totalAmount: totalWithInterest,
    loanAmount: loanAmount,
  }

  return [bnpl6Week, bnpl3Month, installment6Month]
}

export default function OffersPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = params.token as string
  const decisionId = searchParams.get('decision')
  
  const [decision, setDecision] = useState<Decision | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectingOffer, setSelectingOffer] = useState<string | null>(null)
  const [offers, setOffers] = useState<Offer[]>([])

  useEffect(() => {
    async function fetchDecision() {
      try {
        const response = await fetch(`/api/v1/borrower/${token}/decision?decision=${decisionId || ''}`)
        const data = await response.json()
        
        if (!response.ok) {
          setError(data.error || 'Failed to load decision')
          return
        }
        
        setDecision(data.decision)
        // Generate offers based on loan amount
        const loanAmount = data.decision.application.job.estimateAmount
        setOffers(generateOffers(loanAmount))
      } catch (err) {
        setError('Failed to load offers')
      } finally {
        setLoading(false)
      }
    }
    
    fetchDecision()
  }, [token, decisionId])

  const handleSelectOffer = async (offer: Offer) => {
    setSelectingOffer(offer.id)
    try {
      const response = await fetch(`/api/v1/borrower/${token}/offers/select`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          offerId: offer.id,
          offerDetails: offer
        }),
      })
      const result = await response.json()
      
      if (!response.ok) {
        alert(result.error || 'Failed to select offer')
        return
      }
      
      router.push(`/apply/${token}/agreement?offer=${offer.id}`)
    } catch (err) {
      alert('Failed to select offer. Please try again.')
    } finally {
      setSelectingOffer(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 border-4 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-navy font-display mb-2">
              Finding Your Best Options
            </h1>
            <p className="text-gray-600">
              We're reviewing your application and preparing personalized offers...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !decision) {
    return (
      <div className="min-h-screen bg-warm-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-navy font-display mb-2">
              Unable to Load Offers
            </h1>
            <p className="text-gray-600">{error || 'Decision not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  const { application } = decision
  const isApproved = decision.decisionStatus === 'approved'
  const loanAmount = application.job.estimateAmount

  if (!isApproved) {
    return (
      <div className="min-h-screen bg-warm-white py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-navy font-display mb-2">
              Supr<span className="text-teal">Fi</span>
            </h1>
          </div>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-navy font-display mb-2">
                Application Under Review
              </h2>
              <p className="text-gray-600">
                We need a bit more time to review your application. Our team will contact you within 24 hours.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-xl p-6">
              <h4 className="font-semibold text-navy mb-2">Need Help?</h4>
              <p className="text-sm text-gray-600">
                Contact our support team at{' '}
                <a href="mailto:support@suprfi.com" className="text-teal font-medium hover:underline">
                  support@suprfi.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-white py-8 sm:py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy font-display mb-2">
            Supr<span className="text-teal">Fi</span>
          </h1>
        </div>

        {/* Approval Banner */}
        <div className="bg-gradient-to-r from-teal to-mint rounded-2xl p-6 sm:p-8 mb-8 text-white">
          <div className="flex items-center justify-center mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2">
            You're Approved, {application.customer.firstName}!
          </h2>
          <p className="text-center text-white/90 text-lg">
            Choose how you'd like to pay for your{' '}
            <span className="font-bold">${loanAmount.toLocaleString()}</span> service
          </p>
        </div>

        {/* Financing Options */}
        <div className="space-y-4 sm:space-y-6 mb-8">
          {offers.map((offer, index) => {
            const isRecommended = index === 0
            const isBNPL = offer.type === 'bnpl'
            
            return (
              <div
                key={offer.id}
                className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all ${
                  isRecommended ? 'ring-2 ring-teal' : ''
                }`}
              >
                {/* Recommended Badge */}
                {isRecommended && (
                  <div className="bg-teal text-white text-sm font-bold text-center py-2 flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    RECOMMENDED - Most Popular Choice
                  </div>
                )}

                <div className="p-6 sm:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                    {/* Left: Plan Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isBNPL ? 'bg-teal/10 text-teal' : 'bg-navy/10 text-navy'
                        }`}>
                          {isBNPL ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-navy">{offer.name}</h3>
                          <p className="text-sm text-gray-500">
                            {isBNPL ? (
                              offer.termWeeks 
                                ? `${offer.termWeeks} weeks • Every 2 weeks`
                                : `${offer.termMonths} months • Monthly`
                            ) : (
                              `${offer.termMonths} months • Monthly`
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Payment Breakdown */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                        {offer.downPaymentAmount > 0 && (
                          <div className="bg-gray-50 rounded-xl p-3">
                            <div className="text-xs text-gray-500 mb-1">Due Today</div>
                            <div className="text-lg font-bold text-navy">
                              ${offer.downPaymentAmount.toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-400">{offer.downPaymentPercent}% down</div>
                          </div>
                        )}
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="text-xs text-gray-500 mb-1">
                            {offer.numberOfPayments} Payment{offer.numberOfPayments > 1 ? 's' : ''} of
                          </div>
                          <div className="text-lg font-bold text-navy">
                            ${offer.installmentAmount.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {offer.paymentFrequency === 'biweekly' ? 'every 2 weeks' : 'per month'}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="text-xs text-gray-500 mb-1">APR</div>
                          <div className={`text-lg font-bold ${offer.apr === 0 ? 'text-teal' : 'text-navy'}`}>
                            {offer.apr === 0 ? '0%' : `${offer.apr}%`}
                          </div>
                          <div className="text-xs text-gray-400">
                            {offer.apr === 0 ? 'Interest-free' : 'Annual rate'}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="text-xs text-gray-500 mb-1">Fees</div>
                          <div className={`text-lg font-bold ${offer.originationFee === 0 ? 'text-teal' : 'text-navy'}`}>
                            ${offer.originationFee}
                          </div>
                          <div className="text-xs text-gray-400">
                            {offer.originationFee === 0 ? 'No fees' : 'Origination'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Total & CTA */}
                    <div className="sm:w-48 sm:text-right sm:border-l sm:border-gray-100 sm:pl-6">
                      <div className="mb-4">
                        <div className="text-sm text-gray-500 mb-1">Total You'll Pay</div>
                        <div className="text-3xl font-bold text-navy">
                          ${offer.totalAmount.toFixed(2)}
                        </div>
                        {offer.totalAmount > offer.loanAmount && (
                          <div className="text-xs text-gray-400 mt-1">
                            ${(offer.totalAmount - offer.loanAmount).toFixed(2)} in interest
                          </div>
                        )}
                        {offer.totalAmount === offer.loanAmount && (
                          <div className="text-xs text-teal font-medium mt-1">
                            No extra cost!
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleSelectOffer(offer)}
                        disabled={selectingOffer !== null}
                        className={`w-full py-3 px-6 rounded-xl font-semibold transition-all ${
                          isRecommended
                            ? 'bg-teal text-white hover:bg-teal/90 shadow-lg shadow-teal/25'
                            : 'bg-navy text-white hover:bg-navy/90'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {selectingOffer === offer.id ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Selecting...
                          </span>
                        ) : (
                          'Select This Plan'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* What Happens Next */}
        <div className="bg-teal/10 rounded-2xl p-6 mb-6">
          <h4 className="font-semibold text-navy mb-4 text-lg">What Happens Next?</h4>
          <ol className="space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-teal text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span>Choose your payment plan above</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-teal text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span>Review and sign your agreement</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-teal text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span>Work gets scheduled with your service provider</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-teal text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
              <span>Payments are automatically collected on schedule</span>
            </li>
          </ol>
        </div>

        {/* Trust Indicators */}
        <div className="bg-white rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="font-semibold text-navy">No Hidden Fees</div>
              <div className="text-sm text-gray-500">What you see is what you pay</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="font-semibold text-navy">Secure & Private</div>
              <div className="text-sm text-gray-500">Bank-level encryption</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-teal/10 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="font-semibold text-navy">Instant Decision</div>
              <div className="text-sm text-gray-500">No waiting around</div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center text-sm text-gray-500">
          <p>Questions? Contact us at{' '}
            <a href="mailto:support@suprfi.com" className="text-teal font-medium hover:underline">
              support@suprfi.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
