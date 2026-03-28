// ABOUTME: SuprClient dashboard page
// ABOUTME: Main dashboard with KPIs, live feed, and quick actions

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useContractorAuth } from '@/lib/auth/contractor-context';
import ClientHeader from '@/components/client/ClientHeader';
import { formatCurrency } from '@/lib/utils/format';
import { transitions, staggerContainer, fadeInUp, layoutClasses } from '@/lib/animations';
import { EmptyState } from '@/components/shared';

interface DashboardStats {
  totalApplications: number;
  applicationsThisMonth: number;
  approvalRate: number;
  pendingReview: number;
  totalFunded: number;
  fundedThisMonth: number;
  soldThisMonth: number;
  soldCount: number;
  fundedCount: number;
  avgLoanSize: number;
  midFunnelCount: number;
  conversionFunnel: {
    initiated: number;
    submitted: number;
    approved: number;
    funded: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'initiated' | 'submitted' | 'approved' | 'funded' | 'declined';
  customerName: string;
  amount: number;
  timestamp: string;
  technicianName?: string;
}

type ActivityFilter = 'all' | 'initiated' | 'submitted' | 'approved' | 'funded';
type ActivitySortField = 'date' | 'technician';
type SortDirection = 'asc' | 'desc';

export default function ClientDashboardPage() {
  const { user, loading, canAccess } = useContractorAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [activitySort, setActivitySort] = useState<ActivitySortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const prefersReducedMotion = useReducedMotion();

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
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-teal border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-medium-gray">Loading your dashboard...</p>
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
      case 'initiated':
        return { icon: '🚀', color: 'bg-warning/20 text-warning' };
      case 'declined':
        return { icon: '✗', color: 'bg-error/20 text-error' };
      default:
        return { icon: '•', color: 'bg-gray-200 text-gray-600' };
    }
  };

  return (
    <div className="min-h-screen bg-light-gray">
      <ClientHeader />

      {/* Main Content */}
      <main id="main-content" className={layoutClasses.pageContent}>
        {/* Welcome */}
        <motion.div 
          className="mb-8"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitions.entrance}
        >
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-navy">
            Welcome back, {user.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-medium-gray mt-1">{user.contractorName}</p>
        </motion.div>

        {/* Stats Grid - Hero stats with visual hierarchy */}
        <motion.div 
          className={layoutClasses.statsGrid}
          initial={prefersReducedMotion ? false : "hidden"}
          animate="visible"
          variants={staggerContainer}
        >
          {/* Hero Stat - Sold */}
          <motion.div 
            className={`${layoutClasses.cardHero} hover:shadow-lg transition-all`}
            variants={fadeInUp}
            whileHover={prefersReducedMotion ? {} : { y: -4, transition: transitions.fast }}
          >
            <div className={layoutClasses.statLabel}>Sold</div>
            <div className={`${layoutClasses.statHero} text-navy`}>
              {statsLoading ? '...' : `$${(stats?.soldThisMonth || 0).toLocaleString()}`}
            </div>
            <div className={`${layoutClasses.statSubtext} text-teal font-medium`}>
              {stats?.soldCount || 0} loans this month
            </div>
          </motion.div>

          {/* Secondary Stats */}
          {[
            { label: 'Funded', value: stats?.fundedThisMonth || 0, subtext: `${stats?.fundedCount || 0} loans this month`, subtextColor: 'text-mint', prefix: '$' },
            { label: 'Avg. Loan Size', value: stats?.avgLoanSize || 0, subtext: 'last 30 days', subtextColor: 'text-medium-gray', prefix: '$' },
            { label: 'Approval Rate', value: stats?.approvalRate || 0, subtext: 'last 30 days', subtextColor: 'text-medium-gray', suffix: '%', valueColor: 'text-teal' },
          ].map((stat) => (
            <motion.div 
              key={stat.label}
              className={layoutClasses.cardInteractive}
              variants={fadeInUp}
              whileHover={prefersReducedMotion ? {} : { y: -4, transition: transitions.fast }}
            >
              <div className={layoutClasses.statLabel}>{stat.label}</div>
              <div className={`${layoutClasses.statNormal} ${stat.valueColor || 'text-navy'}`}>
                {statsLoading ? '...' : `${stat.prefix || ''}${stat.value.toLocaleString()}${stat.suffix || ''}`}
              </div>
              <div className={`${layoutClasses.statSubtext} ${stat.subtextColor}`}>
                {stat.subtext}
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Conversion Funnel */}
        {stats?.conversionFunnel && (
          <div className={`${layoutClasses.cardPrimary} mt-8`}>
            <h2 className="text-lg font-semibold font-display text-navy mb-6">Conversion Funnel (30 days)</h2>
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

        {/* Mid-Funnel Alert */}
        {stats?.midFunnelCount && stats.midFunnelCount > 0 && (
          <div className="bg-warning/10 border border-warning/20 rounded-2xl p-4 mt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-warning/20 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="font-semibold text-navy">
                  {stats.midFunnelCount} application{stats.midFunnelCount !== 1 ? 's' : ''} in progress
                </div>
                <div className="text-sm text-medium-gray">
                  Customers have started but not completed their application. Consider following up.
                </div>
              </div>
              <Link
                href="/client/applications?status=initiated"
                className="px-4 py-2 bg-warning text-white rounded-xl hover:bg-warning/90 transition-colors text-sm font-medium"
              >
                View
              </Link>
            </div>
          </div>
        )}

        {/* Live Activity Feed */}
        <div className={`${layoutClasses.cardPrimary} mt-8`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-lg font-semibold font-display text-navy">Live Activity</h2>
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value as ActivityFilter)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal focus:border-transparent bg-white"
              >
                <option value="all">All Activity</option>
                <option value="initiated">Initiated</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="funded">Funded</option>
              </select>
              <select
                value={`${activitySort}-${sortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-') as [ActivitySortField, SortDirection];
                  setActivitySort(field);
                  setSortDirection(direction);
                }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal focus:border-transparent bg-white"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="technician-asc">Technician A-Z</option>
                <option value="technician-desc">Technician Z-A</option>
              </select>
              <Link href="/client/applications" className="text-sm text-teal hover:text-teal/80">
                View All →
              </Link>
            </div>
          </div>
          
          {recentActivity.length === 0 ? (
            <EmptyState
              icon="📋"
              title="No recent activity"
              description="Activity will appear here when customers apply"
              compact
            />
          ) : (
            <>
              {recentActivity.filter(a => activityFilter === 'all' || a.type === activityFilter).length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No {activityFilter} activity</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity
                    .filter(a => activityFilter === 'all' || a.type === activityFilter)
                    .sort((a, b) => {
                      let comparison = 0;
                      switch (activitySort) {
                        case 'date':
                          comparison = new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
                          break;
                        case 'technician':
                          comparison = (a.technicianName || '').localeCompare(b.technicianName || '');
                          break;
                      }
                      return sortDirection === 'asc' ? -comparison : comparison;
                    })
                    .map((activity) => {
                      const { icon, color } = getActivityIcon(activity.type);
                      return (
                        <div key={activity.id} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {activity.customerName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatCurrency(activity.amount)} • {activity.type}
                              {activity.technicianName && ` • ${activity.technicianName}`}
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
            </>
          )}
        </div>


      </main>
    </div>
  );
}
