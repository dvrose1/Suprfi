import { auth, currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const user = await currentUser()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">FlowOps Dashboard</h1>
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
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Applications</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">0</div>
            <div className="text-xs text-gray-500 mt-1">Ready for data</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Approval Rate</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">--</div>
            <div className="text-xs text-gray-500 mt-1">Coming in Phase 2</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Total Funded</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">$0</div>
            <div className="text-xs text-gray-500 mt-1">Awaiting loans</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm text-gray-600">Manual Reviews</div>
            <div className="text-3xl font-bold text-gray-900 mt-2">0</div>
            <div className="text-xs text-gray-500 mt-1">No pending reviews</div>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">📋 Recent Applications</h2>
            <div className="text-center py-8 text-gray-500">
              <p>No applications yet</p>
              <p className="text-sm mt-2">Applications will appear here once Phase 1 is complete</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">⚡ Quick Actions</h2>
            <div className="space-y-3">
              <button 
                className="w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-left"
                disabled
              >
                <div className="font-medium">View Manual Review Queue</div>
                <div className="text-sm text-blue-600">Coming in Phase 5</div>
              </button>
              <button 
                className="w-full px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-left"
                disabled
              >
                <div className="font-medium">Manage Pricing Rules</div>
                <div className="text-sm text-green-600">Coming in Phase 2</div>
              </button>
              <button 
                className="w-full px-4 py-3 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 text-left"
                disabled
              >
                <div className="font-medium">View Analytics</div>
                <div className="text-sm text-purple-600">Coming in Phase 5</div>
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
