// ABOUTME: Admin applications list page
// ABOUTME: Displays all financing applications with filtering and pagination

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils/format'
import { useAuth } from '@/lib/auth/context'

interface Application {
  id: string
  status: string
  customer: {
    name: string
    email: string
    phone: string
  }
  job: {
    amount: number
    serviceType: string | null
    status: string
  }
  decision: {
    status: string
    score: number | null
  } | null
  createdAt: string
  updatedAt: string
}

export default function ApplicationsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<Record<string, number>>({})
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/admin/login')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    fetchApplications()
  }, [filters.status, pagination.page])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        status: filters.status,
        search: filters.search,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      
      const response = await fetch(`/api/v1/admin/applications?${params}`)
      const data = await response.json()

      if (data.success) {
        setApplications(data.applications)
        setPagination(data.pagination)
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination({ ...pagination, page: 1 })
    fetchApplications()
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      initiated: 'bg-gray-100 text-medium-gray',
      submitted: 'bg-cyan/10 text-cyan',
      approved: 'bg-mint/10 text-mint',
      declined: 'bg-error/10 text-error',
      funded: 'bg-teal/10 text-teal',
    }
    return styles[status] || 'bg-gray-100 text-medium-gray'
  }

  const totalApplications = Object.values(stats).reduce((a, b) => a + b, 0)

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-teal border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-medium-gray">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-light-gray">
      {/* Header */}
      <header className="bg-navy sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center hover:opacity-80 transition-opacity">
                <img
                  src="/logos/wordmark white and mint.svg"
                  alt="SuprFi"
                  className="h-7 w-auto"
                />
                <span className="ml-2 text-white/40 text-sm font-medium hidden sm:inline">SuprOps</span>
              </Link>
              <span className="text-white/40">/</span>
              <span className="text-white font-medium">Applications</span>
            </div>
            <Link
              href="/admin"
              className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-colors"
            >
              ← Dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="text-sm text-medium-gray">Total</div>
            <div className="text-2xl font-bold font-display text-navy">{totalApplications}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="text-sm text-medium-gray">Initiated</div>
            <div className="text-2xl font-bold font-display text-medium-gray">{stats.initiated || 0}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="text-sm text-cyan">Submitted</div>
            <div className="text-2xl font-bold font-display text-navy">{stats.submitted || 0}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="text-sm text-mint">Approved</div>
            <div className="text-2xl font-bold font-display text-navy">{stats.approved || 0}</div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="text-sm text-error">Declined</div>
            <div className="text-2xl font-bold font-display text-navy">{stats.declined || 0}</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal focus:border-transparent bg-white text-navy"
            >
              <option value="all">All Statuses</option>
              <option value="initiated">Initiated</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
              <option value="funded">Funded</option>
            </select>

            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <input
                type="text"
                placeholder="Search by name, email, or ID..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-teal text-white rounded-xl hover:bg-teal/90 font-medium transition-colors"
              >
                Search
              </button>
            </form>

            {/* Refresh */}
            <button
              onClick={fetchApplications}
              className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-light-gray transition-colors text-navy"
            >
              <svg className="w-5 h-5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Applications Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-4 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <div className="text-medium-gray">Loading applications...</div>
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-light-gray rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-medium-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="text-navy font-medium">No applications found</div>
              <div className="text-sm text-medium-gray mt-1">
                Applications will appear here once submitted
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead className="bg-light-gray">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                        Credit Score
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                        Created
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-medium-gray uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {applications.map((app) => (
                      <tr key={app.id} className="hover:bg-light-gray/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-navy">
                            {app.customer.name}
                          </div>
                          <div className="text-sm text-medium-gray">
                            {app.customer.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-navy">
                            {formatCurrency(app.job.amount)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-navy">
                            {app.job.serviceType || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(app.status)}`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-navy">
                          {app.decision?.score || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-medium-gray">
                          {new Date(app.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => router.push(`/admin/applications/${app.id}`)}
                            className="text-teal hover:text-teal/80 font-medium transition-colors"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="bg-light-gray px-6 py-4 flex items-center justify-between border-t border-gray-100">
                  <div className="text-sm text-medium-gray">
                    Showing page {pagination.page} of {pagination.pages} ({pagination.total} total)
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                      disabled={pagination.page === 1}
                      className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-navy transition-colors"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                      disabled={pagination.page === pagination.pages}
                      className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed text-navy transition-colors"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
