'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface ManualReview {
  id: string
  reason: string
  priority: number
  status: string
  assignedTo: string | null
  notes: string | null
  resolution: string | null
  resolvedBy: string | null
  resolvedAt: string | null
  createdAt: string
  timeInQueueHours: number
  isOverdue: boolean
  application: {
    id: string
    customerName: string
    customerEmail: string
    loanAmount: number
    serviceType: string | null
  }
  decision: {
    id: string
    score: number | null
    status: string
  }
}

interface Stats {
  pending: number
  in_review: number
  resolved: number
}

export default function ManualReviewPage() {
  const router = useRouter()
  const [reviews, setReviews] = useState<ManualReview[]>([])
  const [stats, setStats] = useState<Stats>({ pending: 0, in_review: 0, resolved: 0 })
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('pending')
  
  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [showNoteModal, setShowNoteModal] = useState<string | null>(null)
  const [showResolveModal, setShowResolveModal] = useState<string | null>(null)
  const [noteText, setNoteText] = useState('')

  useEffect(() => {
    fetchReviews()
  }, [filter])

  const fetchReviews = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/v1/admin/manual-review?status=${filter}`)
      const data = await response.json()
      if (data.success) {
        setReviews(data.reviews)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignToMe = async (reviewId: string) => {
    setActionLoading(reviewId)
    try {
      const response = await fetch(`/api/v1/admin/manual-review/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'assign', assignedTo: 'me' }),
      })
      if (response.ok) {
        fetchReviews()
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleAddNote = async (reviewId: string) => {
    if (!noteText.trim()) return
    setActionLoading(reviewId)
    try {
      const response = await fetch(`/api/v1/admin/manual-review/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_note', notes: noteText }),
      })
      if (response.ok) {
        setShowNoteModal(null)
        setNoteText('')
        fetchReviews()
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleResolve = async (reviewId: string, resolution: string) => {
    setActionLoading(reviewId)
    try {
      const response = await fetch(`/api/v1/admin/manual-review/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'resolve', resolution }),
      })
      if (response.ok) {
        setShowResolveModal(null)
        fetchReviews()
      }
    } finally {
      setActionLoading(null)
    }
  }

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 1: return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">High</span>
      case 2: return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">Medium</span>
      default: return <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded">Low</span>
    }
  }

  const getReasonLabel = (reason: string) => {
    const labels: Record<string, string> = {
      thin_file: 'Thin Credit File',
      fraud_flag: 'Fraud Flag',
      borderline_score: 'Borderline Score',
      high_amount: 'High Loan Amount',
      manual_bank_entry: 'Manual Bank Entry',
    }
    return labels[reason] || reason
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Manual Review Queue</h1>
              <p className="text-gray-600 mt-1">Applications requiring human review</p>
            </div>
            <Link href="/admin" className="px-4 py-2 text-gray-600 hover:text-gray-900">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <button
            onClick={() => setFilter('pending')}
            className={`p-4 rounded-lg shadow text-left transition-colors ${
              filter === 'pending' ? 'bg-red-50 border-2 border-red-300' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-sm text-red-600 font-medium">Pending</div>
            <div className="text-3xl font-bold text-red-900">{stats.pending}</div>
            <div className="text-xs text-red-600">Needs attention</div>
          </button>
          <button
            onClick={() => setFilter('in_review')}
            className={`p-4 rounded-lg shadow text-left transition-colors ${
              filter === 'in_review' ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-sm text-yellow-600 font-medium">In Review</div>
            <div className="text-3xl font-bold text-yellow-900">{stats.in_review}</div>
            <div className="text-xs text-yellow-600">Being worked on</div>
          </button>
          <button
            onClick={() => setFilter('resolved')}
            className={`p-4 rounded-lg shadow text-left transition-colors ${
              filter === 'resolved' ? 'bg-green-50 border-2 border-green-300' : 'bg-white hover:bg-gray-50'
            }`}
          >
            <div className="text-sm text-green-600 font-medium">Resolved</div>
            <div className="text-3xl font-bold text-green-900">{stats.resolved}</div>
            <div className="text-xs text-green-600">Completed</div>
          </button>
        </div>

        {/* Queue */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">Loading...</div>
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">
                {filter === 'pending' ? '🎉' : '📋'}
              </div>
              <div className="text-xl font-medium text-gray-900">
                {filter === 'pending' ? 'No pending reviews!' : `No ${filter.replace('_', ' ')} reviews`}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {filter === 'pending' 
                  ? 'All applications have been reviewed' 
                  : 'Check another status filter'}
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {reviews.map((review) => (
                <div key={review.id} className={`p-6 ${review.isOverdue ? 'bg-red-50' : ''}`}>
                  <div className="flex items-start justify-between">
                    {/* Left: Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getPriorityBadge(review.priority)}
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                          {getReasonLabel(review.reason)}
                        </span>
                        {review.isOverdue && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-600 text-white rounded animate-pulse">
                            OVERDUE - {review.timeInQueueHours}h in queue
                          </span>
                        )}
                      </div>
                      
                      <Link 
                        href={`/admin/applications/${review.application.id}`}
                        className="text-lg font-semibold text-blue-600 hover:text-blue-800"
                      >
                        {review.application.customerName}
                      </Link>
                      <div className="text-sm text-gray-600 mt-1">
                        {review.application.customerEmail} | ${review.application.loanAmount.toLocaleString()} | {review.application.serviceType || 'N/A'}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>Score: <strong>{review.decision.score || 'N/A'}</strong></span>
                        <span>|</span>
                        <span>In queue: <strong>{review.timeInQueueHours}h</strong></span>
                        {review.assignedTo && (
                          <>
                            <span>|</span>
                            <span>Assigned to: <strong>{review.assignedTo}</strong></span>
                          </>
                        )}
                      </div>

                      {/* Notes */}
                      {review.notes && (
                        <div className="mt-3 p-3 bg-yellow-50 rounded-lg text-sm">
                          <div className="font-medium text-yellow-800 mb-1">Notes:</div>
                          <pre className="whitespace-pre-wrap text-yellow-900 font-mono text-xs">
                            {review.notes}
                          </pre>
                        </div>
                      )}

                      {/* Resolution */}
                      {review.resolution && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg text-sm">
                          <span className="font-medium text-green-800">Resolved: </span>
                          <span className="text-green-900 capitalize">{review.resolution.replace('_', ' ')}</span>
                          {review.resolvedAt && (
                            <span className="text-green-600 ml-2">
                              on {new Date(review.resolvedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions */}
                    {review.status !== 'resolved' && (
                      <div className="flex flex-col gap-2 ml-4">
                        <Link
                          href={`/admin/applications/${review.application.id}`}
                          className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
                        >
                          View Application
                        </Link>
                        
                        {!review.assignedTo && (
                          <button
                            onClick={() => handleAssignToMe(review.id)}
                            disabled={actionLoading === review.id}
                            className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                          >
                            Assign to Me
                          </button>
                        )}
                        
                        <button
                          onClick={() => setShowNoteModal(review.id)}
                          className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
                        >
                          Add Note
                        </button>
                        
                        <button
                          onClick={() => setShowResolveModal(review.id)}
                          className="px-4 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                        >
                          Resolve
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add Note</h3>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Enter your note..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => { setShowNoteModal(null); setNoteText(''); }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleAddNote(showNoteModal)}
                disabled={!noteText.trim() || actionLoading === showNoteModal}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {showResolveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Resolve Review</h3>
            <p className="text-gray-600 mb-4">Choose a resolution for this application:</p>
            <div className="space-y-3">
              <button
                onClick={() => handleResolve(showResolveModal, 'approved')}
                disabled={actionLoading === showResolveModal}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                Approve
              </button>
              <button
                onClick={() => handleResolve(showResolveModal, 'approved_with_conditions')}
                disabled={actionLoading === showResolveModal}
                className="w-full px-4 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:opacity-50"
              >
                Approve with Conditions
              </button>
              <button
                onClick={() => handleResolve(showResolveModal, 'declined')}
                disabled={actionLoading === showResolveModal}
                className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                Decline
              </button>
            </div>
            <button
              onClick={() => setShowResolveModal(null)}
              className="w-full mt-4 px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
