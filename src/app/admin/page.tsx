// ABOUTME: Admin dashboard page
// ABOUTME: Shows stats and quick actions for SuprOps

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils/format';

interface DashboardStats {
  totalApps: number;
  submittedApps: number;
  approvedApps: number;
  approvalRate: string;
  totalFunded: number;
  manualReviews: number;
  recentApps: Array<{
    id: string;
    customer: { firstName: string; lastName: string };
    job: { estimateAmount: string };
    createdAt: string;
  }>;
}

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/v1/admin/dashboard');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setStatsLoading(false);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const totalApps = stats?.totalApps ?? 0;
  const submittedApps = stats?.submittedApps ?? 0;
  const approvedApps = stats?.approvedApps ?? 0;
  const approvalRate = stats?.approvalRate ?? '0.0';
  const totalFunded = stats?.totalFunded ?? 0;
  const manualReviews = stats?.manualReviews ?? 0;
  const recentApps = stats?.recentApps ?? [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">SuprOps Dashboard</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">Welcome back, {user?.name || 'Admin'}!</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-900">{user?.email}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role} Role</div>
              </div>
              <button
                onClick={() => logout()}
                className="px-4 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg text-sm transition-colors"
              >
                Logout
              </button>
            </div>
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
              {formatCurrency(totalFunded || 0)}
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
                          {formatCurrency(Number(app.job.estimateAmount))}
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
              {(user?.role === 'god' || user?.role === 'admin') && (
                <Link
                  href="/admin/users"
                  className="block w-full px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 text-left"
                >
                  <div className="font-medium">User Management</div>
                  <div className="text-sm text-indigo-600">Manage admin users</div>
                </Link>
              )}
              {user?.role === 'god' && (
                <Link
                  href="/admin/audit"
                  className="block w-full px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-left"
                >
                  <div className="font-medium">Audit Log</div>
                  <div className="text-sm text-gray-600">View all admin actions</div>
                </Link>
              )}
              <Link
                href="/admin/settings/integrations"
                className="block w-full px-4 py-3 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 text-left"
              >
                <div className="font-medium">CRM Integrations</div>
                <div className="text-sm text-orange-600">Connect Jobber, FieldRoutes, and more</div>
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
