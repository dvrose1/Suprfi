// ABOUTME: Admin audit log page
// ABOUTME: View all admin actions (God role only)

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';

interface AuditLog {
  id: string;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
}

interface FilterUser {
  id: string;
  email: string;
  name: string | null;
}

export default function AuditPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterAction, setFilterAction] = useState('');
  const [filterUser, setFilterUser] = useState('');
  const [availableActions, setAvailableActions] = useState<{ action: string; count: number }[]>([]);
  const [availableUsers, setAvailableUsers] = useState<FilterUser[]>([]);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/admin/login');
    }
  }, [authLoading, currentUser, router]);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: page.toString() });
        if (filterAction) params.set('action', filterAction);
        if (filterUser) params.set('userId', filterUser);

        const res = await fetch(`/api/v1/admin/audit?${params}`);
        
        if (!res.ok) {
          if (res.status === 403) {
            setError('You do not have permission to view audit logs');
          } else {
            setError('Failed to load audit logs');
          }
          return;
        }

        const data = await res.json();
        setLogs(data.logs);
        setTotalPages(data.pagination.totalPages);
        setAvailableActions(data.filters.actions);
        setAvailableUsers(data.filters.users);
      } catch (err) {
        setError('Failed to load audit logs');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchLogs();
    }
  }, [currentUser, page, filterAction, filterUser]);

  const getActionDisplayName = (action: string): string => {
    const names: Record<string, string> = {
      login: 'Logged in',
      logout: 'Logged out',
      login_failed: 'Failed login',
      password_reset_requested: 'Password reset requested',
      password_reset_completed: 'Password reset completed',
      user_created: 'Created user',
      user_updated: 'Updated user',
      user_deactivated: 'Deactivated user',
      user_reactivated: 'Reactivated user',
      role_changed: 'Changed role',
      session_force_logout: 'Force logout',
      application_approved: 'Approved application',
      application_declined: 'Declined application',
      contractor_approved: 'Approved contractor',
      contractor_suspended: 'Suspended contractor',
    };
    return names[action] || action;
  };

  const getActionColor = (action: string): string => {
    if (action.includes('failed') || action.includes('deactivated') || action.includes('suspended')) {
      return 'text-red-600';
    }
    if (action.includes('approved') || action.includes('created') || action.includes('reactivated')) {
      return 'text-green-600';
    }
    if (action.includes('login') || action.includes('logout')) {
      return 'text-blue-600';
    }
    return 'text-gray-600';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (authLoading || (loading && logs.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">{error}</div>
          <Link href="/admin" className="text-blue-600 hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Audit Log</h1>
          <p className="text-gray-600 mt-1">Track all admin actions and changes</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <select
                value={filterAction}
                onChange={(e) => { setFilterAction(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal focus:border-teal"
              >
                <option value="">All Actions</option>
                {availableActions.map((a) => (
                  <option key={a.action} value={a.action}>
                    {getActionDisplayName(a.action)} ({a.count})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
              <select
                value={filterUser}
                onChange={(e) => { setFilterUser(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal focus:border-teal"
              >
                <option value="">All Users</option>
                {availableUsers.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name || u.email}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    IP Address
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(log.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {log.user.name || 'Unknown'}
                      </div>
                      <div className="text-xs text-gray-500">{log.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-sm font-medium ${getActionColor(log.action)}`}>
                        {getActionDisplayName(log.action)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {log.targetType && (
                        <div>
                          <span className="text-gray-400">Target:</span>{' '}
                          {log.targetType}
                          {log.targetId && (
                            <code className="ml-1 text-xs bg-gray-100 px-1 rounded">
                              {log.targetId.substring(0, 8)}...
                            </code>
                          )}
                        </div>
                      )}
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="text-xs text-gray-400 mt-1">
                          {JSON.stringify(log.metadata).substring(0, 50)}
                          {JSON.stringify(log.metadata).length > 50 && '...'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.ipAddress || '-'}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No audit logs found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
