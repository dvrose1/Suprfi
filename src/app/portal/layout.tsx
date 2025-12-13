// ABOUTME: Borrower Portal layout
// ABOUTME: Wraps all portal pages with borrower authentication context

'use client';

import { usePathname } from 'next/navigation';
import { BorrowerAuthProvider } from '@/lib/auth/borrower-context';

// Auth pages that don't need bottom nav
const authPages = ['/portal/login', '/portal/magic-link'];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = authPages.some(page => pathname?.startsWith(page));

  return (
    <BorrowerAuthProvider>
      <div className={isAuthPage ? '' : 'pb-20 md:pb-0'}>
        {children}
      </div>
    </BorrowerAuthProvider>
  );
}
