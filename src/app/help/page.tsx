import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';

export const metadata = {
  title: 'Help Center | SuprFi',
  description: 'Get help with SuprFi financing',
};

export default function HelpPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-16 px-4 sm:px-6 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-8">Help Center</h1>
          <div className="space-y-8">
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-semibold text-navy mb-3">How do I apply for financing?</h2>
              <p className="text-gray-600">
                Your service provider will send you a secure link to apply. Complete the application in minutes and get instant offers.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-semibold text-navy mb-3">What are the requirements?</h2>
              <p className="text-gray-600">
                You must be at least 18 years old, a U.S. resident, and have a valid bank account. We'll verify your identity and income during the application.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-semibold text-navy mb-3">Will checking my rate affect my credit?</h2>
              <p className="text-gray-600">
                No. We use a soft credit check to show you options, which does not affect your credit score.
              </p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-semibold text-navy mb-3">Contact Support</h2>
              <p className="text-gray-600">
                Email us at support@suprfi.com or call 1-800-SUPRFI for assistance.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
