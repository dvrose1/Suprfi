// ABOUTME: SuprClient quick send page
// ABOUTME: Mobile-first page for technicians to send financing links via SMS, Email, or QR code

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useContractorAuth } from '@/lib/auth/contractor-context';

type SendMethod = 'qr' | 'sms' | 'email';

export default function QuickSendPage() {
  const { user, loading } = useContractorAuth();
  const [method, setMethod] = useState<SendMethod>('qr');
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  // Generate QR code when relevant fields change
  useEffect(() => {
    if (method === 'qr' && amount && Number(amount) >= 500) {
      generateQRCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, amount, serviceType]);

  const generateQRCode = async () => {
    try {
      const res = await fetch('/api/v1/client/generate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Number(amount),
          serviceType: serviceType || undefined,
          customerName: customerName || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setQrCode(data.qrCodeDataUrl);
      }
    } catch (err) {
      console.error('Failed to generate QR code:', err);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSending(true);

    try {
      const payload: Record<string, unknown> = {
        method: method === 'sms' ? 'sms' : 'email',
        customerName,
        amount: Number(amount),
        serviceType: serviceType || undefined,
      };

      if (method === 'sms') {
        payload.phone = phone;
      } else {
        payload.email = email;
      }

      const res = await fetch('/api/v1/client/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to send');
        return;
      }

      setSent(true);
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const resetForm = () => {
    setCustomerName('');
    setPhone('');
    setEmail('');
    setAmount('');
    setServiceType('');
    setQrCode(null);
    setSent(false);
    setError('');
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-teal border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-warm-white flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-20 h-20 bg-mint/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold font-display text-navy mb-2">Link Sent!</h1>
          <p className="text-gray-600 mb-6">
            {method === 'sms' 
              ? `Financing link sent to ${phone}`
              : `Financing link sent to ${email}`
            }
          </p>
          <div className="space-y-3">
            <button
              onClick={resetForm}
              className="w-full bg-teal text-white rounded-lg font-semibold px-6 py-4 hover:bg-teal/90 transition-colors"
            >
              Send Another
            </button>
            <Link
              href="/client"
              className="block w-full text-center text-gray-600 hover:text-gray-900 py-2"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <Link href="/client" className="text-gray-600 hover:text-gray-900">
              ← Back
            </Link>
            <span className="font-semibold text-navy">Send Financing Link</span>
            <div className="w-12"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Method Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6">
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'qr' as const, label: 'QR Code', icon: '📱' },
              { id: 'sms' as const, label: 'SMS', icon: '💬' },
              { id: 'email' as const, label: 'Email', icon: '📧' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setMethod(tab.id)}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl transition-colors ${
                  method === tab.id
                    ? 'bg-teal text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-xl text-error text-sm">
            {error}
          </div>
        )}

        {/* QR Code Mode */}
        {method === 'qr' && (
          <div className="space-y-6">
            {/* QR Code Display */}
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
              {qrCode ? (
                <>
                  <div className="bg-white p-4 rounded-xl inline-block mb-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={qrCode} alt="QR Code" className="w-48 h-48" />
                  </div>
                  <p className="text-gray-600 text-sm">
                    Customer scans to start application
                  </p>
                </>
              ) : (
                <div className="py-8">
                  <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-gray-400 text-sm">Enter amount to generate QR</span>
                  </div>
                </div>
              )}
            </div>

            {/* Amount Input */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Amount *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">$</span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="4,500"
                  min="500"
                  max="25000"
                  className="w-full pl-8 pr-4 py-4 text-2xl font-bold border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal focus:border-transparent"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">Min $500, Max $25,000</p>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type (Optional)
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal focus:border-transparent"
                >
                  <option value="">Select service type</option>
                  <option value="hvac">HVAC</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="pest">Pest Control</option>
                  <option value="roofing">Roofing</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* SMS / Email Mode */}
        {(method === 'sms' || method === 'email') && (
          <form onSubmit={handleSend} className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  placeholder="John Smith"
                  className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal focus:border-transparent"
                />
              </div>

              {method === 'sms' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal focus:border-transparent"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="customer@email.com"
                    className="w-full px-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Amount *
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    placeholder="4,500"
                    min="500"
                    max="25000"
                    className="w-full pl-8 pr-4 py-4 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type (Optional)
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-teal focus:border-transparent"
                >
                  <option value="">Select service type</option>
                  <option value="hvac">HVAC</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="pest">Pest Control</option>
                  <option value="roofing">Roofing</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="w-full bg-teal text-white rounded-xl font-semibold px-6 py-4 text-lg hover:bg-teal/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {sending ? 'Sending...' : method === 'sms' ? '📱 Send via SMS' : '📧 Send via Email'}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
