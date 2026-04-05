// ABOUTME: Responsive header for SuprClient
// ABOUTME: Desktop nav + mobile hamburger menu with spring animations

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useContractorAuth } from '@/lib/auth/contractor-context';
import { springSlideRight, backdropFade, springs } from '@/lib/animations';

interface ClientHeaderProps {
  hideNav?: boolean;
}

export default function ClientHeader({ hideNav }: ClientHeaderProps) {
  const { user, logout, canAccess } = useContractorAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  if (!user) return null;

  const navItems = [
    { href: '/client', label: 'Dashboard' },
    { href: '/client/applications', label: 'Applications' },
    { href: '/client/analytics', label: 'Analytics', permission: 'analytics:view' },
  ];

  const isActive = (href: string) => {
    if (href === '/client') return pathname === '/client';
    return pathname?.startsWith(href);
  };

  return (
    <>
      <header className="bg-navy sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo */}
            <Link href="/client" className="flex items-center hover:opacity-80 transition-opacity">
              <img
                src="/logos/wordmark white and mint.svg"
                alt="SuprFi"
                className="h-7 w-auto"
              />
              <span className="ml-2 text-white/40 text-sm font-medium hidden sm:inline">for Contractors</span>
            </Link>

            {/* Desktop Nav */}
            {!hideNav && (
              <nav className="hidden md:flex items-center gap-1">
                {navItems.map((item) => {
                  if (item.permission && !canAccess(item.permission)) return null;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? 'text-white bg-white/10'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            )}

            {/* Right side */}
            <div className="flex items-center gap-3">
              {/* Desktop: Send Link Button */}
              {canAccess('application:send_link') && (
                <Link
                  href="/client/new"
                  className="hidden sm:flex bg-teal text-white rounded-lg font-semibold px-4 py-2 hover:bg-teal/90 transition-colors text-sm"
                >
                  + Send Link
                </Link>
              )}

              {/* Desktop: User Menu */}
              <div className="hidden md:block relative group">
                <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 bg-teal text-white rounded-full flex items-center justify-center font-semibold text-sm">
                    {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </div>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-sm font-medium text-navy truncate">{user.name || user.email}</p>
                    <p className="text-xs text-medium-gray truncate">{user.contractorName}</p>
                  </div>
                  {canAccess('team:view') && (
                    <Link href="/client/team" className="block px-3 py-2 text-sm text-navy hover:bg-light-gray rounded-lg mx-1 my-1">
                      Team
                    </Link>
                  )}
                  <Link href="/client/settings" className="block px-3 py-2 text-sm text-navy hover:bg-light-gray rounded-lg mx-1 my-1">
                    Settings
                  </Link>
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() => logout()}
                      className="w-full text-left px-3 py-2 text-sm text-error hover:bg-error/5 rounded-lg mx-1 my-1"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>

              {/* Mobile: Hamburger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 -mr-2"
              >
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay with spring animation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-30" onClick={() => setMobileMenuOpen(false)}>
            <motion.div 
              className="absolute inset-0 bg-black/50"
              variants={prefersReducedMotion ? undefined : backdropFade}
              initial="hidden"
              animate="visible"
              exit="exit"
            />
            <motion.div 
              className="absolute top-14 right-0 w-64 bg-white shadow-xl rounded-bl-2xl"
              onClick={(e) => e.stopPropagation()}
              initial={prefersReducedMotion ? { opacity: 0 } : { x: '100%', opacity: 0.8 }}
              animate={prefersReducedMotion ? { opacity: 1 } : { x: 0, opacity: 1 }}
              exit={prefersReducedMotion ? { opacity: 0 } : { x: '100%', opacity: 0 }}
              transition={prefersReducedMotion ? { duration: 0.15 } : springs.bouncy}
            >
              {/* User Info */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-navy text-white rounded-full flex items-center justify-center font-semibold">
                    {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{user.name || user.email}</p>
                    <p className="text-xs text-gray-500 truncate">{user.contractorName}</p>
                  </div>
                </div>
              </div>

              {/* Nav Links */}
              <div className="py-2">
                {canAccess('team:view') && (
                  <Link
                    href="/client/team"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-50"
                  >
                    Team Management
                  </Link>
                )}
                <Link
                  href="/client/settings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-4 py-3 text-gray-700 hover:bg-gray-50"
                >
                  Settings
                </Link>
              </div>

              {/* Sign Out */}
              <div className="border-t border-gray-100 py-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-3 text-error hover:bg-error/5"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
