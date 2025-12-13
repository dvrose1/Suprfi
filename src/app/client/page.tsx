// ABOUTME: SuprClient dashboard page
// ABOUTME: Main dashboard with KPIs, live feed, and quick actions

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useContractorAuth } from '@/lib/auth/contractor-context';
import ClientHeader from '@/components/client/ClientHeader';

interface DashboardStats {
  totalApplications: number;
  applicationsThisMonth: number;
  approvalRate: number;
  pendingReview: number;
  totalFunded: number;
  fundedThisMonth: number;
  conversionFunnel: {
    initiated: number;
    submitted: number;
    approved: number;
    funded: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'submitted' | 'approved' | 'funded' | 'declined';
  customerName: string;
  amount: number;
  timestamp: string;
}

export default function ClientDashboardPage() {
  const { user, loading, canAccess } = useContractorAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch('/api/v1/client/dashboard');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRecentActivity(data.recentActivity || []);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
      } finally {
        setStatsLoading(false);
      }
    };

    if (user) {
      fetchDashboard();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-teal border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'funded':
        return { icon: '💰', color: 'bg-mint/20 text-mint' };
      case 'approved':
        return { icon: '✓', color: 'bg-teal/20 text-teal' };
      case 'submitted':
        return { icon: '📋', color: 'bg-cyan/20 text-cyan' };
      case 'declined':
        return { icon: '✗', color: 'bg-error/20 text-error' };
      default:
        return { icon: '•', color: 'bg-gray-200 text-gray-600' };
    }
  };

  return (
    <div className="min-h-screen bg-warm-white">
      <ClientHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-navy">
            Welcome back, {user.name?.split(' ')[0] || 'there'}!
          </h1>
          <p className="text-gray-600 mt-1">{user.contractorName}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-sm text-gray-600 mb-1">Funded This Month</div>
            <div className="text-3xl font-bold font-display text-navy">
              ${statsLoading ? '...' : (stats?.fundedThisMonth || 0).toLocaleString()}
            </div>
            <div className="text-xs text-teal mt-2">
              ${(stats?.totalFunded || 0).toLocaleString()} lifetime
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-sm text-gray-600 mb-1">Applications</div>
            <div className="text-3xl font-bold font-display text-navy">
              {statsLoading ? '...' : stats?.applicationsThisMonth || 0}
            </div>
            <div className="text-xs text-gray-500 mt-2">this month</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-sm text-gray-600 mb-1">Approval Rate</div>
            <div className="text-3xl font-bold font-display text-teal">
              {statsLoading ? '...' : `${stats?.approvalRate || 0}%`}
            </div>
            <div className="text-xs text-gray-500 mt-2">last 30 days</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="text-sm text-gray-600 mb-1">Pending Review</div>
            <div className="text-3xl font-bold font-display text-warning">
              {statsLoading ? '...' : stats?.pendingReview || 0}
            </div>
            <div className="text-xs text-gray-500 mt-2">awaiting decision</div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Live Activity Feed */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold font-display text-navy">Live Activity</h2>
              <Link href="/client/applications" className="text-sm text-teal hover:text-teal/80">
                View All →
              </Link>
            </div>
            {recentActivity.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-3">📋</div>
                <p className="text-gray-500">No recent activity</p>
                <p className="text-sm text-gray-400 mt-1">
                  Activity will appear here when customers apply
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity) => {
                  const { icon, color } = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id} className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {activity.customerName}
                        </p>
                        <p className="text-xs text-gray-500">
                          ${activity.amount.toLocaleString()} • {activity.type}
                        </p>
                      </div>
                      <div className="text-xs text-gray-400">
                        {activity.timestamp}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold font-display text-navy mb-6">Quick Actions</h2>
            <div className="space-y-3">
              {canAccess('application:send_link') && (
                <Link
                  href="/client/new"
                  className="flex items-center gap-4 p-4 rounded-xl bg-teal/10 hover:bg-teal/20 transition-colors"
                >
                  <div className="w-12 h-12 bg-teal text-white rounded-xl flex items-center justify-center text-xl">
                    📱
                  </div>
                  <div>
                    <div className="font-semibold text-navy">Send Financing Link</div>
                    <div className="text-sm text-gray-600">SMS, Email, or QR Code</div>
                  </div>
                </Link>
              )}
              <Link
                href="/client/applications"
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 bg-navy text-white rounded-xl flex items-center justify-center text-xl">
                  📋
                </div>
                <div>
                  <div className="font-semibold text-navy">View Applications</div>
                  <div className="text-sm text-gray-600">Track customer financing requests</div>
                </div>
              </Link>
              <Link
                href="/client/loans"
                className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-12 h-12 bg-mint text-white rounded-xl flex items-center justify-center text-xl">
                  💰
                </div>
                <div>
                  <div className="font-semibold text-navy">View Funded Loans</div>
                  <div className="text-sm text-gray-600">Track active customer loans</div>
                </div>
              </Link>
              {canAccess('analytics:view') && (
                <Link
                  href="/client/analytics"
                  className="flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="w-12 h-12 bg-cyan text-white rounded-xl flex items-center justify-center text-xl">
                    📊
                  </div>
                  <div>
                    <div className="font-semibold text-navy">View Analytics</div>
                    <div className="text-sm text-gray-600">Performance metrics and trends</div>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Conversion Funnel */}
        {stats?.conversionFunnel && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mt-8">
            <h2 className="text-xl font-semibold font-display text-navy mb-6">Conversion Funnel (30 days)</h2>
            <div className="flex items-center justify-between gap-4">
              {['initiated', 'submitted', 'approved', 'funded'].map((stage, index) => (
                <div key={stage} className="flex-1 text-center">
                  <div className="relative">
                    <div className={`h-2 rounded-full ${
                      index === 0 ? 'bg-gray-200' :
                      index === 1 ? 'bg-cyan' :
                      index === 2 ? 'bg-teal' :
                      'bg-mint'
                    }`}></div>
                    {index < 3 && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-gray-400">
                        →
                      </div>
                    )}
                  </div>
                  <div className="mt-3">
                    <div className="text-2xl font-bold text-navy">
                      {stats.conversionFunnel[stage as keyof typeof stats.conversionFunnel]}
                    </div>
                    <div className="text-sm text-gray-500 capitalize">{stage}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
