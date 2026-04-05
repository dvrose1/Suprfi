// ABOUTME: Success confirmation card for in-chat display
// ABOUTME: Shows confirmation details after agreement is signed

'use client'

import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils/format'
import type { ChatOffer } from './ChatOfferCard'

interface ChatSuccessCardProps {
  offer: ChatOffer
  customerEmail: string
  confirmationNumber: string
  onDownloadAgreement?: () => void
  onViewSchedule?: () => void
}

export function ChatSuccessCard({ 
  offer, 
  customerEmail,
  confirmationNumber,
  onDownloadAgreement,
  onViewSchedule
}: ChatSuccessCardProps) {
  const easeOutExpo: [number, number, number, number] = [0.16, 1, 0.3, 1]

  const firstPaymentDate = new Date()
  if (offer.paymentFrequency === 'biweekly') {
    firstPaymentDate.setDate(firstPaymentDate.getDate() + 14)
  } else {
    firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: easeOutExpo }}
      className="space-y-3"
    >
      {/* Success header */}
      <div className="bg-gradient-to-r from-teal to-mint rounded-xl p-5 text-white text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.4, ease: easeOutExpo, delay: 0.1 }}
          className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
        <h3 className="text-xl font-bold mb-1">Agreement Signed!</h3>
        <p className="text-white/80 text-sm">Your financing is confirmed</p>
      </div>

      {/* Confirmation details */}
      <div className="bg-white border border-navy/10 rounded-xl p-4 space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <div className="text-navy/50 text-xs">Confirmation #</div>
            <div className="font-mono font-medium text-navy">{confirmationNumber}</div>
          </div>
          <div>
            <div className="text-navy/50 text-xs">Plan</div>
            <div className="font-medium text-navy">{offer.name}</div>
          </div>
          <div>
            <div className="text-navy/50 text-xs">First Payment</div>
            <div className="font-medium text-navy">{firstPaymentDate.toLocaleDateString()}</div>
          </div>
          <div>
            <div className="text-navy/50 text-xs">Payment Amount</div>
            <div className="font-medium text-navy">{formatCurrency(offer.installmentAmount)}</div>
          </div>
        </div>

        <div className="border-t border-navy/5 pt-3">
          <div className="flex items-center gap-2 text-xs text-navy/60">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Agreement sent to {customerEmail}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        {onDownloadAgreement && (
          <button
            onClick={onDownloadAgreement}
            className="flex-1 py-2.5 bg-navy/5 text-navy rounded-xl text-sm font-medium hover:bg-navy/10 transition-colors flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF
          </button>
        )}
        {onViewSchedule && (
          <button
            onClick={onViewSchedule}
            className="flex-1 py-2.5 bg-navy/5 text-navy rounded-xl text-sm font-medium hover:bg-navy/10 transition-colors flex items-center justify-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            View Schedule
          </button>
        )}
      </div>

      {/* What's next */}
      <div className="bg-teal/5 rounded-xl p-4">
        <h4 className="font-semibold text-navy text-sm mb-2">What happens next?</h4>
        <ul className="space-y-2 text-xs text-navy/70">
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 bg-teal text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">1</span>
            Your service provider will contact you to schedule the work
          </li>
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 bg-teal text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">2</span>
            Payments will be automatically collected on schedule
          </li>
          <li className="flex items-start gap-2">
            <span className="w-4 h-4 bg-teal text-white rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">3</span>
            You can manage your payments anytime at portal.suprfi.com
          </li>
        </ul>
      </div>
    </motion.div>
  )
}
