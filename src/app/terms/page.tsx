import Link from 'next/link';

export const metadata = {
  title: 'SMS Terms and Conditions | SuprFi',
  description: 'SuprFi SMS Terms and Conditions for financing notifications',
};

export default function TermsPage() {
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
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">SMS Terms and Conditions</h1>
          <div className="prose prose-invert max-w-none">
            <p className="text-white/60 mb-6">Last updated: March 26, 2026</p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Program Name</h2>
            <p className="text-white/80 mb-6">SuprFi Financing Notifications</p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Program Description</h2>
            <p className="text-white/80 mb-6">
              SuprFi sends SMS messages to homeowners with personalized consumer loan payment options for home services jobs. Messages include financing offers, monthly payment options, application links, application status updates, and follow-up reminders.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Message Frequency</h2>
            <p className="text-white/80 mb-6">
              You may receive up to 10 messages per month related to your financing request. Message frequency varies based on your application status and engagement.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Message and Data Rates</h2>
            <p className="text-white/80 mb-6">
              Message and data rates may apply. Check with your wireless carrier for details about your text messaging plan.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Opt-In</h2>
            <p className="text-white/80 mb-6">
              By providing your phone number to SuprFi — either directly through our website or through your home services contractor — you consent to receive SMS messages from SuprFi regarding your financing options.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Opt-Out</h2>
            <p className="text-white/80 mb-6">
              You can opt out of receiving SMS messages at any time by replying STOP to any message from SuprFi. After opting out, you will receive a single confirmation message and no further SMS communications will be sent.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Help</h2>
            <p className="text-white/80 mb-6">
              For help or support, reply HELP to any message from SuprFi, or contact us at{' '}
              <a href="mailto:support@suprfi.com" className="text-teal hover:underline">support@suprfi.com</a>.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Support Contact</h2>
            <p className="text-white/80 mb-2">For questions about the SuprFi SMS program, contact us at:</p>
            <ul className="list-disc list-inside text-white/80 mb-6 space-y-1">
              <li>Email: <a href="mailto:support@suprfi.com" className="text-teal hover:underline">support@suprfi.com</a></li>
              <li>Website: <a href="https://suprfi.com" className="text-teal hover:underline">https://suprfi.com</a></li>
            </ul>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Privacy</h2>
            <p className="text-white/80 mb-6">
              Your privacy is important to us. Please review our{' '}
              <Link href="/privacy" className="text-teal hover:underline">Privacy Policy</Link> for information about how we collect, use, and protect your data.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Carriers</h2>
            <p className="text-white/80 mb-6">
              SuprFi SMS services are supported on all major US wireless carriers.
            </p>

            <h2 className="text-xl font-semibold text-white mt-8 mb-4">Terms</h2>
            <p className="text-white/80 mb-6">
              By opting in to SuprFi SMS messages, you agree to these terms and conditions. SuprFi reserves the right to modify these terms at any time. Changes will be posted at{' '}
              <Link href="/terms" className="text-teal hover:underline">https://suprfi.com/terms</Link>.
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
