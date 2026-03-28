// ABOUTME: Admin dashboard page
// ABOUTME: Shows stats and quick actions for SuprOps with animations

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils/format';
import { transitions, staggerContainer, fadeInUp, layoutClasses } from '@/lib/animations';

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
      <div className="min-h-screen bg-light-gray flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-teal border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-medium-gray">Loading dashboard...</p>
        </div>
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
  const prefersReducedMotion = useReducedMotion();

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
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-white">{user?.email}</div>
                <div className="text-xs text-white/60 capitalize">{user?.role}</div>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="px-4 py-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main id="main-content" className={layoutClasses.pageContent}>
        {/* Welcome */}
        <motion.div 
          className="mb-8"
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={transitions.entrance}
        >
          <h1 className="text-2xl sm:text-3xl font-bold font-display text-navy">
            Welcome back, {user?.name || 'Admin'}
          </h1>
          <p className="text-medium-gray mt-1">SuprOps Dashboard</p>
        </motion.div>

        {/* Stats Grid - Hero stat first, then secondary */}
        <motion.div 
          className={layoutClasses.statsGrid}
          initial={prefersReducedMotion ? false : "hidden"}
          animate="visible"
          variants={staggerContainer}
        >
          {/* Hero Stat - Total Applications */}
          <motion.div variants={fadeInUp}>
            <Link href="/admin/applications" className={`${layoutClasses.cardHero} hover:shadow-lg transition-all block`}>
              <div className={layoutClasses.statLabel}>Total Applications</div>
              <div className={`${layoutClasses.statHero} text-navy`}>{totalApps}</div>
              <div className={`${layoutClasses.statSubtext} text-teal font-medium`}>View all →</div>
            </Link>
          </motion.div>
          
          {/* Secondary Stats */}
          <motion.div variants={fadeInUp} className={layoutClasses.cardInteractive}>
            <div className={layoutClasses.statLabel}>Approval Rate</div>
            <div className={`${layoutClasses.statNormal} text-teal`}>{approvalRate}%</div>
            <div className={`${layoutClasses.statSubtext} text-medium-gray`}>{approvedApps} of {totalApps}</div>
          </motion.div>
          <motion.div variants={fadeInUp} className={layoutClasses.cardInteractive}>
            <div className={layoutClasses.statLabel}>Total Funded</div>
            <div className={`${layoutClasses.statNormal} text-navy`}>
              {formatCurrency(totalFunded || 0)}
            </div>
            <div className={`${layoutClasses.statSubtext} text-medium-gray`}>Lifetime</div>
          </motion.div>
          <motion.div variants={fadeInUp} className={`${layoutClasses.cardInteractive} ${manualReviews > 0 ? 'border-l-4 border-l-warning bg-warning/5' : ''}`}>
            <div className={layoutClasses.statLabel}>Manual Reviews</div>
            <div className={`${layoutClasses.statNormal} ${manualReviews > 0 ? 'text-warning' : 'text-navy'}`}>{manualReviews}</div>
            <div className={`${layoutClasses.statSubtext} ${manualReviews > 0 ? 'text-warning font-medium' : 'text-medium-gray'}`}>
              {manualReviews > 0 ? 'Needs attention' : 'No pending'}
            </div>
          </motion.div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div 
          className={`${layoutClasses.twoColGrid} mt-8`}
          initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...transitions.entrance, delay: 0.2 }}
        >
          <div className={layoutClasses.cardPrimary}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold font-display text-navy">Recent Applications</h2>
              <Link href="/admin/applications" className="text-sm text-teal hover:text-teal/80 font-medium">
                View All →
              </Link>
            </div>
            {recentApps.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-light-gray rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-medium-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-medium-gray font-medium">No applications yet</p>
                <p className="text-sm text-medium-gray/70 mt-1">When customers apply through your contractors, their applications will appear here.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentApps.map((app) => (
                  <Link
                    key={app.id}
                    href={`/admin/applications/${app.id}`}
                    className="block p-3 rounded-xl border border-gray-100 hover:border-teal/30 hover:bg-teal/5 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-navy">
                          {app.customer.firstName} {app.customer.lastName}
                        </div>
                        <div className="text-sm text-medium-gray">
                          {formatCurrency(Number(app.job.estimateAmount))}
                        </div>
                      </div>
                      <div className="text-xs text-medium-gray">
                        {new Date(app.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className={layoutClasses.cardPrimary}>
            <h2 className="text-lg font-semibold font-display text-navy mb-4">Quick Actions</h2>
            
            {/* Primary Actions - Always visible */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <Link 
                href="/admin/applications?status=submitted"
                className="px-4 py-3 bg-cyan/10 text-navy rounded-xl hover:bg-cyan/20 border border-cyan/20 transition-colors"
              >
                <div className="font-medium">Review Submitted</div>
                <div className="text-sm text-medium-gray">{submittedApps} waiting</div>
              </Link>
              <Link
                href="/admin/manual-review"
                className={`px-4 py-3 rounded-xl border transition-colors ${
                  manualReviews > 0 
                    ? 'bg-warning/10 border-warning/20 hover:bg-warning/20' 
                    : 'bg-light-gray border-gray-100 hover:bg-gray-200'
                }`}
              >
                <div className="font-medium text-navy">Manual Reviews</div>
                <div className={`text-sm ${manualReviews > 0 ? 'text-warning font-medium' : 'text-medium-gray'}`}>
                  {manualReviews > 0 ? `${manualReviews} pending` : 'None'}
                </div>
              </Link>
            </div>

            {/* Secondary Actions - Compact links */}
            <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
              <Link href="/admin/applications" className="px-3 py-1.5 text-sm text-navy hover:text-teal transition-colors">
                All Applications
              </Link>
              <Link href="/admin/contractors" className="px-3 py-1.5 text-sm text-navy hover:text-teal transition-colors">
                Contractors
              </Link>
              <Link href="/admin/waitlist" className="px-3 py-1.5 text-sm text-navy hover:text-teal transition-colors">
                Waitlist
              </Link>
              {(user?.role === 'god' || user?.role === 'admin') && (
                <Link href="/admin/users" className="px-3 py-1.5 text-sm text-navy hover:text-teal transition-colors">
                  Users
                </Link>
              )}
              <Link href="/admin/settings/integrations" className="px-3 py-1.5 text-sm text-navy hover:text-teal transition-colors">
                Integrations
              </Link>
              {user?.role === 'god' && (
                <Link href="/admin/audit" className="px-3 py-1.5 text-sm text-navy hover:text-teal transition-colors">
                  Audit Log
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
