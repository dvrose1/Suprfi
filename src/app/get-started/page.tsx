'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/marketing/Header'
import Footer from '@/components/marketing/Footer'

const COUNTRY_CODES = [
  { code: '+1', country: 'US', flag: '🇺🇸' },
  { code: '+1', country: 'CA', flag: '🇨🇦' },
  { code: '+44', country: 'UK', flag: '🇬🇧' },
  { code: '+61', country: 'AU', flag: '🇦🇺' },
  { code: '+49', country: 'DE', flag: '🇩🇪' },
  { code: '+33', country: 'FR', flag: '🇫🇷' },
  { code: '+52', country: 'MX', flag: '🇲🇽' },
]

function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`
}

function ComingSoonSignUp() {
  return (
    <div className="min-h-screen bg-warm-white flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal/10 text-teal text-sm font-medium mb-6">
            Direct Sign-Up Coming Soon
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-navy font-display mb-6">
            Get Financing Through Your Service Provider
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            SuprFi financing is currently available through our partner contractors. 
            When your technician offers financing, you'll receive a secure link to apply.
          </p>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 mb-8">
            <h3 className="font-semibold text-navy mb-4">How it works:</h3>
            <ol className="text-left space-y-3 text-gray-600">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal text-white flex items-center justify-center text-sm font-bold">1</span>
                <span>Your service provider offers SuprFi financing for your project</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal text-white flex items-center justify-center text-sm font-bold">2</span>
                <span>You receive a secure text message with your personal application link</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-teal text-white flex items-center justify-center text-sm font-bold">3</span>
                <span>Complete your application in minutes and get instant offers</span>
              </li>
            </ol>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contractors"
              className="px-6 py-3 bg-gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              I'm a Contractor
            </Link>
            <Link 
              href="/homeowners"
              className="px-6 py-3 border-2 border-navy text-navy rounded-lg font-semibold hover:bg-navy hover:text-white transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

function SignUpForm() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+1',
    estimateAmount: 5000,
  })

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setFormData({ ...formData, phone: formatted })
  }
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; link?: string; error?: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch('/api/v1/demo/create-application', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: `${formData.countryCode}${formData.phone.replace(/-/g, '')}`,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResult({ success: true, link: data.link })
      } else {
        setResult({ success: false, error: data.error || 'Failed to create application' })
      }
    } catch (error) {
      setResult({ success: false, error: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  if (result?.success && result.link) {
    window.location.href = result.link
    return (
      <div className="min-h-screen bg-warm-white flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="max-w-xl text-center">
            <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <svg className="w-8 h-8 text-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-gray-600">Redirecting to your application...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-white flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-lg w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-navy font-display mb-3">
              Get Started with Supr<span className="text-teal">Fi</span>
            </h1>
            <p className="text-gray-600">
              Apply in under 60 seconds to check your financing options
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                placeholder="john@example.com"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="flex gap-2">
                <select
                  value={`${formData.countryCode}-${COUNTRY_CODES.find(c => c.code === formData.countryCode)?.country || 'US'}`}
                  onChange={(e) => {
                    const [code] = e.target.value.split('-')
                    setFormData({ ...formData, countryCode: code })
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent bg-white"
                >
                  {COUNTRY_CODES.map((country) => (
                    <option key={`${country.code}-${country.country}`} value={`${country.code}-${country.country}`}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  maxLength={12}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                  placeholder="555-123-4567"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Amount ($)</label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={formData.estimateAmount === 0 ? '' : formData.estimateAmount}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  setFormData({ ...formData, estimateAmount: value === '' ? 0 : parseInt(value) })
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                placeholder="5000"
              />
            </div>

            {result?.error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {result.error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-primary text-white rounded-lg font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Check Your Rate'}
            </button>
          </form>

          <p className="text-center text-sm font-semibold text-gray-700 mt-6">
            Checking your rate won't affect your credit score.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function GetStartedPage() {
  // In production, show "coming soon". In dev/staging, show the form.
  const isProduction = process.env.NEXT_PUBLIC_COMING_SOON === 'true'
  
  if (isProduction) {
    return <ComingSoonSignUp />
  }
  
  return <SignUpForm />
}
