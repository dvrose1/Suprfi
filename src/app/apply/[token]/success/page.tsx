'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/format'

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

  const [loanDetails, setLoanDetails] = useState<LoanDetails | null>(null)
  const [loading, setLoading] = useState(true)

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
      }
    }

    fetchLoanDetails()
  }, [token])

  // Calculate first payment date (30 days from now)
  const firstPaymentDate = new Date()
  firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1)

  return (
    <div className="min-h-screen bg-warm-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-teal rounded-full mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            You're All Set!
          </h1>
          <p className="text-xl text-gray-600">
            Your financing has been approved and your loan is now active.
          </p>
        </div>

        {/* Loan Summary Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
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
        </div>

        {/* What's Next */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">What Happens Next?</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-teal font-bold text-sm">1</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Confirmation Email</div>
                <div className="text-sm text-gray-600">
                  You'll receive an email confirmation with your loan details and agreement copy.
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-teal font-bold text-sm">2</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Service Scheduling</div>
                <div className="text-sm text-gray-600">
                  Your service provider will contact you to schedule the work.
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-teal font-bold text-sm">3</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Funds Disbursed</div>
                <div className="text-sm text-gray-600">
                  Once the work is complete, funds are sent directly to the service provider.
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-teal font-bold text-sm">4</span>
              </div>
              <div>
                <div className="font-medium text-gray-900">Start Payments</div>
                <div className="text-sm text-gray-600">
                  Your first payment will be automatically debited on {firstPaymentDate.toLocaleDateString()}.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact & Support */}
        <div className="bg-teal/10 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-700 mb-4">
            Our support team is here to help with any questions about your loan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:support@suprfi.com"
              className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              📧 support@suprfi.com
            </a>
            <a
              href="tel:1-800-SUPRFI"
              className="inline-flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              📞 1-800-SUPRFI
            </a>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link
            href="/"
            className="text-teal hover:text-blue-700 font-medium"
          >
            ← Return to SuprFi Home
          </Link>
        </div>
      </div>
    </div>
  )
}
