// ABOUTME: SuprClient applications list page
// ABOUTME: Card-based grid view of customer financing applications

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useContractorAuth } from '@/lib/auth/contractor-context';
import ClientHeader from '@/components/client/ClientHeader';
import { formatServiceType } from '@/lib/utils/format';

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
  technician?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  fundedAt?: string;
}

interface Technician {
  id: string;
  name: string;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'declined' | 'expired' | 'cancelled';
type SortField = 'date' | 'technician';
type SortDirection = 'asc' | 'desc';

export default function ApplicationsPage() {
  const { user, loading: authLoading, canAccess } = useContractorAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [technicianFilter, setTechnicianFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<Record<string, number>>({});
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (technicianFilter !== 'all') params.set('technician', technicianFilter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/v1/client/applications?${params}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications);
        setStats(data.stats);
        if (data.technicians) {
          setTechnicians(data.technicians);
        }
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
  }, [user, statusFilter, technicianFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchApplications();
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-teal/20 text-teal border-teal/30';
      case 'pending':
        return 'bg-cyan/20 text-cyan border-cyan/30';
      case 'declined':
      case 'cancelled':
        return 'bg-error/20 text-error border-error/30';
      case 'expired':
        return 'bg-warning/20 text-warning border-warning/30';
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

        {/* Search and Filters */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal focus:border-transparent"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal focus:border-transparent bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
              <option value="expired">Expired</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select
              value={`${sortField}-${sortDirection}`}
              onChange={(e) => {
                const [field, direction] = e.target.value.split('-') as [SortField, SortDirection];
                setSortField(field);
                setSortDirection(direction);
              }}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal focus:border-transparent bg-white"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="technician-asc">Technician A-Z</option>
              <option value="technician-desc">Technician Z-A</option>
            </select>
            {technicians.length > 1 && (
              <select
                value={technicianFilter}
                onChange={(e) => setTechnicianFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal focus:border-transparent bg-white"
              >
                <option value="all">All Technicians</option>
                {technicians.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.name}
                  </option>
                ))}
              </select>
            )}
            <button
              type="submit"
              className="px-6 py-3 bg-navy text-white rounded-xl font-medium hover:bg-navy/90 transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Applications List - Linear Layout */}
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
          <div className="space-y-4">
            {[...applications]
              .sort((a, b) => {
                let comparison = 0;
                switch (sortField) {
                  case 'date':
                    comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    break;
                  case 'technician':
                    comparison = (a.technician?.name || '').localeCompare(b.technician?.name || '');
                    break;
                }
                return sortDirection === 'asc' ? -comparison : comparison;
              })
              .map((app) => (
              <Link
                key={app.id}
                href={`/client/applications/${app.id}`}
                className="block bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 flex-1 min-w-0">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-navy text-lg truncate">{app.customer.name}</h3>
                      <p className="text-sm text-gray-500">{app.customer.maskedEmail}</p>
                    </div>
                    <div className="hidden sm:block text-center">
                      <div className="text-xl font-bold text-navy">
                        ${app.job.amount.toLocaleString()}
                      </div>
                      {app.job.serviceType && (
                        <div className="text-sm text-gray-500">
                          {formatServiceType(app.job.serviceType)}
                        </div>
                      )}
                    </div>
                    {app.technician && (
                      <div className="hidden md:block text-center min-w-[120px]">
                        <div className="text-sm text-gray-500">Rep</div>
                        <div className="text-sm text-teal font-medium truncate">{app.technician.name}</div>
                      </div>
                    )}
                    <div className="hidden sm:block text-center min-w-[100px]">
                      <div className="text-sm text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</div>
                      {app.fundedAt && (
                        <div className="text-xs text-mint">Funded {new Date(app.fundedAt).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${getStatusStyle(app.status)}`}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </span>
                    <span className="text-gray-400">→</span>
                  </div>
                </div>
                {/* Mobile: Show amount and date below */}
                <div className="flex items-center justify-between mt-3 sm:hidden border-t border-gray-100 pt-3">
                  <div>
                    <span className="text-lg font-bold text-navy">${app.job.amount.toLocaleString()}</span>
                    {app.job.serviceType && (
                      <span className="text-sm text-gray-500 ml-2">{formatServiceType(app.job.serviceType)}</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">{new Date(app.createdAt).toLocaleDateString()}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
