import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | SuprFi',
  description: 'SuprFi Privacy Policy - How we collect, use, and protect your personal information',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-navy">
      {/* Simple Header */}
      <header className="fixed top-0 w-full z-50 bg-navy">
        <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <img
                src="/logos/wordmark white and mint.svg"
                alt="SuprFi"
                className="h-8 w-auto"
              />
            </Link>
            <a
              href="/#early-access"
              className="px-4 sm:px-5 py-2.5 rounded-lg bg-teal text-white text-sm font-semibold transition-all hover:bg-teal/90"
            >
              Get Early Access
            </a>
          </div>
        </nav>
      </header>

      {/* Content */}
      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          <div className="prose prose-invert max-w-none">
            <p className="text-white/60 mb-6">Last updated: March 26, 2026</p>
            
            <p className="text-white/80 mb-6">
              SuprFi (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our services.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">What We Collect</h2>
            <p className="text-white/80 mb-4">
              We collect personal information that you or your home services contractor provide to us in connection with a financing request, including:
            </p>
            <ul className="list-disc list-inside text-white/80 mb-6 space-y-1">
              <li>Name, phone number, email address, and home address</li>
              <li>Job details (service type and quoted amount)</li>
              <li>Financial information you provide as part of a loan application (such as income, employment, and credit information)</li>
            </ul>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">How We Use Your Information</h2>
            <p className="text-white/80 mb-4">We use your personal information to:</p>
            <ul className="list-disc list-inside text-white/80 mb-6 space-y-1">
              <li>Process and evaluate loan applications</li>
              <li>Communicate with you about your financing options via SMS and email</li>
              <li>Provide customer support</li>
              <li>Comply with legal and regulatory requirements</li>
              <li>Improve our services</li>
            </ul>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">SMS Communications</h2>
            <p className="text-white/80 mb-4">
              When a home services contractor submits a financing request on your behalf, or when you provide your phone number through our website, you may receive SMS messages from SuprFi related to your financing options. These messages may include:
            </p>
            <ul className="list-disc list-inside text-white/80 mb-4 space-y-1">
              <li>Monthly payment options</li>
              <li>Application links</li>
              <li>Status updates</li>
              <li>Follow-up reminders</li>
            </ul>
            <p className="text-white/80 mb-6">
              Message and data rates may apply. You can opt out of SMS communications at any time by replying STOP to any message.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">How We Protect Your Information</h2>
            <p className="text-white/80 mb-4">
              We use industry-standard security measures to protect your personal information, including:
            </p>
            <ul className="list-disc list-inside text-white/80 mb-6 space-y-1">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure storage of financial information</li>
              <li>Access controls limiting who can view your data</li>
            </ul>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Information Sharing</h2>
            <p className="text-white/80 mb-4">
              We do not sell your personal information. We do not share your information for marketing purposes. We may share your information with:
            </p>
            <ul className="list-disc list-inside text-white/80 mb-6 space-y-1">
              <li>Service providers who help us operate our business (such as our SMS provider)</li>
              <li>As required by law or regulation</li>
              <li>As necessary to process your loan application</li>
            </ul>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Your Rights</h2>
            <p className="text-white/80 mb-6">
              You may request access to, correction of, or deletion of your personal information by contacting us at{' '}
              <a href="mailto:support@suprfi.com" className="text-teal hover:underline">support@suprfi.com</a>.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Contact Us</h2>
            <p className="text-white/80">
              If you have questions about this Privacy Policy, contact us at:
            </p>
            <p className="text-white/80 mt-2">
              <strong className="text-white">SuprFi</strong><br />
              Email: <a href="mailto:support@suprfi.com" className="text-teal hover:underline">support@suprfi.com</a>
            </p>
          </div>
        </div>
      </main>

      {/* Simple Footer */}
      <footer className="py-12 bg-dark-gray">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
            <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
              <img
                src="/logos/wordmark white and mint.svg"
                alt="SuprFi"
                className="h-6 w-auto"
              />
            </Link>
            <a 
              href="mailto:support@suprfi.com"
              className="text-white/60 hover:text-white transition-colors underline-offset-4 hover:underline"
            >
              support@suprfi.com
            </a>
          </div>
          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <Link href="/privacy" className="text-white/60 hover:text-white text-sm transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="text-white/60 hover:text-white text-sm transition-colors">SMS Terms</Link>
            </div>
            <p className="text-white/40 text-sm mb-4">
              © {new Date().getFullYear()} SuprFi. All rights reserved.
            </p>
            <p className="text-white/30 text-xs leading-relaxed max-w-4xl">
              Home Services Financing Solutions, Inc. DBA SuprFi. Loans subject to credit approval. Terms, rates, and 
              availability vary by state and are not guaranteed. This website is for informational 
              purposes only and does not constitute an offer or solicitation to lend.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
