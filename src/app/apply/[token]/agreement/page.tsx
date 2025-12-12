'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'

interface SelectedOffer {
  id: string
  type?: 'bnpl' | 'installment'
  name?: string
  termWeeks?: number
  termMonths?: number
  paymentFrequency?: 'biweekly' | 'monthly'
  apr: number
  originationFee: number
  downPaymentPercent?: number
  downPaymentAmount?: number
  installmentAmount?: number
  numberOfPayments?: number
  totalAmount: number
  loanAmount?: number
  // Legacy fields
  monthlyPayment?: number
  downPayment?: number
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

      router.push(`/apply/${token}/success`)
    } catch (err) {
      alert('Failed to sign agreement. Please try again.')
    } finally {
      setSigning(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <div className="text-gray-600">Loading your agreement...</div>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-navy mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Agreement not found'}</p>
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-teal text-white rounded-lg hover:bg-teal/90"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const { offer, customer, job } = data
  const principalAmount = offer.loanAmount || job.estimateAmount
  const isBNPL = offer.type === 'bnpl'
  const paymentAmount = offer.installmentAmount || offer.monthlyPayment || 0
  const downPayment = offer.downPaymentAmount || offer.downPayment || 0
  const numberOfPayments = offer.numberOfPayments || offer.termMonths || 0
  const paymentFrequency = offer.paymentFrequency || 'monthly'
  
  const firstPaymentDate = new Date()
  if (paymentFrequency === 'biweekly') {
    firstPaymentDate.setDate(firstPaymentDate.getDate() + 14)
  } else {
    firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1)
  }

  const interestAmount = Number(offer.totalAmount) - principalAmount

  return (
    <div className="min-h-screen bg-warm-white py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-navy font-display mb-2">
            Supr<span className="text-teal">Fi</span>
          </h1>
          <p className="text-gray-600">Review and sign your {isBNPL ? 'payment' : 'financing'} agreement</p>
        </div>

        {/* Payment Summary Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-teal/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-navy">Payment Summary</h2>
              <p className="text-sm text-gray-500">{offer.name || `${offer.termMonths} Month Plan`}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-teal/5 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 mb-1">Service Amount</div>
              <div className="text-xl font-bold text-navy">${principalAmount.toLocaleString()}</div>
            </div>
            {downPayment > 0 && (
              <div className="bg-teal/5 rounded-xl p-4 text-center">
                <div className="text-xs text-gray-500 mb-1">Due Today</div>
                <div className="text-xl font-bold text-navy">${downPayment.toFixed(2)}</div>
              </div>
            )}
            <div className="bg-teal/5 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 mb-1">
                {numberOfPayments} Payment{numberOfPayments > 1 ? 's' : ''} of
              </div>
              <div className="text-xl font-bold text-navy">${paymentAmount.toFixed(2)}</div>
            </div>
            <div className="bg-teal/5 rounded-xl p-4 text-center">
              <div className="text-xs text-gray-500 mb-1">APR</div>
              <div className={`text-xl font-bold ${offer.apr === 0 ? 'text-teal' : 'text-navy'}`}>
                {offer.apr === 0 ? '0%' : `${Number(offer.apr).toFixed(2)}%`}
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total You'll Pay</span>
              <span className="font-bold text-navy">${Number(offer.totalAmount).toFixed(2)}</span>
            </div>
            {interestAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Finance Charge (Interest)</span>
                <span className="font-semibold">${interestAmount.toFixed(2)}</span>
              </div>
            )}
            {interestAmount === 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Interest</span>
                <span className="font-semibold text-teal">$0.00 - Interest Free</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">First Payment Due</span>
              <span className="font-semibold">{firstPaymentDate.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Frequency</span>
              <span className="font-semibold capitalize">{paymentFrequency === 'biweekly' ? 'Every 2 Weeks' : 'Monthly'}</span>
            </div>
          </div>
        </div>

        {/* Borrower Info */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-navy/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-navy">Your Information</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Name</div>
              <div className="font-medium text-navy">{customer.firstName} {customer.lastName}</div>
            </div>
            <div>
              <div className="text-gray-500">Email</div>
              <div className="font-medium text-navy">{customer.email}</div>
            </div>
            <div className="md:col-span-2">
              <div className="text-gray-500">Address</div>
              <div className="font-medium text-navy">
                {customer.addressLine1}, {customer.city}, {customer.state} {customer.postalCode}
              </div>
            </div>
          </div>
        </div>

        {/* Terms & Conditions */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-navy/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-navy">Terms & Conditions</h2>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 h-48 overflow-y-auto text-sm text-gray-700 mb-4">
            {isBNPL ? (
              <>
                <p className="mb-3">
                  <strong>BUY NOW, PAY LATER AGREEMENT</strong>
                </p>
                <p className="mb-3">
                  This is a payment plan agreement with 0% interest. By signing below, you agree to pay 
                  the total amount of ${principalAmount.toLocaleString()} in {numberOfPayments + (downPayment > 0 ? 1 : 0)} payments.
                </p>
                {downPayment > 0 && (
                  <p className="mb-3">
                    <strong>DOWN PAYMENT:</strong> A down payment of ${downPayment.toFixed(2)} is due today 
                    to confirm your service booking.
                  </p>
                )}
                <p className="mb-3">
                  <strong>PAYMENT SCHEDULE:</strong> {numberOfPayments} payments of ${paymentAmount.toFixed(2)} will be 
                  automatically debited from your bank account {paymentFrequency === 'biweekly' ? 'every 2 weeks' : 'monthly'}, 
                  starting {firstPaymentDate.toLocaleDateString()}.
                </p>
              </>
            ) : (
              <>
                <p className="mb-3">
                  <strong>TRUTH IN LENDING DISCLOSURE</strong>
                </p>
                <p className="mb-3">
                  This is a closed-end credit agreement. By signing below, you agree to repay the 
                  Principal Amount of ${principalAmount.toLocaleString()} plus interest at an Annual Percentage 
                  Rate (APR) of {Number(offer.apr).toFixed(2)}% over {numberOfPayments} monthly payments 
                  of ${paymentAmount.toFixed(2)} each.
                </p>
              </>
            )}
            <p className="mb-3">
              <strong>LATE PAYMENTS:</strong> Late payments may result in a late fee of 
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
            <p>
              <strong>ELECTRONIC COMMUNICATIONS:</strong> By signing electronically, you consent to 
              receive all communications regarding this agreement electronically.
            </p>
          </div>
        </div>

        {/* Consents */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-teal/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-navy">Required Consents</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={consents.reviewedTerms}
                onChange={(e) => setConsents({ ...consents, reviewedTerms: e.target.checked })}
                className="mt-1 mr-3 h-5 w-5 text-teal rounded border-gray-300 focus:ring-teal"
              />
              <span className="text-sm text-gray-700">
                I have read and understand the payment terms, including the {offer.apr === 0 ? '0% APR' : `APR of ${Number(offer.apr).toFixed(2)}%`}, 
                {' '}payment amount of ${paymentAmount.toFixed(2)}, and total repayment 
                amount of ${Number(offer.totalAmount).toFixed(2)}.
              </span>
            </label>

            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={consents.agreeToPayments}
                onChange={(e) => setConsents({ ...consents, agreeToPayments: e.target.checked })}
                className="mt-1 mr-3 h-5 w-5 text-teal rounded border-gray-300 focus:ring-teal"
              />
              <span className="text-sm text-gray-700">
                I agree to make {numberOfPayments} {paymentFrequency === 'biweekly' ? 'bi-weekly' : 'monthly'} payments 
                starting {firstPaymentDate.toLocaleDateString()} and authorize SuprFi to debit my bank account for scheduled payments.
              </span>
            </label>

            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={consents.electronicSignature}
                onChange={(e) => setConsents({ ...consents, electronicSignature: e.target.checked })}
                className="mt-1 mr-3 h-5 w-5 text-teal rounded border-gray-300 focus:ring-teal"
              />
              <span className="text-sm text-gray-700">
                I agree that my electronic signature below has the same legal effect as a handwritten 
                signature and constitutes my acceptance of this agreement.
              </span>
            </label>
          </div>
        </div>

        {/* Electronic Signature */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-navy/10 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-navy" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-navy">Electronic Signature</h2>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Please type your full legal name below to sign this agreement.
          </p>
          <input
            type="text"
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder={`${customer.firstName} ${customer.lastName}`}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal focus:ring-2 focus:ring-teal/20 text-xl"
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
            className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Back to Offers
          </button>
          <button
            onClick={handleSign}
            disabled={!allConsentsChecked || !signatureValid || signing}
            className="flex-1 px-6 py-3 bg-teal text-white rounded-xl font-semibold hover:bg-teal/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {signing ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Sign & Accept Agreement'
            )}
          </button>
        </div>

        {/* Help */}
        <div className="text-center mt-8 text-sm text-gray-500">
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
