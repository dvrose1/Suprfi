// ABOUTME: Admin waitlist management page
// ABOUTME: View, filter, search, and manage waitlist entries

'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface WaitlistEntry {
  id: string;
  type: 'homeowner' | 'contractor';
  email: string;
  name: string | null;
  phone: string | null;
  businessName: string | null;
  serviceType: string | null;
  state: string | null;
  zipCode: string | null;
  repairType: string | null;
  status: string;
  source: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  homeowners: number;
  contractors: number;
  thisWeek: number;
  converted: number;
  approved: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminWaitlistPage() {
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Selection for bulk actions
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const fetchWaitlist = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (search) params.set('search', search);
      params.set('page', page.toString());

      const res = await fetch(`/api/v1/admin/waitlist?${params}`);
      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setEntries(data.entries);
      setStats(data.stats);
      setPagination(data.pagination);
      setSelected(new Set());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load waitlist');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, statusFilter, search, page]);

  useEffect(() => {
    fetchWaitlist();
  }, [fetchWaitlist]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const res = await fetch('/api/v1/admin/waitlist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        fetchWaitlist();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleBulkStatusUpdate = async (newStatus: string) => {
    if (selected.size === 0) return;
    try {
      const res = await fetch('/api/v1/admin/waitlist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected), bulkStatus: newStatus }),
      });
      if (res.ok) {
        fetchWaitlist();
      }
    } catch (err) {
      console.error('Failed to bulk update:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      const res = await fetch(`/api/v1/admin/waitlist?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchWaitlist();
      }
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelected(newSelected);
  };

  const toggleSelectAll = () => {
    if (selected.size === entries.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(entries.map((e) => e.id)));
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            Error: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Waitlist Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage homeowner and contractor signups
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href="/admin"
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                ← Back to Dashboard
              </Link>
              <a
                href={`/api/v1/admin/waitlist/export?type=${typeFilter}`}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Export CSV
              </a>
            </div>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Total Signups</div>
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Homeowners</div>
              <div className="text-2xl font-bold text-blue-600">{stats.homeowners}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Contractors</div>
              <div className="text-2xl font-bold text-purple-600">{stats.contractors}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Approved</div>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">This Week</div>
              <div className="text-2xl font-bold text-orange-600">{stats.thisWeek}</div>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              <div className="text-sm text-gray-600">Converted</div>
              <div className="text-2xl font-bold text-teal-600">{stats.converted}</div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by email, name, or business..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="homeowner">Homeowners</option>
              <option value="contractor">Contractors</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="approved">Approved</option>
              <option value="converted">Converted</option>
              <option value="unsubscribed">Unsubscribed</option>
            </select>
          </div>

          {/* Bulk Actions */}
          {selected.size > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {selected.size} selected
              </span>
              <button
                onClick={() => handleBulkStatusUpdate('approved')}
                className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                Approve (Send Invite)
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('converted')}
                className="px-3 py-1 text-sm bg-teal-100 text-teal-700 rounded hover:bg-teal-200"
              >
                Mark Converted
              </button>
              <button
                onClick={() => handleBulkStatusUpdate('unsubscribed')}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
              >
                Mark Unsubscribed
              </button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading...</div>
          ) : entries.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No waitlist entries found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selected.size === entries.length && entries.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Contact
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Details
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {entries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(entry.id)}
                          onChange={() => toggleSelect(entry.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            entry.type === 'homeowner'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {entry.type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">
                          {entry.name || 'No name'}
                        </div>
                        <div className="text-sm text-gray-500">{entry.email}</div>
                        {entry.phone && (
                          <div className="text-xs text-gray-400">{entry.phone}</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {entry.type === 'contractor' ? (
                          <>
                            {entry.businessName && <div>{entry.businessName}</div>}
                            {entry.serviceType && (
                              <div className="text-xs text-gray-400">
                                {entry.serviceType} • {entry.state}
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {entry.zipCode && <div>ZIP: {entry.zipCode}</div>}
                            {entry.repairType && (
                              <div className="text-xs text-gray-400">
                                {entry.repairType}
                              </div>
                            )}
                          </>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={entry.status}
                          onChange={(e) => handleStatusUpdate(entry.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded border ${
                            entry.status === 'approved'
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : entry.status === 'converted'
                              ? 'bg-teal-50 border-teal-200 text-teal-700'
                              : entry.status === 'unsubscribed'
                              ? 'bg-gray-50 border-gray-200 text-gray-500'
                              : 'bg-blue-50 border-blue-200 text-blue-700'
                          }`}
                        >
                          <option value="active">Active</option>
                          {entry.type === 'contractor' && (
                            <option value="approved">Approved</option>
                          )}
                          <option value="converted">Converted</option>
                          <option value="unsubscribed">Unsubscribed</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {formatDate(entry.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(entry.id)}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} entries
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
