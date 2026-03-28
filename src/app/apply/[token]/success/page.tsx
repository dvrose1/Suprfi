// ABOUTME: Loan success page with delightful celebration animations
// ABOUTME: Shows loan summary after agreement signed with confetti burst

'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils/format'
import { SuccessCircle, ConfettiBurst } from '@/components/shared'
import { staggerContainer, fadeInUp, springs } from '@/lib/animations'

interface LoanDetails {
  loanNumber: string
  fundedAmount: number
  paymentAmount: number
  paymentFrequency: 'biweekly' | 'monthly'
  numberOfPayments: number
  apr: number
  termMonths: number
  termWeeks: number
  planType: string
  planName: string
  downPayment: number
  firstPaymentDate: string
  customer: {
    firstName: string
    lastName: string
    email: string
  }
  job: {
    serviceType: string | null
  }
}

export default function SuccessPage() {
  const params = useParams()
  const token = params.token as string
  const prefersReducedMotion = useReducedMotion()

  const [loanDetails, setLoanDetails] = useState<LoanDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    async function fetchLoanDetails() {
      try {
        const response = await fetch(`/api/v1/borrower/${token}/loan`)
        const data = await response.json()

        if (response.ok && data.success) {
          setLoanDetails(data.loan)
        }
      } catch (err) {
        console.error('Error fetching loan details:', err)
      } finally {
        setLoading(false)
        // Trigger confetti after a brief delay
        if (!prefersReducedMotion) {
          setTimeout(() => setShowConfetti(true), 600)
        }
      }
    }

    fetchLoanDetails()
  }, [token, prefersReducedMotion])

  // Calculate first payment date (30 days from now)
  const firstPaymentDate = new Date()
  firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1)

  return (
    <div className="min-h-screen bg-warm-white py-12 px-4">
      <motion.div 
        className="max-w-2xl mx-auto"
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {/* Success Header with animated celebration */}
        <motion.div className="text-center mb-8 relative" variants={fadeInUp}>
          <div className="relative inline-block">
            <SuccessCircle size="xl" showConfetti={showConfetti} delay={0.2} />
          </div>
          <motion.h1 
            className="text-4xl font-bold text-navy font-display mt-6 mb-3"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            You're All Set!
          </motion.h1>
          <motion.p 
            className="text-xl text-medium-gray"
            initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Your financing has been approved and your loan is now active.
          </motion.p>
        </motion.div>

        {/* Loan Summary Card */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          variants={fadeInUp}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Loan Summary</h2>
            {loanDetails && (
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                Active
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading loan details...</div>
          ) : loanDetails ? (
            <>
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-sm text-gray-500 mb-1">Loan Number</div>
                  <div className="font-mono font-semibold text-gray-900">{loanDetails.loanNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Funded Amount</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(loanDetails.fundedAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">
                    {loanDetails.paymentFrequency === 'biweekly' ? 'Payment (every 2 weeks)' : 'Monthly Payment'}
                  </div>
                  <div className="text-xl font-semibold text-gray-900">
                    {formatCurrency(loanDetails.paymentAmount)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">APR</div>
                  <div className="text-xl font-semibold text-gray-900">
                    {loanDetails.apr === 0 ? '0% (Interest-free)' : `${loanDetails.apr.toFixed(2)}%`}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">Plan</div>
                  <div className="font-semibold text-gray-900">
                    {loanDetails.planName || (loanDetails.termWeeks ? `${loanDetails.termWeeks} weeks` : `${loanDetails.termMonths} months`)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500 mb-1">First Payment Due</div>
                  <div className="font-semibold text-gray-900">{firstPaymentDate.toLocaleDateString()}</div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="text-sm text-gray-500 mb-1">Borrower</div>
                <div className="font-medium text-gray-900">
                  {loanDetails.customer.firstName} {loanDetails.customer.lastName}
                </div>
                <div className="text-sm text-gray-600">{loanDetails.customer.email}</div>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div className="text-sm text-gray-500 mb-1">Status</div>
                <div className="font-semibold text-green-600">Loan Created Successfully</div>
              </div>
              <div>
                <div className="text-sm text-gray-500 mb-1">First Payment Due</div>
                <div className="font-semibold text-gray-900">{firstPaymentDate.toLocaleDateString()}</div>
              </div>
            </div>
          )}
        </motion.div>

        {/* What's Next - Animated steps */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8 mb-8"
          variants={fadeInUp}
        >
          <h2 className="text-lg font-semibold text-navy mb-4">What Happens Next?</h2>
          
          <div className="space-y-4">
            {[
              { title: 'Confirmation Email', desc: "You'll receive an email confirmation with your loan details and agreement copy." },
              { title: 'Service Scheduling', desc: 'Your service provider will contact you to schedule the work.' },
              { title: 'Funds Disbursed', desc: 'Once the work is complete, funds are sent directly to the service provider.' },
              { title: 'Start Payments', desc: `Your first payment will be automatically debited on ${firstPaymentDate.toLocaleDateString()}.` },
            ].map((step, index) => (
              <motion.div 
                key={step.title}
                className="flex items-start"
                initial={prefersReducedMotion ? {} : { opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
              >
                <div className="flex-shrink-0 w-8 h-8 bg-teal/10 rounded-full flex items-center justify-center mr-4">
                  <span className="text-teal font-bold text-sm">{index + 1}</span>
                </div>
                <div>
                  <div className="font-medium text-navy">{step.title}</div>
                  <div className="text-sm text-medium-gray">{step.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact & Support */}
        <motion.div 
          className="bg-teal/10 rounded-xl p-6 mb-8"
          variants={fadeInUp}
        >
          <h3 className="font-semibold text-navy mb-2">Need Help?</h3>
          <p className="text-sm text-navy/70 mb-4">
            Our support team is here to help with any questions about your loan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:support@suprfi.com"
              className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-navy hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              support@suprfi.com
            </a>
            <a
              href="tel:1-800-SUPRFI"
              className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-navy hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 mr-2 text-teal" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              1-800-SUPRFI
            </a>
          </div>
        </motion.div>

        {/* Back to Home */}
        <motion.div className="text-center" variants={fadeInUp}>
          <Link
            href="/"
            className="text-teal hover:text-teal/80 font-medium transition-colors"
          >
            ← Return to SuprFi Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
