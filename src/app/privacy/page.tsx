import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';

export const metadata = {
  title: 'Privacy Policy | SuprFi',
  description: 'SuprFi Privacy Policy - How we collect, use, and protect your personal information',
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-16 px-4 sm:px-6 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-8">Privacy Policy</h1>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">Last updated: March 26, 2026</p>
            
            <p className="text-gray-600 mb-6">
              SuprFi (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) respects your privacy. This Privacy Policy explains how we collect, use, and protect your personal information when you use our services.
            </p>

            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">What We Collect</h2>
            <p className="text-gray-600 mb-4">
              We collect personal information that you or your home services contractor provide to us in connection with a financing request, including:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
              <li>Name, phone number, email address, and home address</li>
              <li>Job details (service type and quoted amount)</li>
              <li>Financial information you provide as part of a loan application (such as income, employment, and credit information)</li>
            </ul>

            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">How We Use Your Information</h2>
            <p className="text-gray-600 mb-4">We use your personal information to:</p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
              <li>Process and evaluate loan applications</li>
              <li>Communicate with you about your financing options via SMS and email</li>
              <li>Provide customer support</li>
              <li>Comply with legal and regulatory requirements</li>
              <li>Improve our services</li>
            </ul>

            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">SMS Communications</h2>
            <p className="text-gray-600 mb-4">
              When a home services contractor submits a financing request on your behalf, or when you provide your phone number through our website, you may receive SMS messages from SuprFi related to your financing options. These messages may include:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
              <li>Monthly payment options</li>
              <li>Application links</li>
              <li>Status updates</li>
              <li>Follow-up reminders</li>
            </ul>
            <p className="text-gray-600 mb-6">
              Message and data rates may apply. You can opt out of SMS communications at any time by replying STOP to any message.
            </p>

            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">How We Protect Your Information</h2>
            <p className="text-gray-600 mb-4">
              We use industry-standard security measures to protect your personal information, including:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
              <li>Encryption of data in transit and at rest</li>
              <li>Secure storage of financial information</li>
              <li>Access controls limiting who can view your data</li>
            </ul>

            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">Information Sharing</h2>
            <p className="text-gray-600 mb-4">
              We do not sell your personal information. We do not share your information for marketing purposes. We may share your information with:
            </p>
            <ul className="list-disc list-inside text-gray-600 mb-6 space-y-1">
              <li>Service providers who help us operate our business (such as our SMS provider)</li>
              <li>As required by law or regulation</li>
              <li>As necessary to process your loan application</li>
            </ul>

            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">Your Rights</h2>
            <p className="text-gray-600 mb-6">
              You may request access to, correction of, or deletion of your personal information by contacting us at{' '}
              <a href="mailto:privacy@suprfi.com" className="text-teal hover:underline">privacy@suprfi.com</a>.
            </p>

            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have questions about this Privacy Policy, contact us at:
            </p>
            <p className="text-gray-600 mt-2">
              <strong>SuprFi</strong><br />
              Email: <a href="mailto:privacy@suprfi.com" className="text-teal hover:underline">privacy@suprfi.com</a>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
