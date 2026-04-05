// ABOUTME: Agreement review card for in-chat display
// ABOUTME: Fixed legal content with consent checkboxes and e-signature for compliance

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils/format'
import type { ChatOffer } from './ChatOfferCard'

interface CustomerInfo {
  firstName: string
  lastName: string
  email: string
  addressLine1?: string
  city?: string
  state?: string
  postalCode?: string
}

interface ChatAgreementCardProps {
  offer: ChatOffer
  customer: CustomerInfo
  onSign: (signature: string, consents: ConsentState) => void
  isSigning?: boolean
}

interface ConsentState {
  reviewedTerms: boolean
  agreeToPayments: boolean
  electronicSignature: boolean
  signedAt?: string
}

export function ChatAgreementCard({ 
  offer, 
  customer, 
  onSign,
  isSigning 
}: ChatAgreementCardProps) {
  const [consents, setConsents] = useState<ConsentState>({
    reviewedTerms: false,
    agreeToPayments: false,
    electronicSignature: false,
  })
  const [signature, setSignature] = useState('')
  const [showFullTerms, setShowFullTerms] = useState(false)

  const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1]

  const allConsentsChecked = consents.reviewedTerms && consents.agreeToPayments && consents.electronicSignature
  const signatureValid = signature.trim().length >= 2
  const canSign = allConsentsChecked && signatureValid && !isSigning

  const isBNPL = offer.type === 'bnpl'
  const paymentAmount = offer.installmentAmount
  const downPayment = offer.downPaymentAmount
  const numberOfPayments = offer.numberOfPayments
  const paymentFrequency = offer.paymentFrequency

  const firstPaymentDate = new Date()
  if (paymentFrequency === 'biweekly') {
    firstPaymentDate.setDate(firstPaymentDate.getDate() + 14)
  } else {
    firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1)
  }

  const handleSign = () => {
    if (!canSign) return
    onSign(signature.trim(), {
      ...consents,
      signedAt: new Date().toISOString(),
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: easeOutExpo }}
      className="space-y-3"
    >
      {/* Agreement summary card */}
      <div className="bg-white border border-navy/10 rounded-xl overflow-hidden">
        <div className="bg-navy/[0.03] px-4 py-3 border-b border-navy/5">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-navy/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-sm font-semibold text-navy">Payment Agreement</span>
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Plan details */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="text-navy/50 text-xs">Plan</div>
              <div className="font-medium text-navy">{offer.name}</div>
            </div>
            <div>
              <div className="text-navy/50 text-xs">Service Amount</div>
              <div className="font-medium text-navy">{formatCurrency(offer.loanAmount)}</div>
            </div>
            {downPayment > 0 && (
              <div>
                <div className="text-navy/50 text-xs">Due Today</div>
                <div className="font-medium text-navy">{formatCurrency(downPayment)}</div>
              </div>
            )}
            <div>
              <div className="text-navy/50 text-xs">{numberOfPayments} Payments of</div>
              <div className="font-medium text-navy">{formatCurrency(paymentAmount)}</div>
            </div>
            <div>
              <div className="text-navy/50 text-xs">First Payment</div>
              <div className="font-medium text-navy">{firstPaymentDate.toLocaleDateString()}</div>
            </div>
            <div>
              <div className="text-navy/50 text-xs">Total Cost</div>
              <div className={`font-medium ${offer.apr === 0 ? 'text-teal' : 'text-navy'}`}>
                {formatCurrency(offer.totalAmount)}
                {offer.apr === 0 && <span className="text-xs ml-1">(0% interest)</span>}
              </div>
            </div>
          </div>

          {/* View full terms toggle */}
          <button
            onClick={() => setShowFullTerms(!showFullTerms)}
            className="text-xs text-teal hover:underline flex items-center gap-1"
          >
            {showFullTerms ? 'Hide' : 'View'} Full Terms
            <svg className={`w-3 h-3 transition-transform ${showFullTerms ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Full terms (expandable) */}
          {showFullTerms && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-navy/[0.02] rounded-lg p-3 text-xs text-navy/70 max-h-40 overflow-y-auto"
            >
              {isBNPL ? (
                <>
                  <p className="mb-2"><strong>BUY NOW, PAY LATER AGREEMENT</strong></p>
                  <p className="mb-2">
                    This is a payment plan agreement with 0% interest. By signing below, you agree to pay 
                    the total amount of {formatCurrency(offer.loanAmount)} in {numberOfPayments + (downPayment > 0 ? 1 : 0)} payments.
                  </p>
                  {downPayment > 0 && (
                    <p className="mb-2">
                      <strong>DOWN PAYMENT:</strong> {formatCurrency(downPayment)} is due today.
                    </p>
                  )}
                  <p className="mb-2">
                    <strong>PAYMENT SCHEDULE:</strong> {numberOfPayments} payments of {formatCurrency(paymentAmount)} will be 
                    automatically debited {paymentFrequency === 'biweekly' ? 'every 2 weeks' : 'monthly'}, 
                    starting {firstPaymentDate.toLocaleDateString()}.
                  </p>
                </>
              ) : (
                <>
                  <p className="mb-2"><strong>TRUTH IN LENDING DISCLOSURE</strong></p>
                  <p className="mb-2">
                    Principal Amount: {formatCurrency(offer.loanAmount)}. APR: {offer.apr}%. 
                    {numberOfPayments} monthly payments of {formatCurrency(paymentAmount)}. 
                    Total: {formatCurrency(offer.totalAmount)}.
                  </p>
                </>
              )}
              <p className="mb-2">
                <strong>LATE PAYMENTS:</strong> Late fee of $25 or 5% of payment, whichever is greater.
              </p>
              <p className="mb-2">
                <strong>PREPAYMENT:</strong> You may prepay at any time without penalty.
              </p>
              <p>
                <strong>ELECTRONIC COMMUNICATIONS:</strong> You consent to receive all communications electronically.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Consent checkboxes - FIXED LEGAL CONTENT */}
      <div className="bg-white border border-navy/10 rounded-xl p-4 space-y-3">
        <div className="text-xs font-semibold text-navy/50 uppercase tracking-wide">Required Consents</div>
        
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consents.reviewedTerms}
            onChange={(e) => setConsents({ ...consents, reviewedTerms: e.target.checked })}
            className="mt-0.5 h-4 w-4 text-teal rounded border-navy/20 focus:ring-teal/30"
          />
          <span className="text-xs text-navy/70 leading-relaxed">
            I have read and understand the payment terms, including the {offer.apr === 0 ? '0% APR' : `APR of ${offer.apr}%`}, 
            payment amount of {formatCurrency(paymentAmount)}, and total of {formatCurrency(offer.totalAmount)}.
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consents.agreeToPayments}
            onChange={(e) => setConsents({ ...consents, agreeToPayments: e.target.checked })}
            className="mt-0.5 h-4 w-4 text-teal rounded border-navy/20 focus:ring-teal/30"
          />
          <span className="text-xs text-navy/70 leading-relaxed">
            I authorize SuprFi to debit my bank account for {numberOfPayments} {paymentFrequency === 'biweekly' ? 'bi-weekly' : 'monthly'} payments 
            starting {firstPaymentDate.toLocaleDateString()}.
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={consents.electronicSignature}
            onChange={(e) => setConsents({ ...consents, electronicSignature: e.target.checked })}
            className="mt-0.5 h-4 w-4 text-teal rounded border-navy/20 focus:ring-teal/30"
          />
          <span className="text-xs text-navy/70 leading-relaxed">
            I agree that my electronic signature has the same legal effect as a handwritten signature.
          </span>
        </label>
      </div>

      {/* Signature input */}
      <div className="bg-white border border-navy/10 rounded-xl p-4">
        <div className="text-xs font-semibold text-navy/50 uppercase tracking-wide mb-2">Electronic Signature</div>
        <input
          type="text"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder={`Type: ${customer.firstName} ${customer.lastName}`}
          className="w-full px-3 py-2.5 border border-navy/10 rounded-lg text-lg focus:outline-none focus:ring-2 focus:ring-teal/20 focus:border-teal/40"
          style={{ fontFamily: 'cursive' }}
        />
        <p className="text-[10px] text-navy/40 mt-1.5">
          By typing your name, you sign this agreement on {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Sign button */}
      <button
        onClick={handleSign}
        disabled={!canSign}
        className={`w-full py-3 rounded-xl font-semibold transition-all ${
          canSign
            ? 'bg-teal text-white hover:bg-teal/90'
            : 'bg-navy/10 text-navy/40 cursor-not-allowed'
        }`}
      >
        {isSigning ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Signing Agreement...
          </span>
        ) : (
          'Sign & Accept Agreement'
        )}
      </button>

      {!allConsentsChecked && (
        <p className="text-xs text-navy/40 text-center">
          Please check all boxes above to continue
        </p>
      )}
    </motion.div>
  )
}
