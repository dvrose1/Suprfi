import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';

export const metadata = {
  title: 'Privacy Policy | SuprFi',
  description: 'SuprFi Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-16 px-4 sm:px-6 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-8">Privacy Policy</h1>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">Last updated: December 2024</p>
            <p className="text-gray-600">
              This Privacy Policy describes how SuprFi ("we", "us", or "our") collects, uses, and shares your personal information when you use our services.
            </p>
            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">Information We Collect</h2>
            <p className="text-gray-600">
              We collect information you provide directly to us, including your name, email address, phone number, and financial information necessary to process your financing application.
            </p>
            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">How We Use Your Information</h2>
            <p className="text-gray-600">
              We use the information we collect to process your financing application, communicate with you, and improve our services.
            </p>
            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have questions about this Privacy Policy, please contact us at privacy@suprfi.com.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
