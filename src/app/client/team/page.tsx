// ABOUTME: SuprClient team management page
// ABOUTME: Manage team members, invite new users, assign roles

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useContractorAuth } from '@/lib/auth/contractor-context';
import { getRoleDisplayName, getRoleDescription, getManageableRoles, type ContractorRole } from '@/lib/auth/contractor-roles';

interface TeamMember {
  id: string;
  email: string;
  name: string | null;
  role: ContractorRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  stats: {
    linksSent: number;
    applicationsInitiated: number;
  };
}

export default function TeamPage() {
  const { user, loading: authLoading, canAccess } = useContractorAuth();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteName, setInviteName] = useState('');
  const [inviteRole, setInviteRole] = useState<ContractorRole>('tech');
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user) {
      fetchTeam();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchTeam = async () => {
    try {
      const res = await fetch('/api/v1/client/team');
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members);
      }
    } catch (err) {
      console.error('Failed to fetch team:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInviting(true);

    try {
      const res = await fetch('/api/v1/client/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          name: inviteName,
          role: inviteRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send invitation');
        return;
      }

      setSuccess(`Invitation sent to ${inviteEmail}`);
      setShowInviteModal(false);
      setInviteEmail('');
      setInviteName('');
      setInviteRole('tech');
      fetchTeam();
    } catch {
      setError('Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const handleRoleChange = async (memberId: string, newRole: ContractorRole) => {
    try {
      const res = await fetch(`/api/v1/client/team/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (res.ok) {
        fetchTeam();
      }
    } catch (err) {
      console.error('Failed to update role:', err);
    }
  };

  const handleDeactivate = async (memberId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    try {
      const res = await fetch(`/api/v1/client/team/${memberId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchTeam();
      }
    } catch (err) {
      console.error('Failed to deactivate user:', err);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!canAccess('team:view')) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🔒</div>
          <h2 className="text-xl font-semibold text-navy mb-2">Access Denied</h2>
          <p className="text-gray-600">You don&apos;t have permission to view this page.</p>
          <Link href="/client" className="text-teal hover:underline mt-4 inline-block">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const manageableRoles = getManageableRoles(user.role);

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/client" className="flex items-center">
                <span className="text-2xl font-bold font-display">
                  <span className="text-navy">Supr</span>
                  <span className="text-teal">Client</span>
                </span>
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/client" className="text-gray-600 hover:text-navy">Dashboard</Link>
                <Link href="/client/applications" className="text-gray-600 hover:text-navy">Applications</Link>
                <Link href="/client/team" className="text-navy font-medium">Team</Link>
              </nav>
            </div>
            {canAccess('team:invite') && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="bg-teal text-white rounded-lg font-semibold px-4 py-2 hover:bg-teal/90 transition-colors text-sm"
              >
                + Invite Team Member
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-display text-navy">Team Management</h1>
          <p className="text-gray-600 mt-1">Manage your team members and their access</p>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-mint/10 border border-mint/20 rounded-xl text-mint">
            {success}
          </div>
        )}

        {/* Team List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-teal border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading team...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Member</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Activity</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Last Login</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {members.map((member) => (
                    <tr key={member.id} className={!member.isActive ? 'opacity-50' : ''}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-navy text-white rounded-full flex items-center justify-center font-semibold">
                            {member.name?.[0]?.toUpperCase() || member.email[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-navy">
                              {member.name || 'Unnamed'}
                              {member.id === user.id && (
                                <span className="ml-2 text-xs text-teal">(You)</span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{member.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {member.id === user.id || !manageableRoles.includes(member.role) ? (
                          <span className="px-3 py-1 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                            {getRoleDisplayName(member.role)}
                          </span>
                        ) : (
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value as ContractorRole)}
                            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal focus:border-transparent"
                          >
                            {manageableRoles.map((role) => (
                              <option key={role} value={role}>
                                {getRoleDisplayName(role)}
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-navy">{member.stats.linksSent} links sent</div>
                          <div className="text-gray-500">{member.stats.applicationsInitiated} apps</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {member.lastLoginAt
                          ? new Date(member.lastLoginAt).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className="px-6 py-4">
                        {member.id !== user.id && member.isActive && canAccess('team:deactivate') && (
                          <button
                            onClick={() => handleDeactivate(member.id)}
                            className="text-error hover:text-error/80 text-sm font-medium"
                          >
                            Deactivate
                          </button>
                        )}
                        {!member.isActive && (
                          <span className="text-gray-400 text-sm">Deactivated</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Role Legend */}
        <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-navy mb-4">Role Permissions</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(['owner', 'manager', 'tech', 'viewer'] as ContractorRole[]).map((role) => (
              <div key={role} className="p-4 bg-gray-50 rounded-xl">
                <div className="font-medium text-navy">{getRoleDisplayName(role)}</div>
                <div className="text-sm text-gray-500 mt-1">{getRoleDescription(role)}</div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-navy mb-4">Invite Team Member</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                  placeholder="colleague@company.com"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as ContractorRole)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                >
                  {manageableRoles.map((role) => (
                    <option key={role} value={role}>
                      {getRoleDisplayName(role)} - {getRoleDescription(role)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setError('');
                  }}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 bg-teal text-white rounded-lg font-semibold px-4 py-3 hover:bg-teal/90 transition-colors disabled:opacity-50"
                >
                  {inviting ? 'Sending...' : 'Send Invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
