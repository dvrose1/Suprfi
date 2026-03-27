import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';

export const metadata = {
  title: 'SMS Terms and Conditions | SuprFi',
  description: 'SuprFi SMS Terms and Conditions for financing notifications',
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-16 px-4 sm:px-6 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-8">SMS Terms and Conditions</h1>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">Last updated: March 26, 2026</p>

            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">Program Name</h2>
            <p className="text-gray-600 mb-6">SuprFi Financing Notifications</p>

            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">Program Description</h2>
            <p className="text-gray-600 mb-6">
              SuprFi sends SMS messages to homeowners with personalized consumer loan payment options for home services jobs. Messages include financing offers, monthly payment options, application links, application status updates, and follow-up reminders.
            </p>

            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">Message Frequency</h2>
            <p className="text-gray-600 mb-6">
              You may receive up to 10 messages per month related to your financing request. Message frequency varies based on your application status and engagement.
            </p>

            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">Message and Data Rates</h2>
            <p className="text-gray-600 mb-6">
              Message and data rates may apply. Check with your wireless carrier for details about your text messaging plan.
            </p>

            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">Opt-In</h2>
            <p className="text-gray-600 mb-6">
              By providing your phone number to SuprFi — either directly through our website or through your home services contractor — you consent to receive SMS messages from SuprFi regarding your financing options.
            </p>

            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">Opt-Out</h2>
            <p className="text-gray-600 mb-6">
              You can opt out of receiving SMS messages at any time by replying STOP to any message from SuprFi. After opting out, you will receive a single confirmation message and no further SMS communications will be sent.
            </p>

            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">Help</h2>
            <p className="text-gray-600 mb-6">
              For help or support, reply HELP to any message from SuprFi, or contact us at{' '}
              <a href="mailto:support@suprfi.com" className="text-teal hover:underline">support@suprfi.com</a>.
            </p>

            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">Support Contact</h2>
            <p className="text-gray-600 mb-2">For questions about the SuprFi SMS program, contact us at:</p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
              <li>Email: <a href="mailto:support@suprfi.com" className="text-teal hover:underline">support@suprfi.com</a></li>
              <li>Website: <a href="https://suprfi.com" className="text-teal hover:underline">https://suprfi.com</a></li>
            </ul>

            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">Privacy</h2>
            <p className="text-gray-600 mb-6">
              Your privacy is important to us. Please review our{' '}
              <a href="/privacy" className="text-teal hover:underline">Privacy Policy</a> for information about how we collect, use, and protect your data.
            </p>

            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">Carriers</h2>
            <p className="text-gray-600 mb-6">
              SuprFi SMS services are supported on all major US wireless carriers.
            </p>

            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">Terms</h2>
            <p className="text-gray-600 mb-6">
              By opting in to SuprFi SMS messages, you agree to these terms and conditions. SuprFi reserves the right to modify these terms at any time. Changes will be posted at{' '}
              <a href="/terms" className="text-teal hover:underline">https://suprfi.com/terms</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
