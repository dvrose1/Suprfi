// ABOUTME: SuprClient layout with auth provider
// ABOUTME: Wraps all client pages with contractor authentication context

import { ContractorAuthProvider } from '@/lib/auth/contractor-context';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ContractorAuthProvider>
      {children}
    </ContractorAuthProvider>
  );
}
