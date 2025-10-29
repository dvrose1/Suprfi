import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        {/* Auth status in top-right */}
        <div className="absolute top-4 right-4">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Sign In
              </button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>

        <h1 className="text-4xl font-bold text-center mb-4">
          FlowPay
        </h1>
        <p className="text-center text-gray-600">
          Embedded Consumer Financing Platform
        </p>
        
        <div className="mt-8 text-center">
          <SignedOut>
            <p className="text-sm text-gray-500 mb-4">
              Sign in to access the admin dashboard
            </p>
          </SignedOut>
          <SignedIn>
            <p className="text-sm text-green-600 mb-4">
              ✓ Authenticated
            </p>
            <a 
              href="/admin" 
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Go to Dashboard
            </a>
          </SignedIn>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            🚀 Phase 0: Foundation Complete!
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Next.js 15 • TypeScript • Tailwind CSS • Prisma • Clerk
          </p>
          <div className="mt-4 flex gap-2 justify-center text-xs">
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded">✓ Database</span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded">✓ Auth</span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">⏳ Phase 1</span>
          </div>
        </div>
      </div>
    </main>
  );
}
