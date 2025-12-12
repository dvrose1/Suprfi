import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { verifyApplicationToken } from '@/lib/utils/token'
import { ApplicationForm } from '@/components/borrower/ApplicationForm'

interface PageProps {
  params: Promise<{
    token: string
  }>
}

export default async function ApplyPage({ params }: PageProps) {
  const { token } = await params
  
  // 1. Verify token
  const decoded = verifyApplicationToken(token)
  
  if (!decoded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid or Expired Link</h1>
          <p className="text-gray-600 mb-6">
            This financing application link is invalid or has expired.
          </p>
          <p className="text-sm text-gray-500">
            Application links expire after 24 hours. Please contact your service provider for a new link.
          </p>
        </div>
      </div>
    )
  }

  // 2. Check if token is expired
  const now = Math.floor(Date.now() / 1000)
  if (decoded.exp < now) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-yellow-600 text-5xl mb-4">⏰</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h1>
          <p className="text-gray-600 mb-6">
            This financing application link has expired.
          </p>
          <p className="text-sm text-gray-500">
            Please contact your service provider for a new application link.
          </p>
        </div>
      </div>
    )
  }

  // 3. Fetch application data from database
  const application = await prisma.application.findUnique({
    where: { id: decoded.applicationId },
    include: {
      customer: true,
      job: true,
    },
  })

  if (!application) {
    redirect('/404')
  }

  // 4. Check if application is already completed
  if (application.status === 'submitted' || application.status === 'approved') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-green-600 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Application Already Submitted</h1>
          <p className="text-gray-600 mb-6">
            You've already completed this application. We'll be in touch soon!
          </p>
          <p className="text-sm text-gray-500">
            Application ID: {application.id}
          </p>
        </div>
      </div>
    )
  }

  // 5. Render the application form
  return (
    <div className="min-h-screen bg-warm-white py-12 px-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-navy font-display mb-2">Supr<span className="text-teal">Fi</span></h1>
        <p className="text-gray-600">Apply for financing in minutes</p>
      </div>

      {/* Dynamic Import for Client Component */}
      <ApplicationForm
        customer={application.customer}
        job={{
          id: application.job.id,
          estimateAmount: Number(application.job.estimateAmount),
          serviceType: application.job.serviceType,
        }}
        applicationId={application.id}
        token={token}
      />

      {/* Support Footer */}
      <div className="text-center mt-8 text-sm text-gray-600">
        <p>Need help? Contact support@suprfi.com</p>
        <p className="mt-2">Application expires in 24 hours</p>
      </div>
    </div>
  )
}
