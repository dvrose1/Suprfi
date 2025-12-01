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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">SuprOps Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back, {user?.firstName || 'Admin'}!</p>
            </div>
            <a 
              href="/" 
              className="px-4 py-2 text-blue-600 hover:text-blue-800"
            >
              ← Back to Home
            </a>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Link href="/admin/applications" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
            <div className="text-sm text-gray-600">Total Applications</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{totalApps}</div>
            <div className="text-xs text-blue-600 mt-1">Click to view all →</div>
          </Link>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Approval Rate</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{approvalRate}%</div>
            <div className="text-xs text-gray-500 mt-1">{approvedApps} of {totalApps} approved</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Funded</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">
              ${(Number(totalFunded._sum.fundedAmount) || 0).toLocaleString()}
            </div>
            <div className="text-xs text-gray-500 mt-1">Lifetime funded amount</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Manual Reviews</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">{manualReviews}</div>
            <div className="text-xs text-gray-500 mt-1">
              {manualReviews > 0 ? 'Needs attention' : 'No pending reviews'}
            </div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">📋 Recent Applications</h2>
              <Link href="/admin/applications" className="text-sm text-blue-600 hover:text-blue-800">
                View All →
              </Link>
            </div>
            {recentApps.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No applications yet</p>
                <p className="text-sm mt-2">Applications will appear here once submitted</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApps.map((app) => (
                  <Link
                    key={app.id}
                    href={`/admin/applications/${app.id}`}
                    className="block p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">
                          {app.customer.firstName} {app.customer.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
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

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">⚡ Quick Actions</h2>
            <div className="space-y-3">
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
              <button 
                className="w-full px-4 py-3 bg-gray-100 text-gray-500 rounded-lg text-left cursor-not-allowed"
                disabled
              >
                <div className="font-medium">Manage Pricing Rules</div>
                <div className="text-sm text-gray-400">Coming in Phase 3</div>
              </button>
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
