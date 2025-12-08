// ABOUTME: Admin user management page
// ABOUTME: List, invite, and manage admin users

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

type AdminRole = 'god' | 'admin' | 'ops' | 'viewer';

export default function UsersPage() {
  const { user: currentUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [manageableRoles, setManageableRoles] = useState<AdminRole[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<AdminRole>('viewer');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      router.push('/admin/login');
    }
  }, [authLoading, currentUser, router]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch('/api/v1/admin/users');
        if (!res.ok) {
          if (res.status === 403) {
            setError('You do not have permission to view users');
          } else {
            setError('Failed to load users');
          }
          return;
        }
        const data = await res.json();
        setUsers(data.users);
        setManageableRoles(data.manageableRoles);
        setCurrentUserId(data.currentUserId);
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError(null);
    setInviting(true);

    try {
      const res = await fetch('/api/v1/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          name: inviteName,
          role: inviteRole,
          sendInvite: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setInviteError(data.error || 'Failed to invite user');
        setInviting(false);
        return;
      }

      // Add new user to list
      setUsers([data.user, ...users]);
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteName('');
      setInviteRole('viewer');
    } catch (err) {
      setInviteError('Failed to invite user');
    } finally {
      setInviting(false);
    }
  };

  const handleToggleActive = async (userId: string, currentlyActive: boolean) => {
    try {
      const res = await fetch(`/api/v1/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !currentlyActive }),
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(users.map(u => u.id === userId ? data.user : u));
      }
    } catch (err) {
      console.error('Failed to update user:', err);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'god':
        return 'bg-purple-100 text-purple-700';
      case 'admin':
        return 'bg-blue-100 text-blue-700';
      case 'ops':
        return 'bg-green-100 text-green-700';
      case 'viewer':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getRoleDisplayName = (role: string) => {
    const names: Record<string, string> = {
      god: 'God',
      admin: 'Admin',
      ops: 'Ops',
      viewer: 'Viewer',
    };
    return names[role] || role;
  };

  if (authLoading || loading) {
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <Link href="/admin" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">User Management</h1>
              <p className="text-gray-600 mt-1">Manage admin users and permissions</p>
            </div>
            {manageableRoles.length > 0 && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 bg-teal text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                + Invite User
              </button>
            )}
          </div>
        </div>

        {/* Role Legend */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Role Permissions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor('god')}`}>God</span>
              <p className="text-gray-500 mt-1">Full access, audit logs, manage all users</p>
            </div>
            <div>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor('admin')}`}>Admin</span>
              <p className="text-gray-500 mt-1">Full ops access, manage Ops & Viewers</p>
            </div>
            <div>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor('ops')}`}>Ops</span>
              <p className="text-gray-500 mt-1">Standard operations access</p>
            </div>
            <div>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor('viewer')}`}>Viewer</span>
              <p className="text-gray-500 mt-1">Read-only access</p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className={user.id === currentUserId ? 'bg-blue-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || 'No name'}
                          {user.id === currentUserId && (
                            <span className="ml-2 text-xs text-blue-600">(You)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isActive ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLoginAt
                        ? new Date(user.lastLoginAt).toLocaleDateString()
                        : 'Never'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {user.id !== currentUserId && manageableRoles.includes(user.role as AdminRole) && (
                        <button
                          onClick={() => handleToggleActive(user.id, user.isActive)}
                          className={`text-sm ${
                            user.isActive
                              ? 'text-red-600 hover:text-red-800'
                              : 'text-green-600 hover:text-green-800'
                          }`}
                        >
                          {user.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Invite Modal */}
        {showInviteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Invite New User</h2>
              
              <form onSubmit={handleInvite} className="space-y-4">
                {inviteError && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">
                    {inviteError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal focus:border-teal"
                    placeholder="user@suprfi.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal focus:border-teal"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as AdminRole)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-teal focus:border-teal"
                  >
                    {manageableRoles.map((role) => (
                      <option key={role} value={role}>
                        {getRoleDisplayName(role)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="flex-1 px-4 py-2 bg-teal text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {inviting ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
