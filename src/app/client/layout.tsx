// ABOUTME: SuprClient layout with auth provider
// ABOUTME: Wraps all client pages with contractor authentication context

import { ContractorAuthProvider } from '@/lib/auth/contractor-context';
import MobileNav from '@/components/client/MobileNav';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ContractorAuthProvider>
      <div className="pb-16 md:pb-0">
        {children}
      </div>
      <MobileNav />
    </ContractorAuthProvider>
  );
}
