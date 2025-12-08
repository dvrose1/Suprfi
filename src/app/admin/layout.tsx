// ABOUTME: Admin layout with auth provider
// ABOUTME: Wraps all admin pages with authentication context

import { AuthProvider } from '@/lib/auth/context';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
