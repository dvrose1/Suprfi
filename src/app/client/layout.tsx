// ABOUTME: SuprClient layout with auth provider
// ABOUTME: Wraps all client pages with contractor authentication context

'use client';

import { usePathname } from 'next/navigation';
import { ContractorAuthProvider } from '@/lib/auth/contractor-context';
import MobileNav from '@/components/client/MobileNav';

// Auth pages that don't need the mobile nav
const authPages = ['/client/login', '/client/forgot-password', '/client/reset-password', '/client/invite'];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = authPages.some(page => pathname?.startsWith(page));

  return (
    <ContractorAuthProvider>
      <div className={isAuthPage ? '' : 'pb-16 md:pb-0'}>
        {children}
      </div>
      {!isAuthPage && <MobileNav />}
    </ContractorAuthProvider>
  );
}
