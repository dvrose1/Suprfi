import Header from '@/components/marketing/Header';
import Footer from '@/components/marketing/Footer';

export const metadata = {
  title: 'Rates & Terms | SuprFi',
  description: 'SuprFi financing rates and terms',
};

export default function RatesPage() {
  return (
    <>
      <Header />
      <main className="pt-24 pb-16 px-4 sm:px-6 min-h-screen">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-navy mb-8">Rates & Terms</h1>
          
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center">
              <div className="text-sm text-gray-500 mb-1">Loan Amounts</div>
              <div className="text-2xl font-bold text-navy">$2,500 - $25,000</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center">
              <div className="text-sm text-gray-500 mb-1">APR Range</div>
              <div className="text-2xl font-bold text-navy">14.99% - 29.99%</div>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm text-center">
              <div className="text-sm text-gray-500 mb-1">Loan Terms</div>
              <div className="text-2xl font-bold text-navy">12 - 60 months</div>
            </div>
          </div>

          <div className="prose prose-gray max-w-none">
            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">How Rates Are Determined</h2>
            <p className="text-gray-600">
              Your rate is based on your credit profile, income, and other factors. Better credit typically means lower rates.
            </p>
            
            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">No Hidden Fees</h2>
            <p className="text-gray-600">
              We believe in transparency. There are no origination fees, no prepayment penalties, and no hidden charges.
            </p>
            
            <h2 className="text-xl font-semibold text-navy mt-8 mb-4">Example Payment</h2>
            <p className="text-gray-600">
              A $10,000 loan at 19.99% APR for 36 months = approximately $370/month.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
