'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

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

            {/* Integration Data */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">🔌 Integration Data</h2>
              <div className="space-y-4">
                {/* Plaid */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">Bank Connection (Plaid)</div>
                    {application.plaidData ? (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Connected</span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">Not Connected</span>
                    )}
                  </div>
                  {application.plaidData && (
                    <div className="text-sm text-gray-600">
                      Bank: {application.plaidData.bankName || 'N/A'} (...{application.plaidData.accountMask || 'N/A'})
                    </div>
                  )}
                </div>

                {/* Persona */}
                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">Identity Verification (Persona)</div>
                    {application.personaData ? (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">Verified</span>
                    ) : (
                      <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">Not Verified</span>
                    )}
                  </div>
                  {application.personaData && (
                    <div className="text-sm text-gray-600">
                      Status: {application.personaData.status || 'N/A'}
                    </div>
                  )}
                </div>
              </div>
            </div>
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
