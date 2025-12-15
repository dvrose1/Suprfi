'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface PaymentScheduleItem {
  month: number
  dueDate: string
  amount: number
  status: 'paid' | 'upcoming' | 'overdue'
}

interface ApplicationDetail {
  id: string
  status: string
  createdAt: string
  updatedAt: string
  customer: {
    id: string
    firstName: string
    lastName: string
    email: string
    phone: string
    addressLine1: string | null
    addressLine2: string | null
    city: string | null
    state: string | null
    postalCode: string | null
  }
  job: {
    id: string
    estimateAmount: number
    serviceType: string | null
    status: string
  }
  decision: {
    id: string
    score: number | null
    decisionStatus: string
    decisionReason: string | null
    ruleHits: string[]
    evaluatorVersion: string | null
    decidedAt: string
    decidedBy: string | null
    offers: Array<{
      id: string
      termMonths: number
      apr: number
      monthlyPayment: number
      downPayment: number
      originationFee: number
      totalAmount: number
      selected: boolean
    }>
  } | null
  loan: {
    id: string
    lenderLoanId: string | null
    lenderName: string | null
    fundedAmount: number
    fundingDate: string | null
    status: string
    paymentSchedule: PaymentScheduleItem[] | null
  } | null
  plaidData: any
  personaData: any
  creditData: any
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const applicationId = params.id as string

  const [application, setApplication] = useState<ApplicationDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  
  // Confirmation dialogs
  const [showApproveDialog, setShowApproveDialog] = useState(false)
  const [showDeclineDialog, setShowDeclineDialog] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [approveReason, setApproveReason] = useState('')

  useEffect(() => {
    fetchApplication()
  }, [applicationId])

