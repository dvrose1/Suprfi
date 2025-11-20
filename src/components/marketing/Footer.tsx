// ABOUTME: Footer component for marketing site with links, social media, and legal information
// ABOUTME: Includes company info, navigation links, and copyright notice

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer: React.FC = () => {
  const navigation = {
    product: [
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'For Homeowners', href: '/homeowners' },
      { name: 'For Contractors', href: '/contractors' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Careers', href: '#' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '#' },
      { name: 'Terms of Service', href: '#' },
      { name: 'Licensing', href: '#' },
    ],
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container-custom">
        <div className="py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="lg:col-span-2">
              <Link href="/" className="flex items-center space-x-3 mb-4">
                <Image
                  src="/logos/suprfi-logo-icon.png"
                  alt="SuprFi Logo"
                  width={32}
                  height={32}
                  className="h-8 w-auto"
                />
                <span className="text-xl font-bold">
                  <span className="text-primary-600">Supr</span>
                  <span className="text-gold-400">Fi</span>
                </span>
              </Link>
              <p className="text-gray-600 mb-4 max-w-sm">
                The Home Repair Financing Specialists. Fast, fair, and transparent financing for home services.
              </p>
              <p className="text-sm text-gray-500">
                Licensed lender. Loans subject to approval.
              </p>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Product
              </h3>
              <ul className="space-y-3">
                {navigation.product.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Company
              </h3>
              <ul className="space-y-3">
                {navigation.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-600 hover:text-primary-600 transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-gray-500">
                © {new Date().getFullYear()} SuprFi. All rights reserved.
              </p>
              <div className="flex items-center space-x-6">
                <a
                  href="mailto:hello@suprfi.com"
                  className="text-sm text-gray-500 hover:text-primary-600 transition-colors"
                >
                  hello@suprfi.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
