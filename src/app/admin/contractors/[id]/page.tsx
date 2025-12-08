// ABOUTME: Contractor detail page
// ABOUTME: View and manage individual contractor details

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Contractor {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  businessName: string | null;
  serviceType: string | null;
  state: string | null;
  status: string;
  source: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ContractorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [contractor, setContractor] = useState<Contractor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchContractor = async () => {
      try {
        // Fetch contractor by ID from contractors API
        const res = await fetch(`/api/v1/admin/contractors/${params.id}`);
        
        if (!res.ok) {
          setError('Contractor not found');
          return;
        }
        
        const data = await res.json();
        if (data.contractor) {
          setContractor(data.contractor);
        } else {
          setError('Contractor not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load contractor');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchContractor();
    }
  }, [params.id]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!contractor) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/v1/admin/contractors/${contractor.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        setContractor(data.contractor);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'approved':
        return 'bg-blue-100 text-blue-700';
      case 'suspended':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !contractor) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-4">
            {error || 'Contractor not found'}
          </div>
          <Link href="/admin/contractors" className="text-blue-600 hover:underline">
            ← Back to Contractors
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <Link
                href="/admin/contractors"
                className="text-blue-600 hover:text-blue-800 text-sm mb-2 inline-block"
              >
                ← Back to Contractors
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {contractor.businessName || contractor.name || 'Contractor'}
              </h1>
              <p className="text-gray-600 mt-1">{contractor.email}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(contractor.status)}`}>
                {contractor.status.charAt(0).toUpperCase() + contractor.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Contact Name</div>
                    <div className="font-medium">{contractor.name || 'Not provided'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Business Name</div>
                    <div className="font-medium">{contractor.businessName || 'Not provided'}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Email</div>
                    <div className="font-medium">
                      <a href={`mailto:${contractor.email}`} className="text-blue-600 hover:underline">
                        {contractor.email}
                      </a>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Phone</div>
                    <div className="font-medium">
                      {contractor.phone ? (
                        <a href={`tel:${contractor.phone}`} className="text-blue-600 hover:underline">
                          {contractor.phone}
                        </a>
                      ) : (
                        'Not provided'
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Details */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Details</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Service Type</div>
                    <div className="font-medium capitalize">{contractor.serviceType || 'Not specified'}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">State</div>
                    <div className="font-medium">{contractor.state || 'Not specified'}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Source</div>
                  <div className="font-medium">{contractor.source || 'Direct signup'}</div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  <div>
                    <div className="font-medium">Signed up for waitlist</div>
                    <div className="text-sm text-gray-500">{formatDate(contractor.createdAt)}</div>
                  </div>
                </div>
                {contractor.status !== 'active' && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium">Approved</div>
                      <div className="text-sm text-gray-500">{formatDate(contractor.updatedAt)}</div>
                    </div>
                  </div>
                )}
                {contractor.status === 'active' && (
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <div className="font-medium">Activated</div>
                      <div className="text-sm text-gray-500">{formatDate(contractor.updatedAt)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <a
                  href={`mailto:${contractor.email}`}
                  className="block w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 text-center"
                >
                  Send Email
                </a>
                {contractor.phone && (
                  <a
                    href={`tel:${contractor.phone}`}
                    className="block w-full px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 text-center"
                  >
                    Call
                  </a>
                )}
              </div>
            </div>

            {/* Status Management */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status Management</h2>
              <div className="space-y-3">
                {contractor.status !== 'active' && (
                  <button
                    onClick={() => handleStatusUpdate('active')}
                    disabled={updating}
                    className="block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-center"
                  >
                    {updating ? 'Updating...' : 'Mark as Active'}
                  </button>
                )}
                {contractor.status !== 'suspended' && (
                  <button
                    onClick={() => handleStatusUpdate('suspended')}
                    disabled={updating}
                    className="block w-full px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 disabled:opacity-50 text-center"
                  >
                    {updating ? 'Updating...' : 'Suspend'}
                  </button>
                )}
                {contractor.status === 'suspended' && (
                  <button
                    onClick={() => handleStatusUpdate('approved')}
                    disabled={updating}
                    className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-center"
                  >
                    {updating ? 'Updating...' : 'Reactivate'}
                  </button>
                )}
              </div>
            </div>

            {/* ID Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">System Info</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">ID:</span>{' '}
                  <code className="bg-gray-100 px-1 rounded text-xs">{contractor.id}</code>
                </div>
                <div>
                  <span className="text-gray-500">Created:</span>{' '}
                  {new Date(contractor.createdAt).toLocaleDateString()}
                </div>
                <div>
                  <span className="text-gray-500">Updated:</span>{' '}
                  {new Date(contractor.updatedAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