  const fetchApplication = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/v1/admin/applications/${applicationId}`)
      const data = await response.json()

      if (data.success) {
        setApplication(data.application)
      } else {
        setError(data.error || 'Failed to load application')
      }
    } catch (err) {
      setError('Failed to load application')
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async () => {
    setActionLoading(true)
    try {
      const response = await fetch(`/api/v1/admin/applications/${applicationId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: approveReason }),
      })

      const data = await response.json()

      if (data.success) {
        alert('Application approved successfully!')
        setShowApproveDialog(false)
        setApproveReason('')
        fetchApplication()
      } else {
        alert(`Failed to approve: ${data.error}`)
      }
    } catch (error) {
      alert('Failed to approve application')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDecline = async () => {
    if (!declineReason.trim()) {
      alert('Please provide a reason for declining')
      return
    }

    setActionLoading(true)
    try {
      const response = await fetch(`/api/v1/admin/applications/${applicationId}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: declineReason }),
      })

      const data = await response.json()

      if (data.success) {
        alert('Application declined successfully!')
        setShowDeclineDialog(false)
        setDeclineReason('')
        fetchApplication()
      } else {
        alert(`Failed to decline: ${data.error}`)
      }
    } catch (error) {
      alert('Failed to decline application')
    } finally {
      setActionLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      initiated: 'bg-gray-100 text-gray-800',
      submitted: 'bg-blue-100 text-blue-800',
      approved: 'bg-green-100 text-green-800',
      declined: 'bg-red-100 text-red-800',
      funded: 'bg-purple-100 text-purple-800',
    }
    return styles[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <div className="text-gray-600">Loading application...</div>
        </div>
      </div>
    )
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <div className="text-gray-900 font-semibold mb-2">Error Loading Application</div>
          <div className="text-gray-600 mb-4">{error || 'Application not found'}</div>
          <button
            onClick={() => router.push('/admin/applications')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Applications
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => router.push('/admin/applications')}
                className="text-sm text-gray-600 hover:text-gray-900 mb-2"
              >
                ← Back to Applications
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                Application Details
              </h1>
              <p className="text-gray-600 mt-1">
                ID: {application.id.slice(0, 12)}...
              </p>
            </div>
            <span className={`px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadge(application.status)}`}>
              {application.status.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">👤 Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Name</div>
                  <div className="font-medium text-gray-900">
                    {application.customer.firstName} {application.customer.lastName}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Email</div>
                  <div className="font-medium text-gray-900">{application.customer.email}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Phone</div>
                  <div className="font-medium text-gray-900">{application.customer.phone}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Customer ID</div>
                  <div className="font-mono text-xs text-gray-600">{application.customer.id}</div>
                </div>
              </div>

              {application.customer.addressLine1 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-1">Address</div>
                  <div className="text-gray-900">
                    {application.customer.addressLine1}
                    {application.customer.addressLine2 && `, ${application.customer.addressLine2}`}
                    <br />
                    {application.customer.city}, {application.customer.state} {application.customer.postalCode}
                  </div>
                </div>
              )}
            </div>

            {/* Job Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">🏠 Job Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Loan Amount</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${application.job.estimateAmount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Service Type</div>
                  <div className="font-medium text-gray-900">
                    {application.job.serviceType || 'N/A'}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Job Status</div>
                  <div className="font-medium text-gray-900">{application.job.status}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Job ID</div>
                  <div className="font-mono text-xs text-gray-600">{application.job.id}</div>
                </div>
              </div>
            </div>

            {/* Decision & Credit */}
            {application.decision && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">📊 Decision & Credit</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <div className="text-sm text-gray-600">Credit Score</div>
                    <div className="text-2xl font-bold text-gray-900">
                      {application.decision.score || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Decision Status</div>
                    <div className="font-semibold text-gray-900">
                      {application.decision.decisionStatus}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Decided By</div>
                    <div className="font-medium text-gray-900">
                      {application.decision.decidedBy || 'System'}
                    </div>
                  </div>
                </div>

                {application.decision.decisionReason && (
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-1">Reason</div>
                    <div className="text-gray-900">{application.decision.decisionReason}</div>
                  </div>
                )}

                {/* Decision Factors from Plaid Data Analysis */}
                {application.decision.ruleHits && application.decision.ruleHits.length > 0 && (
                  <div className="mb-4 pt-4 border-t border-gray-200">
                    <div className="text-sm font-medium text-gray-700 mb-3">📊 Decision Factors (from Plaid data)</div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Positive Factors */}
                      <div>
                        <div className="text-xs font-medium text-green-700 mb-2">✅ Positive Factors</div>
                        <div className="space-y-1">
                          {application.decision.ruleHits
                            .filter((hit: string) => !hit.toLowerCase().includes('low') && !hit.toLowerCase().includes('risk'))
                            .map((hit: string, idx: number) => (
                              <div key={idx} className="text-sm text-green-700 bg-green-50 rounded px-2 py-1">
                                {hit}
                              </div>
                            ))}
                        </div>
                      </div>
                      {/* Risk Factors */}
                      <div>
                        <div className="text-xs font-medium text-red-700 mb-2">⚠️ Risk Factors</div>
                        <div className="space-y-1">
                          {application.decision.ruleHits
                            .filter((hit: string) => hit.toLowerCase().includes('low') || hit.toLowerCase().includes('risk'))
                            .map((hit: string, idx: number) => (
                              <div key={idx} className="text-sm text-red-700 bg-red-50 rounded px-2 py-1">
                                {hit}
                              </div>
                            ))}
                          {application.decision.ruleHits.filter((hit: string) => hit.toLowerCase().includes('low') || hit.toLowerCase().includes('risk')).length === 0 && (
                            <div className="text-sm text-gray-500 italic">None identified</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Offers */}
                {application.decision.offers.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Financing Offers</h3>
                    <div className="space-y-3">
                      {application.decision.offers.map((offer) => (
                        <div
                          key={offer.id}
                          className={`p-4 border rounded-lg ${
                            offer.selected ? 'border-green-500 bg-green-50' : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-gray-900">
                                {offer.termMonths} Month Plan
                              </div>
                              <div className="text-sm text-gray-600">
                                ${offer.monthlyPayment.toFixed(2)}/month • {offer.apr.toFixed(2)}% APR
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-600">Total</div>
                              <div className="font-semibold text-gray-900">
                                ${offer.totalAmount.toFixed(2)}
                              </div>
                            </div>
                          </div>
                          {offer.selected && (
                            <div className="mt-2 text-xs text-green-700 font-medium">
                              ✓ Selected by customer
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Bank Data (Plaid) */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">🏦 Bank Data</h2>
                <div className="flex items-center gap-2">
                  {application.plaidData?.manualEntry ? (
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded font-medium">
                      ⚠️ Manual Entry
                    </span>
                  ) : application.plaidData ? (
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Plaid Verified</span>
                  ) : (
                    <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">Not Connected</span>
                  )}
                </div>
              </div>
              
              {/* Manual Entry Warning */}
              {application.plaidData?.manualEntry && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <span className="text-yellow-600 text-xl mr-3">⚠️</span>
                    <div>
                      <div className="font-semibold text-yellow-900">Manual Bank Entry</div>
                      <div className="text-sm text-yellow-800">
                        This customer entered their bank details manually instead of connecting through Plaid.
                        Balance and transaction data is not available. Consider requesting additional verification.
                      </div>
                      {application.plaidData.verificationStatus && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Verification Status: </span>
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            application.plaidData.verificationStatus === 'verified' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {application.plaidData.verificationStatus}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
              {application.plaidData ? (
                <div className="space-y-4">
                  {/* Account Info */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-sm text-gray-600">Institution</div>
                      <div className="font-medium text-gray-900">{application.plaidData.institutionName || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Account</div>
                      <div className="font-medium text-gray-900">
                        {application.plaidData.accountName || 'N/A'} (...{application.plaidData.accountMask || 'N/A'})
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Type</div>
                      <div className="font-medium text-gray-900 capitalize">
                        {application.plaidData.accountType || 'N/A'} / {application.plaidData.accountSubtype || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">Linked</div>
                      <div className="font-medium text-gray-900">
                        {application.plaidData.linkedAt ? new Date(application.plaidData.linkedAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>

                  {/* Balance */}
                  {application.plaidData.balance && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-sm font-medium text-gray-700 mb-2">💰 Account Balance</div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500">Available</div>
                          <div className="text-xl font-bold text-green-600">
                            ${(application.plaidData.balance.available || 0).toLocaleString()}
                          </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <div className="text-xs text-gray-500">Current</div>
                          <div className="text-xl font-bold text-gray-900">
                            ${(application.plaidData.balance.current || 0).toLocaleString()}
                          </div>
                        </div>
                        {application.plaidData.balance.limit && (
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-500">Limit</div>
                            <div className="text-xl font-bold text-gray-900">
                              ${application.plaidData.balance.limit.toLocaleString()}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ACH Numbers */}
                  {application.plaidData.achNumbers && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-sm font-medium text-gray-700 mb-2">🔐 ACH Information (for disbursement)</div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="text-xs text-blue-600">Routing Number</div>
                          <div className="font-mono font-medium text-blue-900">
                            {application.plaidData.achNumbers.routingNumber}
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="text-xs text-blue-600">Account Number</div>
                          <div className="font-mono font-medium text-blue-900">
                            ****{application.plaidData.achNumbers.accountNumber?.slice(-4) || '****'}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* All Accounts */}
                  {application.plaidData.allAccounts && application.plaidData.allAccounts.length > 1 && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-sm font-medium text-gray-700 mb-2">📋 All Linked Accounts ({application.plaidData.allAccounts.length})</div>
                      <div className="space-y-2">
                        {application.plaidData.allAccounts.map((acc: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-sm bg-gray-50 rounded p-2">
                            <span className="text-gray-700">{acc.name} (...{acc.mask})</span>
                            <span className="font-medium text-gray-900">
                              ${(acc.balance?.available || acc.balance?.current || 0).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Asset Report Status */}
                  {application.plaidData.assetReport && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-sm font-medium text-gray-700 mb-2">📄 Asset Report (Bank Statements)</div>
                      <div className="text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          application.plaidData.assetReport.status === 'ready' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {application.plaidData.assetReport.status === 'ready' ? 'Ready' : 'Pending'}
                        </span>
                        {application.plaidData.assetReport.requestedAt && (
                          <span className="text-gray-500 ml-2">
                            Requested: {new Date(application.plaidData.assetReport.requestedAt).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">No bank account connected yet.</div>
              )}
            </div>

            {/* Identity Verification (Persona) */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">🪪 Identity Verification (Persona)</h2>
                {application.personaData?.status === 'completed' ? (
                  <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Verified</span>
                ) : application.personaData ? (
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded">{application.personaData.status}</span>
                ) : (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">Not Started</span>
                )}
              </div>
              
              {application.personaData ? (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Inquiry ID</span>
                    <span className="font-mono text-gray-900">{application.personaData.inquiryId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status</span>
                    <span className="font-medium text-gray-900 capitalize">{application.personaData.status}</span>
                  </div>
                  {application.personaData.createdAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created</span>
                      <span className="text-gray-900">{new Date(application.personaData.createdAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 text-sm">Identity verification not started.</div>
              )}
            </div>

            {/* Loan & Payment Info (only shown for funded applications) */}
            {application.loan && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold">💰 Loan & Payments</h2>
                  <span className={`text-xs px-2 py-1 rounded font-medium ${
                    application.loan.status === 'funded' || application.loan.status === 'repaying'
                      ? 'bg-green-100 text-green-800'
                      : application.loan.status === 'paid_off'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {application.loan.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                
                {/* Loan Summary */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500">Funded Amount</div>
                    <div className="text-xl font-bold text-green-600">
                      ${application.loan.fundedAmount.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500">Funding Date</div>
                    <div className="font-medium text-gray-900">
                      {application.loan.fundingDate 
                        ? new Date(application.loan.fundingDate).toLocaleDateString() 
                        : 'Pending'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="text-xs text-gray-500">Lender</div>
                    <div className="font-medium text-gray-900">
                      {application.loan.lenderName || 'SuprFi'}
                    </div>
                  </div>
                </div>

                {/* Payment Progress */}
                {application.loan.paymentSchedule && Array.isArray(application.loan.paymentSchedule) && application.loan.paymentSchedule.length > 0 && (
                  <>
                    {(() => {
                      const schedule = application.loan.paymentSchedule as PaymentScheduleItem[]
                      const paidPayments = schedule.filter(p => p.status === 'paid').length
                      const totalPayments = schedule.length
                      const progressPercent = Math.round((paidPayments / totalPayments) * 100)
                      
                      return (
                        <>
                          <div className="mb-4">
                            <div className="text-sm font-medium text-gray-700 mb-2">Payment Progress</div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-500">{paidPayments} of {totalPayments} payments made</span>
                              <span className="text-green-600 font-medium">{progressPercent}% complete</span>
                            </div>
                            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all"
                                style={{ width: `${progressPercent}%` }}
                              />
                            </div>
                          </div>

                          {/* Payment Schedule */}
                          <div className="pt-4 border-t border-gray-200">
                            <div className="text-sm font-medium text-gray-700 mb-3">Payment Schedule</div>
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                              {schedule.map((payment) => (
                                <div
                                  key={payment.month}
                                  className="flex items-center justify-between p-2 rounded bg-gray-50 text-sm"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-xs font-medium text-gray-700 border">
                                      {payment.month}
                                    </div>
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        ${payment.amount.toLocaleString()}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        Due {new Date(payment.dueDate).toLocaleDateString()}
                                      </div>
                                    </div>
                                  </div>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    payment.status === 'paid'
                                      ? 'bg-green-100 text-green-700'
                                      : payment.status === 'overdue'
                                      ? 'bg-red-100 text-red-700'
                                      : 'bg-gray-100 text-gray-600'
                                  }`}>
                                    {payment.status === 'paid' ? '✓ Paid' : payment.status === 'overdue' ? 'Overdue' : 'Upcoming'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">⏱️ Timeline</h2>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Created</div>
                  <div className="font-medium text-gray-900">
                    {new Date(application.createdAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Last Updated</div>
                  <div className="font-medium text-gray-900">
                    {new Date(application.updatedAt).toLocaleString()}
                  </div>
                </div>
                {application.decision && (
                  <div>
                    <div className="text-sm text-gray-600">Decision Made</div>
                    <div className="font-medium text-gray-900">
                      {new Date(application.decision.decidedAt).toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">⚡ Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => setShowApproveDialog(true)}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={application.status === 'approved' || application.status === 'declined' || actionLoading}
                >
                  {application.status === 'approved' ? '✓ Approved' : 'Approve Application'}
                </button>
                <button
                  onClick={() => setShowDeclineDialog(true)}
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={application.status === 'declined' || application.status === 'approved' || actionLoading}
                >
                  {application.status === 'declined' ? '✗ Declined' : 'Decline Application'}
                </button>
                <button
                  onClick={() => alert('Email functionality coming soon!')}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  disabled={actionLoading}
                >
                  📧 Send Email
                </button>
                <button
                  onClick={fetchApplication}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  disabled={actionLoading}
                >
                  🔄 Refresh
                </button>
              </div>
            </div>

            {/* Debug Info */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="text-xs text-gray-500 mb-2">Debug Info</div>
              <div className="text-xs font-mono text-gray-600 space-y-1">
                <div>App ID: {application.id}</div>
                <div>Customer ID: {application.customer.id}</div>
                <div>Job ID: {application.job.id}</div>
                {application.decision && <div>Decision ID: {application.decision.id}</div>}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Approve Dialog */}
      {showApproveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Approve Application</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to approve this application for{' '}
              <strong>{application.customer.firstName} {application.customer.lastName}</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (optional)
              </label>
              <textarea
                value={approveReason}
                onChange={(e) => setApproveReason(e.target.value)}
                placeholder="Add a note about why you're approving..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={3}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApproveDialog(false)
                  setApproveReason('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                disabled={actionLoading}
              >
                {actionLoading ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Dialog */}
      {showDeclineDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Decline Application</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to decline this application for{' '}
              <strong>{application.customer.firstName} {application.customer.lastName}</strong>?
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason (required) *
              </label>
              <textarea
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
                placeholder="Explain why you're declining this application..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows={3}
                required
              />
              <p className="text-xs text-gray-500 mt-1">This will be logged in the audit trail</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeclineDialog(false)
                  setDeclineReason('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                disabled={actionLoading}
              >
                {actionLoading ? 'Declining...' : 'Decline'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
