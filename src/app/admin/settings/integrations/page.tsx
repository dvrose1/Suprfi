// ABOUTME: Admin integrations settings page
// ABOUTME: Allows connecting/disconnecting CRM integrations like Jobber

'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';

interface JobberConnection {
  id: string;
  accountId: string;
  accountName: string | null;
  scope: string | null;
  lastUsedAt: string | null;
  lastError: string | null;
  tokenExpiresAt: string | null;
  connectedAt: string;
  contractorId: string | null;
}

interface JobberStatus {
  success: boolean;
  configured: boolean;
  connected: boolean;
  connections: JobberConnection[];
}

function IntegrationsContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [jobberStatus, setJobberStatus] = useState<JobberStatus | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);
  const [disconnecting, setDisconnecting] = useState<string | null>(null);

  // Check for success/error messages from OAuth callback
  const successCrm = searchParams.get('success');
  const successAccount = searchParams.get('account');
  const errorMessage = searchParams.get('error');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    const fetchJobberStatus = async () => {
      try {
        const res = await fetch('/api/v1/auth/jobber/status');
        if (res.ok) {
          const data = await res.json();
          setJobberStatus(data);
        }
      } catch (err) {
        console.error('Failed to fetch Jobber status:', err);
      } finally {
        setStatusLoading(false);
      }
    };

    if (user) {
      fetchJobberStatus();
    }
  }, [user]);

  const handleDisconnect = async (connectionId: string) => {
    if (!confirm('Are you sure you want to disconnect this Jobber account?')) {
      return;
    }

    setDisconnecting(connectionId);
    try {
      const res = await fetch(`/api/v1/auth/jobber/status?connection_id=${connectionId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        // Refresh status
        const statusRes = await fetch('/api/v1/auth/jobber/status');
        if (statusRes.ok) {
          setJobberStatus(await statusRes.json());
        }
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to disconnect');
      }
    } catch (err) {
      console.error('Failed to disconnect:', err);
      alert('Failed to disconnect');
    } finally {
      setDisconnecting(null);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
          <p className="text-gray-600 mt-1">Connect external CRM systems to SuprFi</p>
        </div>

        {/* Success Message */}
        {successCrm && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="text-green-800">
                Successfully connected to {successCrm === 'jobber' ? 'Jobber' : successCrm}
                {successAccount && <span className="font-medium"> ({successAccount})</span>}
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <p className="text-red-800">{errorMessage}</p>
            </div>
          </div>
        )}

        {/* Jobber Integration Card */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                  <span className="text-2xl font-bold text-green-600">J</span>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Jobber</h2>
                  <p className="text-sm text-gray-500">Connect to sync customers and quotes</p>
                </div>
              </div>
              {statusLoading ? (
                <span className="text-gray-400">Loading...</span>
              ) : jobberStatus?.configured ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Configured
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Not Configured
                </span>
              )}
            </div>
          </div>

          <div className="p-6">
            {statusLoading ? (
              <div className="text-center py-4">
                <p className="text-gray-500">Loading connection status...</p>
              </div>
            ) : !jobberStatus?.configured ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  Jobber OAuth is not configured. Please set the following environment variables:
                </p>
                <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                  <li>JOBBER_CLIENT_ID</li>
                  <li>JOBBER_CLIENT_SECRET</li>
                  <li>JOBBER_REDIRECT_URI</li>
                </ul>
              </div>
            ) : jobberStatus.connected ? (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Connected Accounts</h3>
                {jobberStatus.connections.map((conn) => (
                  <div key={conn.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{conn.accountName || conn.accountId}</p>
                        <p className="text-sm text-gray-500">
                          Connected {new Date(conn.connectedAt).toLocaleDateString()}
                        </p>
                        {conn.lastUsedAt && (
                          <p className="text-xs text-gray-400">
                            Last used: {new Date(conn.lastUsedAt).toLocaleString()}
                          </p>
                        )}
                        {conn.lastError && (
                          <p className="text-xs text-red-500 mt-1">{conn.lastError}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleDisconnect(conn.id)}
                        disabled={disconnecting === conn.id}
                        className="px-3 py-1.5 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md disabled:opacity-50"
                      >
                        {disconnecting === conn.id ? 'Disconnecting...' : 'Disconnect'}
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t border-gray-200">
                  <a
                    href="/api/v1/auth/jobber/connect"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Connect Another Account
                  </a>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">No Jobber accounts connected yet.</p>
                <a
                  href="/api/v1/auth/jobber/connect"
                  className="inline-flex items-center px-6 py-3 text-base font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                >
                  Connect Jobber Account
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Other Integrations (Coming Soon) */}
        <div className="mt-6 bg-white rounded-lg shadow opacity-60">
          <div className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-2xl font-bold text-gray-400">+</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-500">More Integrations Coming Soon</h2>
                <p className="text-sm text-gray-400">ServiceTitan, HouseCall Pro, and more</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    }>
      <IntegrationsContent />
    </Suspense>
  );
}
