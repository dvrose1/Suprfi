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
      <main className="pt-20 min-h-screen bg-warm-white">
        <div className="py-16 md:py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl sm:text-4xl font-bold font-display text-navy mb-8 text-center">Rates & Terms</h1>
            
            <div className="grid sm:grid-cols-3 gap-4 mb-12">
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                <div className="text-sm text-medium-gray mb-2">Loan Amounts</div>
                <div className="text-2xl font-bold font-display text-navy">$2,500 - $25,000</div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                <div className="text-sm text-medium-gray mb-2">APR Range</div>
                <div className="text-2xl font-bold font-display text-navy">14.99% - 29.99%</div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-center">
                <div className="text-sm text-medium-gray mb-2">Loan Terms</div>
                <div className="text-2xl font-bold font-display text-navy">12 - 60 months</div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm space-y-8">
              <div>
                <h2 className="text-xl font-semibold font-display text-navy mb-3">How Rates Are Determined</h2>
                <p className="text-medium-gray leading-relaxed">
                  Your rate is based on your credit profile, income, and other factors. Better credit typically means lower rates.
                </p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold font-display text-navy mb-3">No Hidden Fees</h2>
                <p className="text-medium-gray leading-relaxed">
                  We believe in transparency. There are no origination fees, no prepayment penalties, and no hidden charges.
                </p>
              </div>
              
              <div>
                <h2 className="text-xl font-semibold font-display text-navy mb-3">Example Payment</h2>
                <p className="text-medium-gray leading-relaxed">
                  A $10,000 loan at 19.99% APR for 36 months = approximately $370/month.
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
