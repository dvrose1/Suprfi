'use client'

import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/marketing/Header'
import Footer from '@/components/marketing/Footer'

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
    estimateAmount: 5000,
  })
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
        body: JSON.stringify(formData),
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
    return (
      <div className="min-h-screen bg-warm-white flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="max-w-xl text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <h1 className="text-3xl font-bold text-navy font-display mb-4">
              Your Application is Ready!
            </h1>
            
            <p className="text-gray-600 mb-8">
              Click below to start your financing application.
            </p>
            
            <a
              href={result.link}
              className="inline-block px-8 py-4 bg-gradient-primary text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity"
            >
              Start Application →
            </a>
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
              Get Started with SuprFi
            </h1>
            <p className="text-gray-600">
              Enter your details to check your financing options
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
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
                placeholder="555-123-4567"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Amount ($)</label>
              <input
                type="number"
                required
                min="500"
                max="50000"
                value={formData.estimateAmount}
                onChange={(e) => setFormData({ ...formData, estimateAmount: parseInt(e.target.value) || 5000 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal focus:border-transparent"
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

          <p className="text-center text-sm text-gray-500 mt-6">
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
