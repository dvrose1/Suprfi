'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'

interface SelectedOffer {
  id: string
  termMonths: number
  apr: number
  monthlyPayment: number
  downPayment: number
  originationFee: number
  totalAmount: number
}

interface AgreementData {
  offer: SelectedOffer
  customer: {
    firstName: string
    lastName: string
    email: string
    addressLine1: string
    city: string
    state: string
    postalCode: string
  }
  job: {
    estimateAmount: number
    serviceType: string | null
  }
  applicationId: string
}

export default function AgreementPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = params.token as string
  const offerId = searchParams.get('offer')

  const [data, setData] = useState<AgreementData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [signing, setSigning] = useState(false)

  // Consent checkboxes
  const [consents, setConsents] = useState({
    reviewedTerms: false,
    agreeToPayments: false,
    electronicSignature: false,
  })

  const [signature, setSignature] = useState('')

  useEffect(() => {
    async function fetchAgreementData() {
      if (!offerId) {
        setError('No offer selected')
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/v1/borrower/${token}/agreement?offer=${offerId}`)
        const result = await response.json()

        if (!response.ok) {
          setError(result.error || 'Failed to load agreement')
          return
        }

        setData(result)
      } catch (err) {
        setError('Failed to load agreement details')
      } finally {
        setLoading(false)
      }
    }

    fetchAgreementData()
  }, [token, offerId])

  const allConsentsChecked = consents.reviewedTerms && consents.agreeToPayments && consents.electronicSignature
  const signatureValid = signature.trim().length >= 2

  const handleSign = async () => {
    if (!allConsentsChecked || !signatureValid || !data) return

    setSigning(true)
    try {
      const response = await fetch(`/api/v1/borrower/${token}/agreement/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offerId: data.offer.id,
          signature: signature.trim(),
          consents: {
            reviewedTerms: true,
            agreeToPayments: true,
            electronicSignature: true,
            signedAt: new Date().toISOString(),
          },
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        alert(result.error || 'Failed to sign agreement')
        return
      }

      // Redirect to success page
      router.push(`/apply/${token}/success`)
    } catch (err) {
      alert('Failed to sign agreement. Please try again.')
    } finally {
      setSigning(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">📄</div>
          <div className="text-gray-600">Loading your agreement...</div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Agreement not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const { offer, customer, job } = data
  const principalAmount = job.estimateAmount
  const firstPaymentDate = new Date()
  firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1)

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Loan Agreement</h1>
          <p className="text-gray-600">Please review and sign your financing agreement</p>
        </div>

        {/* Loan Summary Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">💰</span> Loan Summary
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-sm text-blue-600 mb-1">Loan Amount</div>
              <div className="text-2xl font-bold text-blue-900">${principalAmount.toLocaleString()}</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-sm text-green-600 mb-1">Monthly Payment</div>
              <div className="text-2xl font-bold text-green-900">${Number(offer.monthlyPayment).toFixed(2)}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-sm text-purple-600 mb-1">APR</div>
              <div className="text-2xl font-bold text-purple-900">{Number(offer.apr).toFixed(2)}%</div>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-sm text-orange-600 mb-1">Term</div>
              <div className="text-2xl font-bold text-orange-900">{offer.termMonths} mo</div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total of Payments</span>
              <span className="font-semibold">${Number(offer.totalAmount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Finance Charge (Interest)</span>
              <span className="font-semibold">${(Number(offer.totalAmount) - principalAmount).toFixed(2)}</span>
            </div>
            {Number(offer.originationFee) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Origination Fee</span>
                <span className="font-semibold">${Number(offer.originationFee).toFixed(2)}</span>
              </div>
            )}
            {Number(offer.downPayment) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Down Payment</span>
                <span className="font-semibold">${Number(offer.downPayment).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">First Payment Due</span>
              <span className="font-semibold">{firstPaymentDate.toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Borrower Info */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">👤</span> Borrower Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600">Name</div>
              <div className="font-medium">{customer.firstName} {customer.lastName}</div>
            </div>
            <div>
              <div className="text-gray-600">Email</div>
              <div className="font-medium">{customer.email}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-gray-600">Address</div>
              <div className="font-medium">
                {customer.addressLine1}, {customer.city}, {customer.state} {customer.postalCode}
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📋</span> Terms & Conditions
          </h2>
          <div className="bg-gray-50 rounded-lg p-4 h-48 overflow-y-auto text-sm text-gray-700 mb-4">
            <p className="mb-3">
              <strong>TRUTH IN LENDING DISCLOSURE</strong>
            </p>
            <p className="mb-3">
              This is a closed-end credit agreement. By signing below, you agree to repay the 
              Principal Amount of ${principalAmount.toLocaleString()} plus interest at an Annual Percentage 
              Rate (APR) of {Number(offer.apr).toFixed(2)}% over {offer.termMonths} monthly payments 
              of ${Number(offer.monthlyPayment).toFixed(2)} each.
            </p>
            <p className="mb-3">
              <strong>PAYMENT TERMS:</strong> Payments are due on the same day each month, beginning 
              {' '}{firstPaymentDate.toLocaleDateString()}. Late payments may result in a late fee of 
              $25 or 5% of the payment amount, whichever is greater.
            </p>
            <p className="mb-3">
              <strong>PREPAYMENT:</strong> You may prepay all or part of the unpaid balance at any 
              time without penalty.
            </p>
            <p className="mb-3">
              <strong>DEFAULT:</strong> If you fail to make a payment when due, we may declare the 
              entire unpaid balance immediately due and payable.
            </p>
            <p className="mb-3">
              <strong>GOVERNING LAW:</strong> This agreement is governed by the laws of the state 
              where the services are performed.
            </p>
            <p>
              <strong>ELECTRONIC COMMUNICATIONS:</strong> By signing electronically, you consent to 
              receive all communications regarding this loan electronically.
            </p>
          </div>
        </div>

        {/* Consents */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">✅</span> Required Consents
          </h2>
          <div className="space-y-4">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={consents.reviewedTerms}
                onChange={(e) => setConsents({ ...consents, reviewedTerms: e.target.checked })}
                className="mt-1 mr-3 h-5 w-5 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">
                I have read and understand the loan terms, including the APR of {Number(offer.apr).toFixed(2)}%, 
                monthly payment of ${Number(offer.monthlyPayment).toFixed(2)}, and total repayment 
                amount of ${Number(offer.totalAmount).toFixed(2)}.
              </span>
            </label>

            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={consents.agreeToPayments}
                onChange={(e) => setConsents({ ...consents, agreeToPayments: e.target.checked })}
                className="mt-1 mr-3 h-5 w-5 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">
                I agree to make {offer.termMonths} monthly payments starting {firstPaymentDate.toLocaleDateString()} 
                and authorize SuprFi to debit my bank account for scheduled payments.
              </span>
            </label>

            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={consents.electronicSignature}
                onChange={(e) => setConsents({ ...consents, electronicSignature: e.target.checked })}
                className="mt-1 mr-3 h-5 w-5 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">
                I agree that my electronic signature below has the same legal effect as a handwritten 
                signature and constitutes my acceptance of this loan agreement.
              </span>
            </label>
          </div>
        </div>

        {/* Electronic Signature */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">✍️</span> Electronic Signature
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Please type your full legal name below to sign this agreement.
          </p>
          <input
            type="text"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder={`${customer.firstName} ${customer.lastName}`}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-xl font-signature"
            style={{ fontFamily: 'cursive' }}
          />
          <p className="text-xs text-gray-500 mt-2">
            By typing your name, you are signing this agreement electronically on {new Date().toLocaleDateString()}.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.back()}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            ← Back to Offers
          </button>
          <button
            onClick={handleSign}
            disabled={!allConsentsChecked || !signatureValid || signing}
            className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {signing ? 'Processing...' : '✓ Sign & Accept Loan'}
          </button>
        </div>

        {/* Help */}
        <div className="text-center mt-8 text-sm text-gray-600">
          <p>Questions? Contact us at support@suprfi.com or 1-800-SUPRFI</p>
        </div>
      </div>
    </div>
  )
}
