'use client'

import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import { useState } from 'react'

export default function Home() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTryDemo = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/test-crm')
      const data = await response.json()

      if (data.api_response?.success && data.api_response?.application_url) {
        // Redirect to the application URL
        window.location.href = data.api_response.application_url
      } else {
        setError('Failed to create demo application. Please try again.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 md:p-24 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="z-10 max-w-4xl w-full">
        {/* Auth status in top-right */}
        <div className="absolute top-4 right-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
                Admin Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <div className="flex items-center gap-3">
              <a 
                href="/admin" 
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition text-sm"
              >
                Admin Dashboard
              </a>
              <UserButton afterSignOutUrl="/" />
            </div>
          </SignedIn>
        </div>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            FlowPay
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-2">
            Fast, Simple Financing for Home Services
          </p>
          <p className="text-sm text-gray-500">
            Get approved in minutes. No impact to your credit score to check your rate.
          </p>
        </div>

        {/* Key Benefits */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="font-semibold text-gray-900 mb-2">Quick Decision</h3>
            <p className="text-sm text-gray-600">Get approved in as little as 5 minutes</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="font-semibold text-gray-900 mb-2">Flexible Terms</h3>
            <p className="text-sm text-gray-600">Choose terms that fit your budget</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <div className="text-3xl mb-3">🔒</div>
            <h3 className="font-semibold text-gray-900 mb-2">Secure & Safe</h3>
            <p className="text-sm text-gray-600">Bank-level encryption protects your data</p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-white p-8 md:p-12 rounded-2xl shadow-lg text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Try Our Demo Application
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Experience the complete financing application flow. See how easy it is for your customers to apply and get approved.
          </p>
          
          <button
            onClick={handleTryDemo}
            disabled={isLoading}
            className="px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Demo...' : 'Try Demo Application →'}
          </button>

          {error && (
            <p className="mt-4 text-red-600 text-sm">{error}</p>
          )}

          <p className="mt-6 text-xs text-gray-500">
            This will create a test financing application for a sample HVAC installation
          </p>
        </div>

        {/* How it Works */}
        <div className="mt-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold mx-auto mb-2">1</div>
              <p className="text-gray-600">Complete application</p>
            </div>
            <div>
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold mx-auto mb-2">2</div>
              <p className="text-gray-600">Link your bank</p>
            </div>
            <div>
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold mx-auto mb-2">3</div>
              <p className="text-gray-600">Verify identity</p>
            </div>
            <div>
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold mx-auto mb-2">4</div>
              <p className="text-gray-600">Get offers instantly</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-xs text-gray-500">
          <p>Built with Next.js • TypeScript • Prisma • Clerk</p>
          <div className="mt-2 flex gap-2 justify-center">
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded">✓ Production Ready</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded">✓ Full MVP</span>
          </div>
        </div>
      </div>
    </main>
  );
}
