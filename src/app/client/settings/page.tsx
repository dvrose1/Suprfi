// ABOUTME: SuprClient settings page
// ABOUTME: Profile, notifications, API keys, and security settings

'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useContractorAuth } from '@/lib/auth/contractor-context';

interface Settings {
  profile: {
    businessName: string | null;
    name: string | null;
    email: string;
    phone: string | null;
  };
  notifications: {
    emailOnSubmission: boolean;
    emailOnApproval: boolean;
    emailOnFunding: boolean;
    emailWeeklyDigest: boolean;
    smsOnHighValue: boolean;
  };
  apiKey: string | null;
  sessions: Array<{
    id: string;
    lastActiveAt: string;
    ipAddress: string | null;
    userAgent: string | null;
    current: boolean;
  }>;
}

type Tab = 'profile' | 'notifications' | 'api' | 'security' | 'integrations';

interface CrmConnection {
  id: string;
  crmType: string;
  accountId: string;
  accountName: string | null;
  lastUsedAt: string | null;
  lastError: string | null;
  connectedAt: string;
}

function SettingsPage() {
  const { user, loading: authLoading, canAccess, refreshUser } = useContractorAuth();
  const searchParams = useSearchParams();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle URL params for tab selection and messages
  useEffect(() => {
    const tab = searchParams.get('tab') as Tab;
    if (tab && ['profile', 'notifications', 'api', 'security', 'integrations'].includes(tab)) {
      setActiveTab(tab);
    }
    
    const successParam = searchParams.get('success');
    const errorParam = searchParams.get('error');
    const account = searchParams.get('account');
    
    if (successParam === 'jobber' && account) {
      setSuccess(`Successfully connected Jobber account: ${account}`);
    }
    if (errorParam) {
      setError(decodeURIComponent(errorParam));
    }
  }, [searchParams]);

  // Form states
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [notifications, setNotifications] = useState<Settings['notifications']>({
    emailOnSubmission: true,
    emailOnApproval: true,
    emailOnFunding: true,
    emailWeeklyDigest: false,
    smsOnHighValue: false,
  });
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [crmConnections, setCrmConnections] = useState<CrmConnection[]>([]);
  const [disconnectingCrm, setDisconnectingCrm] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchSettings();
      fetchCrmConnections();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/v1/client/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
        setProfileName(data.profile.name || '');
        setProfilePhone(data.profile.phone || '');
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCrmConnections = async () => {
    try {
      const res = await fetch('/api/v1/client/integrations');
      if (res.ok) {
        const data = await res.json();
        setCrmConnections(data.connections || []);
      }
    } catch (err) {
      console.error('Failed to fetch CRM connections:', err);
    }
  };

  const handleDisconnectCrm = async (connectionId: string) => {
    if (!confirm('Are you sure you want to disconnect this CRM? This will stop automatic financing offers.')) {
      return;
    }
    
    setDisconnectingCrm(connectionId);
    try {
      const res = await fetch(`/api/v1/client/integrations/${connectionId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setCrmConnections(prev => prev.filter(c => c.id !== connectionId));
        setSuccess('CRM disconnected successfully');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to disconnect');
      }
    } catch {
      setError('Failed to disconnect');
    } finally {
      setDisconnectingCrm(null);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await fetch('/api/v1/client/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          phone: profilePhone,
        }),
      });

      if (res.ok) {
        setSuccess('Profile updated successfully');
        refreshUser();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to save');
      }
    } catch {
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await fetch('/api/v1/client/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications }),
      });

      if (res.ok) {
        setSuccess('Notification preferences saved');
      } else {
        setError('Failed to save');
      }
    } catch {
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateApiKey = async () => {
    if (!confirm('This will invalidate your current API key. Continue?')) return;

    try {
      const res = await fetch('/api/v1/client/settings/api-key', {
        method: 'POST',
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(prev => prev ? { ...prev, apiKey: data.apiKey } : null);
        setSuccess('New API key generated');
      }
    } catch {
      setError('Failed to generate API key');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    setSaving(true);

    try {
      const res = await fetch('/api/v1/client/settings/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (res.ok) {
        setSuccess('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to change password');
      }
    } catch {
      setError('Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'integrations', label: 'Integrations', icon: '🔗' },
    ...(canAccess('settings:manage_api_key') ? [{ id: 'api' as Tab, label: 'API Keys', icon: '🔑' }] : []),
    { id: 'security', label: 'Security', icon: '🔒' },
  ];

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href="/client" className="text-gray-600 hover:text-navy">
                ← Back
              </Link>
              <span className="text-gray-300">|</span>
              <span className="font-medium text-navy">Settings</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setError('');
                setSuccess('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-teal text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-mint/10 border border-mint/20 rounded-xl text-mint">
            {success}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-teal border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : (
          <>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-navy mb-6">Profile Settings</h2>
                <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={settings?.profile.email || ''}
                      disabled
                      className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Contact support to change email</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-teal text-white rounded-lg font-semibold px-6 py-3 hover:bg-teal/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-navy mb-6">Notification Preferences</h2>
                <div className="space-y-4 max-w-md">
                  {[
                    { key: 'emailOnSubmission', label: 'Email when application is submitted' },
                    { key: 'emailOnApproval', label: 'Email when application is approved' },
                    { key: 'emailOnFunding', label: 'Email when loan is funded' },
                    { key: 'emailWeeklyDigest', label: 'Weekly performance digest' },
                    { key: 'smsOnHighValue', label: 'SMS for high-value approvals ($10k+)' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notifications[item.key as keyof typeof notifications]}
                        onChange={(e) =>
                          setNotifications({ ...notifications, [item.key]: e.target.checked })
                        }
                        className="w-5 h-5 rounded border-gray-300 text-teal focus:ring-teal"
                      />
                      <span className="text-gray-700">{item.label}</span>
                    </label>
                  ))}
                  <button
                    onClick={handleSaveNotifications}
                    disabled={saving}
                    className="mt-6 bg-teal text-white rounded-lg font-semibold px-6 py-3 hover:bg-teal/90 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Preferences'}
                  </button>
                </div>
              </div>
            )}

            {/* Integrations Tab */}
            {activeTab === 'integrations' && (
              <div className="space-y-6">
                {/* Jobber Integration */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <span className="text-2xl font-bold text-green-600">J</span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-navy">Jobber</h2>
                      <p className="text-gray-500 text-sm">Automatically offer financing when quotes are created</p>
                    </div>
                  </div>

                  {crmConnections.filter(c => c.crmType === 'jobber').length > 0 ? (
                    <div className="space-y-4">
                      {crmConnections
                        .filter(c => c.crmType === 'jobber')
                        .map(conn => (
                          <div key={conn.id} className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                <span className="font-medium text-navy">
                                  {conn.accountName || `Account ${conn.accountId}`}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                Connected {new Date(conn.connectedAt).toLocaleDateString()}
                              </p>
                              {conn.lastUsedAt && (
                                <p className="text-xs text-gray-400">
                                  Last sync: {new Date(conn.lastUsedAt).toLocaleString()}
                                </p>
                              )}
                              {conn.lastError && (
                                <p className="text-xs text-red-500 mt-1">{conn.lastError}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleDisconnectCrm(conn.id)}
                              disabled={disconnectingCrm === conn.id}
                              className="px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg disabled:opacity-50"
                            >
                              {disconnectingCrm === conn.id ? 'Disconnecting...' : 'Disconnect'}
                            </button>
                          </div>
                        ))}
                      
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-sm text-gray-600 mb-3">
                          When a quote of $500 or more is created in Jobber, we&apos;ll automatically text 
                          your customer with a financing link.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-600 mb-4">
                        Connect your Jobber account to automatically send financing offers when you create quotes.
                      </p>
                      <a
                        href="/api/v1/auth/jobber/connect?source=client"
                        className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Connect Jobber Account
                      </a>
                    </div>
                  )}
                </div>

                {/* Other Integrations Coming Soon */}
                <div className="bg-white rounded-2xl shadow-lg p-6 opacity-60">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                      <span className="text-xl text-gray-400">+</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-500">More Integrations Coming Soon</h3>
                      <p className="text-sm text-gray-400">ServiceTitan, Housecall Pro, and more</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* API Keys Tab */}
            {activeTab === 'api' && canAccess('settings:manage_api_key') && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-semibold text-navy mb-6">API Keys</h2>
                <p className="text-gray-600 mb-4">
                  Use your API key to integrate SuprFi with your CRM or other systems.
                </p>
                <div className="bg-gray-50 rounded-xl p-4 mb-4">
                  <div className="text-sm text-gray-500 mb-1">Your API Key</div>
                  <div className="font-mono text-navy">
                    {settings?.apiKey
                      ? `${settings.apiKey.slice(0, 8)}...${settings.apiKey.slice(-4)}`
                      : 'No API key generated'}
                  </div>
                </div>
                <button
                  onClick={handleGenerateApiKey}
                  className="bg-navy text-white rounded-lg font-semibold px-6 py-3 hover:bg-navy/90 transition-colors"
                >
                  {settings?.apiKey ? 'Regenerate API Key' : 'Generate API Key'}
                </button>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-navy mb-6">Change Password</h2>
                  <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        minLength={8}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-teal text-white rounded-lg font-semibold px-6 py-3 hover:bg-teal/90 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Changing...' : 'Change Password'}
                    </button>
                  </form>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-xl font-semibold text-navy mb-4">Active Sessions</h2>
                  <div className="space-y-3">
                    {settings?.sessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-4 rounded-xl ${session.current ? 'bg-teal/10 border border-teal/20' : 'bg-gray-50'}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-navy">
                              {session.current ? 'Current Session' : 'Other Device'}
                            </div>
                            <div className="text-sm text-gray-500">
                              Last active: {new Date(session.lastActiveAt).toLocaleString()}
                            </div>
                            {session.ipAddress && (
                              <div className="text-xs text-gray-400">IP: {session.ipAddress}</div>
                            )}
                          </div>
                          {session.current && (
                            <span className="px-2 py-1 bg-teal text-white text-xs rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// Wrapper component for Suspense boundary
export default function SettingsPageWrapper() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal border-t-transparent rounded-full"></div>
      </div>
    }>
      <SettingsPage />
    </Suspense>
  );
}
