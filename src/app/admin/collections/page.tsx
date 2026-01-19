// ABOUTME: Admin collections management page
// ABOUTME: Shows delinquent loans queue with actions for collections workflow

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/context';
import { useRouter } from 'next/navigation';
import { formatCurrency } from '@/lib/utils/format';

interface CollectionLoan {
  id: string;
  status: string;
  daysOverdue: number;
  fundedAmount: string;
  defaultedAt: string | null;
  sentToCollections: string | null;
  collectionAgency: string | null;
  application: {
    customer: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    };
  };
  payments: {
    id: string;
    status: string;
    amount: string;
  }[];
  collectionNotes: {
    id: string;
    note: string;
    noteType: string;
    createdAt: string;
  }[];
}

interface CollectionsStats {
  atRisk: number;
  defaulted: number;
  inCollections: number;
  totalOwed: number;
}

export default function AdminCollectionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [loans, setLoans] = useState<CollectionLoan[]>([]);
  const [stats, setStats] = useState<CollectionsStats | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'at_risk' | 'defaulted' | 'in_collections'>('all');
  const [selectedLoan, setSelectedLoan] = useState<CollectionLoan | null>(null);
  const [noteText, setNoteText] = useState('');
  const [noteType, setNoteType] = useState('general');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, filter]);

  const fetchData = async () => {
    setDataLoading(true);
    try {
      const [statsRes, loansRes] = await Promise.all([
        fetch('/api/v1/admin/collections/stats'),
        fetch(`/api/v1/admin/collections?filter=${filter}`),
      ]);

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      if (loansRes.ok) {
        const data = await loansRes.json();
        setLoans(data.loans || []);
      }
    } catch (err) {
      console.error('Failed to fetch collections data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!selectedLoan || !noteText.trim()) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/v1/admin/collections/${selectedLoan.id}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteText, noteType }),
      });

      if (res.ok) {
        setNoteText('');
        fetchData();
        // Refresh selected loan
        const updated = loans.find(l => l.id === selectedLoan.id);
        if (updated) setSelectedLoan(updated);
      }
    } catch (err) {
      alert('Failed to add note');
    } finally {
      setSaving(false);
    }
  };

  const handleSendToCollections = async (loanId: string, agency: string) => {
    if (!confirm(`Send this loan to ${agency}? This action will be logged.`)) return;

    try {
      const res = await fetch(`/api/v1/admin/collections/${loanId}/send-to-agency`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agency }),
      });

      if (res.ok) {
        fetchData();
        setSelectedLoan(null);
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to send to collections');
      }
    } catch (err) {
      alert('Failed to send to collections');
    }
  };

  const getStatusBadge = (loan: CollectionLoan) => {
    if (loan.sentToCollections) {
      return <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">In Collections</span>;
    }
    if (loan.status === 'defaulted') {
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full">Defaulted</span>;
    }
    if (loan.daysOverdue >= 30) {
      return <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">At Risk</span>;
    }
    return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">Overdue</span>;
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Collections</h1>
              <p className="text-gray-600 mt-1">Manage delinquent loans and collections workflow</p>
            </div>
            <Link
              href="/admin"
              className="text-teal-600 hover:text-teal-800 text-sm"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div
            onClick={() => setFilter('at_risk')}
            className={`bg-white rounded-lg p-4 shadow cursor-pointer hover:shadow-md transition-shadow ${filter === 'at_risk' ? 'ring-2 ring-orange-400' : ''}`}
          >
            <p className="text-sm text-gray-500">At Risk (30+ days)</p>
            <p className="text-2xl font-bold text-orange-600">{stats?.atRisk ?? 0}</p>
          </div>
          <div
            onClick={() => setFilter('defaulted')}
            className={`bg-white rounded-lg p-4 shadow cursor-pointer hover:shadow-md transition-shadow ${filter === 'defaulted' ? 'ring-2 ring-red-400' : ''}`}
          >
            <p className="text-sm text-gray-500">Defaulted (60+ days)</p>
            <p className="text-2xl font-bold text-red-600">{stats?.defaulted ?? 0}</p>
          </div>
          <div
            onClick={() => setFilter('in_collections')}
            className={`bg-white rounded-lg p-4 shadow cursor-pointer hover:shadow-md transition-shadow ${filter === 'in_collections' ? 'ring-2 ring-purple-400' : ''}`}
          >
            <p className="text-sm text-gray-500">In Collections</p>
            <p className="text-2xl font-bold text-purple-600">{stats?.inCollections ?? 0}</p>
          </div>
          <div
            onClick={() => setFilter('all')}
            className={`bg-white rounded-lg p-4 shadow cursor-pointer hover:shadow-md transition-shadow ${filter === 'all' ? 'ring-2 ring-gray-400' : ''}`}
          >
            <p className="text-sm text-gray-500">Total Owed</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats?.totalOwed ?? 0)}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Loans List */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">
                {filter === 'all' ? 'All Delinquent Loans' : 
                 filter === 'at_risk' ? 'At Risk Loans' :
                 filter === 'defaulted' ? 'Defaulted Loans' : 'In Collections'}
              </h2>
            </div>
            
            {dataLoading ? (
              <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : loans.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No loans found</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {loans.map((loan) => (
                  <div
                    key={loan.id}
                    onClick={() => setSelectedLoan(loan)}
                    className={`p-4 cursor-pointer hover:bg-gray-50 ${selectedLoan?.id === loan.id ? 'bg-blue-50' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {loan.application.customer.firstName} {loan.application.customer.lastName}
                        </p>
                        <p className="text-sm text-gray-500">{loan.application.customer.email}</p>
                      </div>
                      {getStatusBadge(loan)}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {loan.daysOverdue} days overdue
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(Number(loan.fundedAmount))}
                      </span>
                    </div>
                    {loan.collectionNotes.length > 0 && (
                      <p className="mt-2 text-xs text-gray-500">
                        {loan.collectionNotes.length} note{loan.collectionNotes.length > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="bg-white rounded-lg shadow">
            {selectedLoan ? (
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">
                  {selectedLoan.application.customer.firstName} {selectedLoan.application.customer.lastName}
                </h3>
                
                {/* Contact Info */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Email:</strong> {selectedLoan.application.customer.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Phone:</strong> {selectedLoan.application.customer.phone || 'N/A'}
                  </p>
                </div>

                {/* Loan Info */}
                <div className="mb-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Loan Amount</span>
                    <span className="font-medium">{formatCurrency(Number(selectedLoan.fundedAmount))}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Days Overdue</span>
                    <span className="font-medium text-red-600">{selectedLoan.daysOverdue}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Status</span>
                    <span>{selectedLoan.status}</span>
                  </div>
                  {selectedLoan.collectionAgency && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Agency</span>
                      <span>{selectedLoan.collectionAgency}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!selectedLoan.sentToCollections && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Send to Collections</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSendToCollections(selectedLoan.id, 'Agency A')}
                        className="flex-1 py-2 px-3 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                      >
                        Agency A
                      </button>
                      <button
                        onClick={() => handleSendToCollections(selectedLoan.id, 'Agency B')}
                        className="flex-1 py-2 px-3 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
                      >
                        Agency B
                      </button>
                    </div>
                  </div>
                )}

                {/* Add Note */}
                <div className="mb-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Add Note</p>
                  <select
                    value={noteType}
                    onChange={(e) => setNoteType(e.target.value)}
                    className="w-full mb-2 px-3 py-2 border rounded-lg text-sm"
                  >
                    <option value="general">General Note</option>
                    <option value="contact_attempt">Contact Attempt</option>
                    <option value="payment_plan">Payment Plan</option>
                    <option value="escalation">Escalation</option>
                  </select>
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Enter note..."
                    className="w-full px-3 py-2 border rounded-lg text-sm"
                    rows={3}
                  />
                  <button
                    onClick={handleAddNote}
                    disabled={saving || !noteText.trim()}
                    className="mt-2 w-full py-2 bg-teal-600 text-white text-sm rounded-lg hover:bg-teal-700 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Add Note'}
                  </button>
                </div>

                {/* Notes History */}
                {selectedLoan.collectionNotes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Notes History</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedLoan.collectionNotes.map((note) => (
                        <div key={note.id} className="p-2 bg-gray-50 rounded text-sm">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium text-gray-500 uppercase">
                              {note.noteType.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(note.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{note.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                Select a loan to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
