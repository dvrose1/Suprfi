import { redirect } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { verifyApplicationToken } from '@/lib/utils/token'
import { ApplicationForm } from '@/components/borrower/ApplicationForm'

interface PageProps {
  params: Promise<{
    token: string
  }>
}

function ErrorState({ 
  icon, 
  title, 
  message, 
  detail 
}: { 
  icon: React.ReactNode; 
  title: string; 
  message: string; 
  detail?: string;
}) {
  return (
    <div className="min-h-screen bg-navy">
      {/* Header */}
      <header className="bg-navy border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
            <img
              src="/logos/wordmark white and mint.svg"
              alt="SuprFi"
              className="h-8 w-auto"
            />
          </Link>
        </div>
      </header>
      
      <div className="flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
            {icon}
          </div>
          <h1 className="text-2xl font-bold text-navy font-display mb-3">{title}</h1>
          <p className="text-medium-gray mb-4">{message}</p>
          {detail && (
            <p className="text-sm text-medium-gray/70">{detail}</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default async function ApplyPage({ params }: PageProps) {
  const { token } = await params
  
  // 1. Verify token
  const decoded = verifyApplicationToken(token)
  
  if (!decoded) {
    return (
      <ErrorState
        icon={<svg className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
        title="Invalid Link"
        message="This financing application link is invalid or has expired."
        detail="Application links expire after 24 hours. Please contact your service provider for a new link."
      />
    )
  }

  // 2. Check if token is expired
  const now = Math.floor(Date.now() / 1000)
  if (decoded.exp < now) {
    return (
      <ErrorState
        icon={<svg className="w-8 h-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        title="Link Expired"
        message="This financing application link has expired."
        detail="Please contact your service provider for a new application link."
      />
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
      <ErrorState
        icon={<svg className="w-8 h-8 text-mint" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>}
        title="Application Submitted"
        message="You've already completed this application. We'll be in touch soon!"
        detail={`Application ID: ${application.id.slice(0, 8)}...`}
      />
    )
  }

  // 5. Render the application form
  return (
    <div className="min-h-screen bg-navy">
      {/* Header */}
      <header className="bg-navy border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <img
                src="/logos/wordmark white and mint.svg"
                alt="SuprFi"
                className="h-8 w-auto"
              />
            </Link>
            <span className="text-white/40 text-sm">Secure Application</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="py-8 px-4">
        {/* Intro */}
        <div className="text-center mb-8 max-w-lg mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-display mb-3">
            Apply for Financing
          </h1>
          <p className="text-white/60">
            Complete your application in just a few minutes. Your information is secure and encrypted.
          </p>
        </div>

        {/* Application Form */}
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
        <div className="text-center mt-8 text-sm text-white/40 max-w-md mx-auto">
          <p>Need help? Contact <a href="mailto:support@suprfi.com" className="text-teal hover:underline">support@suprfi.com</a></p>
          <p className="mt-2 flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            256-bit SSL encryption
          </p>
        </div>
      </div>
    </div>
  )
}
