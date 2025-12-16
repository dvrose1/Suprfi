// ABOUTME: SuprClient analytics dashboard
// ABOUTME: Shows charts, trends, and performance benchmarks

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useContractorAuth } from '@/lib/auth/contractor-context';
import ClientHeader from '@/components/client/ClientHeader';

interface AnalyticsData {
  overview: {
    totalApplications: number;
    approvalRate: number;
    avgLoanAmount: number;
    avgTimeToFund: number;
  };
  trends: {
    approvalRateByMonth: Array<{ month: string; rate: number }>;
    fundingByMonth: Array<{ month: string; amount: number }>;
    applicationsByMonth: Array<{ month: string; count: number }>;
    soldByMonth: Array<{ month: string; amount: number; count: number }>;
  };
  breakdown: {
    byStatus: Record<string, number>;
    byServiceType: Record<string, number>;
    bySendMethod: Record<string, number>;
  };
  benchmarks: {
    yourApprovalRate: number;
    networkAvgApprovalRate: number;
    yourAvgTimeToFund: number;
    networkAvgTimeToFund: number;
  };
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

export default function AnalyticsPage() {
  const { user, loading: authLoading } = useContractorAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, dateRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/client/analytics?days=${dateRange}`);
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = async (reportType: string) => {
    try {
      const res = await fetch(`/api/v1/client/reports/${reportType}?days=${dateRange}`);
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (err) {
      console.error('Failed to download report:', err);
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
        {/* Page Title with Export button */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold font-display text-navy">Analytics</h1>
            <p className="text-gray-600 mt-1">Track your performance and discover insights</p>
            <div className="mt-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent bg-white"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
            </div>
          </div>
          {/* Export button - hidden on mobile */}
          <div className="hidden sm:block relative group">
            <button className="px-4 py-2 bg-navy text-white rounded-lg hover:bg-navy/90 transition-colors flex items-center gap-2">
              📥 Export
            </button>
            <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-20">
              <button
                onClick={() => downloadReport('applications')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-t-lg"
              >
                Applications Report
              </button>
              <button
                onClick={() => downloadReport('loans')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
              >
                Loans Report
              </button>
              <button
                onClick={() => downloadReport('summary')}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 rounded-b-lg"
              >
                Summary Report
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-teal border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        ) : data ? (
          <>
            {/* Overview Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-sm text-gray-600 mb-1">Total Applications</div>
                <div className="text-3xl font-bold text-navy">{data.overview.totalApplications}</div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-sm text-gray-600 mb-1">Approval Rate</div>
                <div className="text-3xl font-bold text-teal">{data.overview.approvalRate}%</div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-sm text-gray-600 mb-1">Avg Loan Amount</div>
                <div className="text-3xl font-bold text-navy">${data.overview.avgLoanAmount.toLocaleString()}</div>
              </div>
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="text-sm text-gray-600 mb-1">Avg Time to Fund</div>
                <div className="text-3xl font-bold text-navy">{data.overview.avgTimeToFund} days</div>
              </div>
            </div>

            {/* Benchmarks */}
            <div className="bg-gradient-to-r from-navy to-teal rounded-2xl p-6 mb-8 text-white">
              <h2 className="text-xl font-semibold mb-4 text-white">How You Compare</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <div className="text-white/80 text-sm mb-2">Approval Rate</div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div>
                      <div className="text-4xl font-bold">{data.benchmarks.yourApprovalRate}%</div>
                      <div className="text-sm text-white/60">Your rate</div>
                    </div>
                    <div className="text-white/60">
                      <div className="text-2xl">{data.benchmarks.networkAvgApprovalRate}%</div>
                      <div className="text-sm">Network avg</div>
                    </div>
                    {data.benchmarks.yourApprovalRate > data.benchmarks.networkAvgApprovalRate && (
                      <span className="px-2 py-1 bg-mint/20 text-mint rounded-full text-sm flex items-center justify-center whitespace-nowrap">
                        +{(data.benchmarks.yourApprovalRate - data.benchmarks.networkAvgApprovalRate).toFixed(1)}%
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-white/80 text-sm mb-2">Time to Fund</div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div>
                      <div className="text-4xl font-bold">{data.benchmarks.yourAvgTimeToFund}</div>
                      <div className="text-sm text-white/60">Your avg (days)</div>
                    </div>
                    <div className="text-white/60">
                      <div className="text-2xl">{data.benchmarks.networkAvgTimeToFund}</div>
                      <div className="text-sm">Network avg</div>
                    </div>
                    {data.benchmarks.yourAvgTimeToFund < data.benchmarks.networkAvgTimeToFund && (
                      <span className="px-2 py-1 bg-mint/20 text-mint rounded-full text-sm flex items-center justify-center whitespace-nowrap">
                        {Math.round((1 - data.benchmarks.yourAvgTimeToFund / data.benchmarks.networkAvgTimeToFund) * 100)}% faster
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-8">
              {/* Sold by Month */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-navy mb-4">Sold by Month</h2>
                <div className="h-48 flex items-end justify-between gap-2">
                  {data.trends.soldByMonth.map((item, index) => {
                    const maxAmount = Math.max(...data.trends.soldByMonth.map(i => i.amount));
                    const height = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="text-xs text-navy font-medium mb-1">
                          ${(item.amount / 1000).toFixed(0)}k
                        </div>
                        <div
                          className="w-full bg-teal rounded-t transition-all hover:bg-teal/80"
                          style={{ height: `${height}%`, minHeight: item.amount > 0 ? '8px' : '0' }}
                        />
                        <div className="text-xs text-gray-500 mt-2">{item.month}</div>
                        <div className="text-xs text-gray-400">{item.count} deals</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Funding by Month */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-navy mb-4">Funded by Month</h2>
                <div className="h-48 flex items-end justify-between gap-2">
                  {data.trends.fundingByMonth.map((item, index) => {
                    const maxAmount = Math.max(...data.trends.fundingByMonth.map(i => i.amount));
                    const height = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="text-xs text-navy font-medium mb-1">
                          ${(item.amount / 1000).toFixed(0)}k
                        </div>
                        <div
                          className="w-full bg-mint rounded-t transition-all hover:bg-mint/80"
                          style={{ height: `${height}%`, minHeight: item.amount > 0 ? '8px' : '0' }}
                        />
                        <div className="text-xs text-gray-500 mt-2">{item.month}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Approval Rate Trend */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-navy mb-4">Approval Rate</h2>
                <div className="h-48 flex items-end justify-between gap-2">
                  {data.trends.approvalRateByMonth.map((item, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center">
                      <div className="text-xs text-navy font-medium mb-1">{item.rate}%</div>
                      <div
                        className="w-full bg-cyan rounded-t transition-all hover:bg-cyan/80"
                        style={{ height: `${item.rate}%` }}
                      />
                      <div className="text-xs text-gray-500 mt-2">{item.month}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8 mb-8">
              {/* By Status */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-navy mb-4">By Status</h2>
                <div className="space-y-3">
                  {Object.entries(data.breakdown.byStatus).map(([status, count]) => (
                    <div key={status} className="flex items-center justify-between">
                      <span className="text-gray-600 capitalize">{status}</span>
                      <span className="font-semibold text-navy">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Service Type */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-navy mb-4">By Service Type</h2>
                <div className="space-y-3">
                  {Object.entries(data.breakdown.byServiceType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-gray-600 capitalize">{type || 'Other'}</span>
                      <span className="font-semibold text-navy">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* By Send Method */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-semibold text-navy mb-4">By Send Method</h2>
                <div className="space-y-3">
                  {Object.entries(data.breakdown.bySendMethod).map(([method, count]) => (
                    <div key={method} className="flex items-center justify-between">
                      <span className="text-gray-600 uppercase">{method || 'Direct'}</span>
                      <span className="font-semibold text-navy">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-navy mb-4">💡 Smart Recommendations</h2>
              <div className="space-y-4">
                {data.recommendations.map((rec) => (
                  <div
                    key={rec.id}
                    className={`p-4 rounded-xl border-l-4 ${
                      rec.impact === 'high'
                        ? 'bg-teal/5 border-teal'
                        : rec.impact === 'medium'
                        ? 'bg-cyan/5 border-cyan'
                        : 'bg-gray-50 border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-navy">{rec.title}</div>
                    <div className="text-sm text-gray-600 mt-1">{rec.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-navy mb-2">No data yet</h3>
            <p className="text-gray-600">Analytics will appear once you have applications.</p>
          </div>
        )}
      </main>
    </div>
  );
}
