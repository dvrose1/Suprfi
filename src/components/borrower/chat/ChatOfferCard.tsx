// ABOUTME: Offer selection card for in-chat display
// ABOUTME: Shows financing options with tap-to-select functionality

'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils/format'

export interface ChatOffer {
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

type RecommendationBasis = 'lowest-cost' | 'lowest-monthly'

interface ChatOfferCardProps {
  offers: ChatOffer[]
  onSelectOffer: (offer: ChatOffer) => void
  selectedOfferId?: string | null
  isSelecting?: boolean
  customerName: string
}

export function ChatOfferCard({ 
  offers, 
  onSelectOffer, 
  selectedOfferId,
  isSelecting,
  customerName 
}: ChatOfferCardProps) {
  const [recommendationBasis, setRecommendationBasis] = useState<RecommendationBasis>('lowest-cost')
  const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1]

  // Sort based on user preference
  const sortedOffers = useMemo(() => {
    return [...offers].sort((a, b) => {
      if (recommendationBasis === 'lowest-monthly') {
        return a.installmentAmount - b.installmentAmount
      }
      return a.totalAmount - b.totalAmount
    })
  }, [offers, recommendationBasis])

  const recommendedId = sortedOffers[0]?.id

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: easeOutExpo }}
      className="space-y-3"
    >
      {/* Approval message */}
      <div className="bg-gradient-to-r from-teal to-mint rounded-2xl p-4 text-white">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="font-semibold">You're approved, {customerName}!</p>
            <p className="text-sm text-white/80">Choose your payment plan below</p>
          </div>
        </div>
      </div>

      {/* Recommendation toggle */}
      <div className="bg-white border border-navy/10 rounded-xl p-3">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-navy/60">What matters most?</span>
          <div className="flex bg-navy/[0.04] rounded-lg p-0.5">
            <button
              onClick={() => setRecommendationBasis('lowest-cost')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                recommendationBasis === 'lowest-cost'
                  ? 'bg-teal text-white shadow-sm'
                  : 'text-navy/60 hover:text-navy'
              }`}
            >
              Lowest Total
            </button>
            <button
              onClick={() => setRecommendationBasis('lowest-monthly')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                recommendationBasis === 'lowest-monthly'
                  ? 'bg-teal text-white shadow-sm'
                  : 'text-navy/60 hover:text-navy'
              }`}
            >
              Lowest Monthly
            </button>
          </div>
        </div>
      </div>

      {/* Offer cards */}
      {sortedOffers.map((offer, index) => {
        const isRecommended = offer.id === recommendedId
        const isSelected = offer.id === selectedOfferId
        const isBNPL = offer.type === 'bnpl'

        return (
          <motion.div
            key={offer.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: easeOutExpo, delay: index * 0.1 }}
            className={`bg-white border-2 rounded-xl overflow-hidden transition-all ${
              isSelected 
                ? 'border-teal ring-2 ring-teal/20' 
                : isRecommended 
                  ? 'border-teal/50' 
                  : 'border-navy/10'
            }`}
          >
            {/* Recommended badge */}
            {isRecommended && !isSelected && (
              <div className="bg-teal text-white text-xs font-semibold text-center py-1.5 flex items-center justify-center gap-1">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {recommendationBasis === 'lowest-cost' ? 'LOWEST TOTAL COST' : 'LOWEST MONTHLY'}
              </div>
            )}

            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-navy">{offer.name}</h4>
                  <p className="text-xs text-navy/50">
                    {isBNPL 
                      ? offer.termWeeks 
                        ? `${offer.termWeeks} weeks` 
                        : `${offer.termMonths} months`
                      : `${offer.termMonths} months`
                    } · {offer.paymentFrequency === 'biweekly' ? 'Every 2 weeks' : 'Monthly'}
                  </p>
                </div>
                <div className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                  offer.apr === 0 ? 'bg-teal/10 text-teal' : 'bg-navy/5 text-navy'
                }`}>
                  {offer.apr === 0 ? '0% APR' : `${offer.apr}% APR`}
                </div>
              </div>

              {/* Payment breakdown */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                {offer.downPaymentAmount > 0 && (
                  <div className="bg-navy/[0.03] rounded-lg p-2 text-center">
                    <div className="text-[10px] text-navy/50 uppercase">Today</div>
                    <div className="text-sm font-semibold text-navy">{formatCurrency(offer.downPaymentAmount)}</div>
                  </div>
                )}
                <div className="bg-navy/[0.03] rounded-lg p-2 text-center">
                  <div className="text-[10px] text-navy/50 uppercase">{offer.numberOfPayments}x</div>
                  <div className="text-sm font-semibold text-navy">{formatCurrency(offer.installmentAmount)}</div>
                </div>
                <div className="bg-navy/[0.03] rounded-lg p-2 text-center">
                  <div className="text-[10px] text-navy/50 uppercase">Total</div>
                  <div className={`text-sm font-semibold ${offer.apr === 0 ? 'text-teal' : 'text-navy'}`}>
                    {formatCurrency(offer.totalAmount)}
                  </div>
                </div>
              </div>

              {/* Select button */}
              <button
                onClick={() => onSelectOffer(offer)}
                disabled={isSelecting}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-teal text-white'
                    : 'bg-navy/5 text-navy hover:bg-navy/10'
                } disabled:opacity-50`}
              >
                {isSelecting && isSelected ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Selecting...
                  </span>
                ) : isSelected ? (
                  <span className="flex items-center justify-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Selected
                  </span>
                ) : (
                  'Select This Plan'
                )}
              </button>
            </div>
          </motion.div>
        )
      })}

      {/* Help text */}
      <p className="text-xs text-navy/40 text-center pt-1">
        Tap a plan to select, or ask me any questions
      </p>
    </motion.div>
  )
}
