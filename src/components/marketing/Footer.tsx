import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
  const navigation = {
    product: [
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'Rates & Terms', href: '/rates' },
      { name: 'Calculator', href: '/calculator' },
      { name: 'Help Center', href: '/help' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'For Contractors', href: '/contractors' },
      { name: 'Careers', href: '/careers' },
      { name: 'Blog', href: '/blog' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Licenses', href: '/licenses' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-400 py-10 sm:py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-8 sm:mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-accent">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-xl font-bold text-white font-display">SuprFi</span>
            </Link>
            <p className="text-xs sm:text-sm">Financing that works as fast as you need it.</p>
          </div>
          
          {/* Product */}
          <div>
            <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Product</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {navigation.product.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-3 sm:mb-4 text-sm sm:text-base">Legal</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {navigation.legal.map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="hover:text-white transition-colors">
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom bar */}
        <div className="border-t border-gray-800 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
          <p className="text-xs sm:text-sm">© {new Date().getFullYear()} SuprFi Inc. All rights reserved.</p>
          <p className="text-xs text-gray-500 max-w-2xl text-center md:text-right">
            Loans are provided by SuprFi&apos;s lending partners. APR ranges from 14.99% to 29.99%. 
            Rates depend on credit profile and loan terms.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
