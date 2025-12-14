// ABOUTME: SuprClient applications list page
// ABOUTME: Card-based grid view of customer financing applications

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useContractorAuth } from '@/lib/auth/contractor-context';
import ClientHeader from '@/components/client/ClientHeader';

interface Application {
  id: string;
  status: string;
  customer: {
    name: string;
    maskedEmail: string;
    maskedPhone: string;
  };
  job: {
    amount: number;
    serviceType: string | null;
  };
  createdAt: string;
  updatedAt: string;
  fundedAt?: string;
}

type StatusFilter = 'all' | 'initiated' | 'submitted' | 'approved' | 'funded' | 'declined';

export default function ApplicationsPage() {
  const { user, loading: authLoading, canAccess } = useContractorAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<Record<string, number>>({});

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/v1/client/applications?${params}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications);
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchApplications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications();
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'funded':
        return 'bg-mint/20 text-mint border-mint/30';
      case 'approved':
        return 'bg-teal/20 text-teal border-teal/30';
      case 'submitted':
        return 'bg-cyan/20 text-cyan border-cyan/30';
      case 'declined':
        return 'bg-error/20 text-error border-error/30';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white">
      <ClientHeader />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-navy">Applications</h1>
          <p className="text-gray-600 mt-1">Track your customers&apos; financing requests</p>
        </div>

        {/* Stats - 4 tiles on mobile, 5 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
          {[
            { key: 'all', label: 'All', count: Object.values(stats).reduce((a, b) => a + b, 0), hideOnMobile: false },
            { key: 'initiated', label: 'In Progress', count: stats.initiated || 0, hideOnMobile: false },
            { key: 'submitted', label: 'Submitted', count: stats.submitted || 0, hideOnMobile: true },
            { key: 'approved', label: 'Approved', count: stats.approved || 0, hideOnMobile: false },
            { key: 'funded', label: 'Funded', count: stats.funded || 0, hideOnMobile: false },
          ].map((stat) => (
            <button
              key={stat.key}
              onClick={() => setStatusFilter(stat.key as StatusFilter)}
              className={`p-4 rounded-xl transition-all ${
                stat.hideOnMobile ? 'hidden lg:block' : ''
              } ${
                statusFilter === stat.key
                  ? 'bg-teal text-white shadow-lg'
                  : 'bg-white hover:shadow-md'
              }`}
            >
              <div className={`text-2xl font-bold ${statusFilter === stat.key ? '' : 'text-navy'}`}>
                {stat.count}
              </div>
              <div className={`text-sm ${statusFilter === stat.key ? 'text-white/80' : 'text-gray-500'}`}>
                {stat.label}
              </div>
            </button>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-navy text-white rounded-xl font-medium hover:bg-navy/90 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Applications Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-teal border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading applications...</p>
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-5xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-navy mb-2">No applications found</h3>
            <p className="text-gray-600 mb-6">
              {statusFilter !== 'all'
                ? `No ${statusFilter} applications yet.`
                : 'Send a financing link to get started.'}
            </p>
            {canAccess('application:send_link') && (
              <Link
                href="/client/new"
                className="inline-flex items-center gap-2 bg-teal text-white rounded-lg font-semibold px-6 py-3 hover:bg-teal/90 transition-colors"
              >
                Send Financing Link
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {applications.map((app) => (
              <Link
                key={app.id}
                href={`/client/applications/${app.id}`}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-navy text-lg">{app.customer.name}</h3>
                    <p className="text-sm text-gray-500">{app.customer.maskedEmail}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(app.status)}`}>
                    {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                  </span>
                </div>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-navy">
                        ${app.job.amount.toLocaleString()}
                      </div>
                      {app.job.serviceType && (
                        <div className="text-sm text-gray-500 capitalize">
                          {app.job.serviceType}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <div>{new Date(app.createdAt).toLocaleDateString()}</div>
                      {app.fundedAt && (
                        <div className="text-mint">Funded {new Date(app.fundedAt).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
