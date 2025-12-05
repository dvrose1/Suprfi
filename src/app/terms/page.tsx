import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';

export const metadata = {
  title: 'Terms of Service | SuprFi',
  description: 'SuprFi Terms of Service',
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-16 px-4 sm:px-6 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-8">Terms of Service</h1>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-6">Last updated: December 2024</p>
            <p className="text-gray-600">
              These Terms of Service govern your use of SuprFi's financing services. By using our services, you agree to these terms.
            </p>
            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">Use of Services</h2>
            <p className="text-gray-600">
              You must be at least 18 years old and a U.S. resident to use our financing services. You agree to provide accurate information in your application.
            </p>
            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">Loan Terms</h2>
            <p className="text-gray-600">
              Specific loan terms, including APR, monthly payments, and total repayment amounts, will be disclosed to you before you accept any financing offer.
            </p>
            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">Contact Us</h2>
            <p className="text-gray-600">
              If you have questions about these Terms, please contact us at legal@suprfi.com.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
