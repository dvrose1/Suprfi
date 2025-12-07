import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

export default async function AdminPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const user = await currentUser()

  // Get real stats
  const [totalApps, submittedApps, approvedApps, recentApps] = await Promise.all([
    prisma.application.count(),
    prisma.application.count({ where: { status: 'submitted' } }),
    prisma.application.count({ where: { status: 'approved' } }),
    prisma.application.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            firstName: true,
            lastName: true,
          }
        },
        job: {
          select: {
            estimateAmount: true,
          }
        },
      },
    }),
  ])

  const approvalRate = totalApps > 0 ? ((approvedApps / totalApps) * 100).toFixed(1) : '0.0'
  const totalFunded = await prisma.loan.aggregate({
    _sum: { fundedAmount: true },
    where: { status: 'funded' },
  })
  
  const manualReviews = await prisma.manualReview.count({
    where: { status: 'pending' },
  })

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">SuprOps Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Welcome back, {user?.firstName || 'Admin'}!</p>
            </div>
            <a 
              href="/" 
              className="px-4 py-2 text-blue-600 hover:text-blue-800 text-sm sm:text-base"
            >
              ← Back to Home
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-4 sm:mb-6">
          <Link href="/admin/applications" className="bg-white rounded-lg shadow p-4 sm:p-6 hover:shadow-lg transition-shadow">
            <div className="text-xs sm:text-sm text-gray-600">Total Applications</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{totalApps}</div>
            <div className="text-xs text-blue-600 mt-1">Click to view all →</div>
          </Link>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="text-xs sm:text-sm text-gray-600">Approval Rate</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{approvalRate}%</div>
            <div className="text-xs text-gray-500 mt-1">{approvedApps} of {totalApps}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="text-xs sm:text-sm text-gray-600">Total Funded</div>
            <div className="text-xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">
              ${(Number(totalFunded._sum.fundedAmount) || 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">Lifetime</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="text-xs sm:text-sm text-gray-600">Manual Reviews</div>
            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 sm:mt-2">{manualReviews}</div>
            <div className="text-xs text-gray-500 mt-1">
              {manualReviews > 0 ? 'Needs attention' : 'No pending'}
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-base sm:text-xl font-semibold">📋 Recent Applications</h2>
              <Link href="/admin/applications" className="text-xs sm:text-sm text-blue-600 hover:text-blue-800">
                View All →
              </Link>
            </div>
            {recentApps.length === 0 ? (
              <div className="text-center py-6 sm:py-8 text-gray-500">
                <p className="text-sm sm:text-base">No applications yet</p>
                <p className="text-xs sm:text-sm mt-2">Applications will appear here once submitted</p>
              </div>
            ) : (
              <div className="space-y-2 sm:space-y-3">
                {recentApps.map((app) => (
                  <Link
                    key={app.id}
                    href={`/admin/applications/${app.id}`}
                    className="block p-2.5 sm:p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 text-sm sm:text-base">
                          {app.customer.firstName} {app.customer.lastName}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-500">
                          ${Number(app.job.estimateAmount).toLocaleString()}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-4 sm:p-6">
            <h2 className="text-base sm:text-xl font-semibold mb-3 sm:mb-4">⚡ Quick Actions</h2>
            <div className="space-y-2 sm:space-y-3">
              <Link 
                href="/admin/applications?status=submitted"
                className="block w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-left"
              >
                <div className="font-medium">View Submitted Applications</div>
                <div className="text-sm text-blue-600">{submittedApps} waiting for review</div>
              </Link>
              <Link
                href="/admin/applications"
                className="block w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-left"
              >
                <div className="font-medium">All Applications</div>
                <div className="text-sm text-green-600">Manage all financing requests</div>
              </Link>
              <Link
                href="/admin/manual-review"
                className={`block w-full px-4 py-3 rounded-lg text-left ${
                  manualReviews > 0 
                    ? 'bg-red-50 text-red-700 hover:bg-red-100' 
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">Manual Review Queue</div>
                <div className={`text-sm ${manualReviews > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                  {manualReviews > 0 ? `${manualReviews} pending reviews` : 'No pending reviews'}
                </div>
              </Link>
              <Link
                href="/admin/waitlist"
                className="block w-full px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-left"
              >
                <div className="font-medium">Waitlist Management</div>
                <div className="text-sm text-purple-600">View and manage signups</div>
              </Link>
              <Link
                href="/admin/contractors"
                className="block w-full px-4 py-3 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 text-left"
              >
                <div className="font-medium">Contractor Partners</div>
                <div className="text-sm text-teal-600">Manage approved contractors</div>
              </Link>
            </div>
          </div>
        </div>

        {/* Phase Status */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">🚀 Development Progress</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-green-600 font-bold mr-2">✓</span>
              <span className="font-medium">Phase 0: Foundation</span>
              <span className="ml-auto text-sm text-green-600">Complete</span>
            </div>
            <div className="flex items-center">
              <span className="text-yellow-600 font-bold mr-2">⏳</span>
              <span className="font-medium">Phase 1: Borrower Flow</span>
              <span className="ml-auto text-sm text-yellow-600">Up Next (Week 3-5)</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 font-bold mr-2">○</span>
              <span className="font-medium text-gray-400">Phase 2: Decisioning Engine</span>
              <span className="ml-auto text-sm text-gray-400">Week 6-7</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-400 font-bold mr-2">○</span>
              <span className="font-medium text-gray-400">Phase 3: CRM Integration</span>
              <span className="ml-auto text-sm text-gray-400">Week 8-9</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
