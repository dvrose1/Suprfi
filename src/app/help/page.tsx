// ABOUTME: Help center page with FAQs and support contact
// ABOUTME: Common questions about financing and application process

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
      <main className="pt-20 min-h-screen bg-warm-white">
        <div className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-navy mb-8 text-center">Help Center</h1>
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-semibold font-display text-navy mb-3">How do I apply for financing?</h2>
                <p className="text-medium-gray leading-relaxed">
                  Your service provider will send you a secure link to apply. Complete the application in minutes and get instant offers.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-semibold font-display text-navy mb-3">What are the requirements?</h2>
                <p className="text-medium-gray leading-relaxed">
                  You must be at least 18 years old, a U.S. resident, and have a valid bank account. We'll verify your identity and income during the application.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-semibold font-display text-navy mb-3">Will checking my rate affect my credit?</h2>
                <p className="text-medium-gray leading-relaxed">
                  No. We use a soft credit check to show you options, which does not affect your credit score.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-xl font-semibold font-display text-navy mb-3">Contact Support</h2>
                <p className="text-medium-gray leading-relaxed">
                  Email us at <a href="mailto:support@suprfi.com" className="text-teal hover:underline">support@suprfi.com</a> for assistance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
