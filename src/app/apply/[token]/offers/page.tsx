'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'

interface Offer {
  id: string
  termMonths: number
  apr: number
  monthlyPayment: number
  downPayment: number
  originationFee: number
  totalAmount: number
}

interface Decision {
  id: string
  score: number | null
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
      } catch (err) {
        setError('Failed to load offers')
      } finally {
        setLoading(false)
      }
    }
    
    fetchDecision()
  }, [token, decisionId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">⏳</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Processing Your Application
            </h1>
            <p className="text-gray-600">
              We're reviewing your application. This usually takes just a few moments.
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !decision) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Error Loading Offers
            </h1>
            <p className="text-gray-600">{error || 'Decision not found'}</p>
          </div>
        </div>
      </div>
    )
  }

  const { application, offers } = decision
  const isApproved = decision.decisionStatus === 'approved'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">SuprFi</h1>
          <p className="text-gray-600">Your financing decision is ready</p>
        </div>

        {isApproved ? (
          <>
            {/* Success Banner */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-6 mb-8">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-3xl">✓</span>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Congratulations, {application.customer.firstName}!
              </h2>
              <p className="text-center text-gray-700">
                You've been approved for financing. Choose the plan that works best for you.
              </p>
            </div>

            {/* Credit Score (Mock) */}
            {decision.score && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-600">Your Credit Score</div>
                    <div className="text-3xl font-bold text-gray-900">{decision.score}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Decision ID</div>
                    <div className="text-xs font-mono text-gray-400">{decision.id.slice(0, 12)}...</div>
                  </div>
                </div>
              </div>
            )}

            {/* Financing Offers */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Choose Your Financing Plan
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {offers.map((offer, index) => {
                  const isRecommended = index === 1 // Middle option recommended
                  
                  return (
                    <div
                      key={offer.id}
                      className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                        isRecommended ? 'ring-2 ring-blue-600 relative' : ''
                      }`}
                    >
                      {isRecommended && (
                        <div className="bg-blue-600 text-white text-xs font-bold text-center py-1">
                          RECOMMENDED
                        </div>
                      )}
                      
                      <div className="p-6">
                        <div className="text-center mb-6">
                          <div className="text-sm text-gray-600 mb-1">
                            {offer.termMonths} Month Plan
                          </div>
                          <div className="text-4xl font-bold text-gray-900 mb-1">
                            ${Number(offer.monthlyPayment).toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">per month</div>
                        </div>

                        <div className="space-y-3 mb-6">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">APR</span>
                            <span className="font-semibold">{Number(offer.apr).toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Term Length</span>
                            <span className="font-semibold">{offer.termMonths} months</span>
                          </div>
                          {Number(offer.downPayment) > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Down Payment</span>
                              <span className="font-semibold">${Number(offer.downPayment).toFixed(2)}</span>
                            </div>
                          )}
                          {Number(offer.originationFee) > 0 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Origination Fee</span>
                              <span className="font-semibold">${Number(offer.originationFee).toFixed(2)}</span>
                            </div>
                          )}
                          <div className="pt-3 border-t border-gray-200">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Total Amount</span>
                              <span className="font-bold text-lg">${Number(offer.totalAmount).toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        <button
                          className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                            isRecommended
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                          disabled={selectingOffer !== null}
                          onClick={async () => {
                            setSelectingOffer(offer.id)
                            try {
                              const response = await fetch(`/api/v1/borrower/${token}/offers/select`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ offerId: offer.id }),
                              })
                              const result = await response.json()
                              
                              if (!response.ok) {
                                alert(result.error || 'Failed to select offer')
                                return
                              }
                              
                              // Navigate to agreement page
                              router.push(`/apply/${token}/agreement?offer=${offer.id}`)
                            } catch (err) {
                              alert('Failed to select offer. Please try again.')
                            } finally {
                              setSelectingOffer(null)
                            }
                          }}
                        >
                          {selectingOffer === offer.id ? 'Selecting...' : 'Select This Plan'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-3">What Happens Next?</h4>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start">
                  <span className="font-bold mr-2">1.</span>
                  <span>Choose your financing plan above</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">2.</span>
                  <span>Review and sign your loan agreement</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">3.</span>
                  <span>Work gets scheduled with your service provider</span>
                </li>
                <li className="flex items-start">
                  <span className="font-bold mr-2">4.</span>
                  <span>Funding is sent directly to complete your project</span>
                </li>
              </ol>
            </div>
          </>
        ) : (
          // Declined
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">😔</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Application Under Review
              </h2>
              <p className="text-gray-600">
                We need a bit more time to review your application. Our team will contact you within 24 hours.
              </p>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
              <p className="text-sm text-gray-600">
                Contact our support team at{' '}
                <a href="mailto:support@suprfi.com" className="text-blue-600 underline">
                  support@suprfi.com
                </a>{' '}
                or call 1-800-SUPRFI
              </p>
            </div>
          </div>
        )}

        {/* Support Footer */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>Questions? Contact support@suprfi.com</p>
        </div>
      </div>
    </div>
  )
}
