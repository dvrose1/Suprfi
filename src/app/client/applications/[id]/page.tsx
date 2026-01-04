// ABOUTME: SuprClient application detail page
// ABOUTME: Shows full application details with timeline and actions

'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useContractorAuth } from '@/lib/auth/contractor-context';
import { formatServiceType } from '@/lib/utils/format';

interface ApplicationDetail {
  id: string;
  status: string;
  token: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    maskedEmail: string;
    maskedPhone: string;
  };
  job: {
    amount: number;
    serviceType: string | null;
  };
  decision: {
    status: string;
    score: number | null;
  } | null;
  offers: Array<{
    id: string;
    termMonths: number;
    apr: number;
    monthlyPayment: number;
    selected: boolean;
  }>;
  loan: {
    id: string;
    fundedAmount: number;
    fundingDate: string;
    status: string;
  } | null;
  technician: {
    name: string;
  } | null;
  timeline: Array<{
    event: string;
    timestamp: string;
    actor?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

const STATUS_STEPS = ['initiated', 'submitted', 'approved', 'funded'];

export default function ApplicationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading, canAccess } = useContractorAuth();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showPII, setShowPII] = useState(false);

  useEffect(() => {
    if (user && params.id) {
      fetchApplication();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, params.id]);

  const fetchApplication = async () => {
    try {
      const res = await fetch(`/api/v1/client/applications/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setApplication(data.application);
      } else if (res.status === 404) {
        setError('Application not found');
      } else {
        setError('Failed to load application');
      }
    } catch (err) {
      console.error('Failed to fetch application:', err);
      setError('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!application) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/client/applications/${application.id}/resend`, {
        method: 'POST',
      });
      if (res.ok) {
        alert('Application link resent successfully!');
      } else {
        alert('Failed to resend link');
      }
    } catch {
      alert('Failed to resend link');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!application) return;
    if (!confirm('Are you sure you want to cancel this application?')) return;
    
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/client/applications/${application.id}/cancel`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchApplication();
      } else {
        alert('Failed to cancel application');
      }
    } catch {
      alert('Failed to cancel application');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'funded':
        return 'bg-mint text-white';
      case 'approved':
        return 'bg-teal text-white';
      case 'submitted':
        return 'bg-cyan text-white';
      case 'declined':
        return 'bg-error text-white';
      case 'cancelled':
        return 'bg-gray-500 text-white';
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const getCurrentStep = () => {
    if (!application) return 0;
    if (application.status === 'declined' || application.status === 'cancelled') return -1;
    return STATUS_STEPS.indexOf(application.status);
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-teal border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-xl font-semibold text-navy mb-2">{error || 'Application not found'}</h2>
          <Link href="/client/applications" className="text-teal hover:underline">
            ← Back to Applications
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = getCurrentStep();

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="text-gray-600 hover:text-navy">
                ← Back
              </button>
              <span className="text-gray-300">|</span>
              <span className="font-medium text-navy">Application Details</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusStyle(application.status)}`}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Stepper */}
        {currentStep >= 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <div className="flex items-center">
              {STATUS_STEPS.map((step, index) => (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        index <= currentStep
                          ? 'bg-teal text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {index < currentStep ? '✓' : index + 1}
                    </div>
                    <span className={`text-sm mt-2 capitalize ${
                      index <= currentStep ? 'text-navy font-medium' : 'text-gray-400'
                    }`}>
                      {step}
                    </span>
                  </div>
                  {index < STATUS_STEPS.length - 1 && (
                    <div className={`h-1 flex-1 mx-4 rounded ${
                      index < currentStep ? 'bg-teal' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-navy">Customer Information</h2>
                <button
                  onClick={() => setShowPII(!showPII)}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-navy bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {showPII ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                      Hide Details
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Reveal Details
                    </>
                  )}
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Name</div>
                  <div className="font-medium text-navy">{application.customer.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium text-navy">
                    {showPII ? application.customer.email : application.customer.maskedEmail}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Phone</div>
                  <div className="font-medium text-navy">
                    {showPII ? application.customer.phone : application.customer.maskedPhone}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Application ID</div>
                  <div className="font-mono text-sm text-gray-600">
                    {showPII ? application.id : `${application.id.slice(0, 12)}...`}
                  </div>
                </div>
              </div>
            </div>

            {/* Job Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-navy mb-4">Financing Request</h2>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-3xl font-bold text-navy">
                    ${application.job.amount.toLocaleString()}
                  </div>
                  {application.job.serviceType && (
                    <div className="text-gray-500">{formatServiceType(application.job.serviceType)}</div>
                  )}
                </div>
                {application.offers.length > 0 && (
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Selected Offer</div>
                    {application.offers.filter(o => o.selected).map(offer => (
                      <div key={offer.id} className="font-medium text-navy">
                        ${offer.monthlyPayment}/mo × {offer.termMonths} months
                        <div className="text-sm text-gray-500">{offer.apr}% APR</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Loan Details (if funded) */}
            {application.loan && (
              <div className="bg-mint/10 rounded-2xl p-6 border border-mint/20">
                <h2 className="text-lg font-semibold text-navy mb-4 flex items-center gap-2">
                  <span className="text-mint">💰</span> Loan Funded
                </h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Funded Amount</div>
                    <div className="text-xl font-bold text-navy">
                      ${application.loan.fundedAmount.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Funding Date</div>
                    <div className="font-medium text-navy">
                      {new Date(application.loan.fundingDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Status</div>
                    <div className="font-medium text-mint capitalize">{application.loan.status}</div>
                  </div>
                </div>
              </div>
            )}

            {/* CRM Information */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-navy mb-4">CRM Information</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Job ID</div>
                  <div className="font-medium text-navy font-mono text-sm">—</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Job Status</div>
                  <div className="font-medium text-navy">—</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Sold By</div>
                  <div className="font-medium text-navy">{application.technician?.name || '—'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Scheduled Service Date</div>
                  <div className="font-medium text-navy">—</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Service Completed Date</div>
                  <div className="font-medium text-navy">—</div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-navy mb-4">Activity Timeline</h2>
              <div className="space-y-4">
                {application.timeline.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-teal"></div>
                      {index < application.timeline.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 mt-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="font-medium text-navy">{event.event}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                        {event.actor && ` • ${event.actor}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-navy mb-4">Actions</h2>
              <div className="space-y-3">
                {application.status === 'initiated' && canAccess('application:resend') && (
                  <button
                    onClick={handleResend}
                    disabled={actionLoading}
                    className="w-full bg-teal text-white rounded-lg font-semibold px-4 py-3 hover:bg-teal/90 transition-colors disabled:opacity-50"
                  >
                    📱 Resend Application Link
                  </button>
                )}
                {['initiated', 'submitted'].includes(application.status) && canAccess('application:cancel') && (
                  <button
                    onClick={handleCancel}
                    disabled={actionLoading}
                    className="w-full border border-error text-error rounded-lg font-semibold px-4 py-3 hover:bg-error/5 transition-colors disabled:opacity-50"
                  >
                    Cancel Application
                  </button>
                )}
                {application.loan && (
                  <Link
                    href={`/client/loans/${application.loan.id}`}
                    className="block w-full bg-navy text-white rounded-lg font-semibold px-4 py-3 hover:bg-navy/90 transition-colors text-center"
                  >
                    View Loan Details
                  </Link>
                )}
              </div>
            </div>

            {/* Quick Info */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-navy mb-4">Quick Info</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created</span>
                  <span className="text-navy">{new Date(application.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Last Updated</span>
                  <span className="text-navy">{new Date(application.updatedAt).toLocaleDateString()}</span>
                </div>
                {application.decision && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Decision</span>
                    <span className={`font-medium ${
                      application.decision.status === 'approved' ? 'text-teal' : 'text-error'
                    }`}>
                      {application.decision.status}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
