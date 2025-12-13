// ABOUTME: Auth context for Borrower Portal client-side auth state
// ABOUTME: Provides borrower user info and auth methods to components

'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface BorrowerUser {
  id: string;
  customerId: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
}

interface BorrowerAuthContextType {
  user: BorrowerUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const BorrowerAuthContext = createContext<BorrowerAuthContextType | null>(null);

// Auth pages that don't require authentication
const publicPaths = ['/portal/login', '/portal/magic-link'];

export function BorrowerAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<BorrowerUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/portal/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch borrower user:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Redirect to login if not authenticated on protected pages
  useEffect(() => {
    if (!loading && !user && pathname?.startsWith('/portal')) {
      const isPublicPath = publicPaths.some(path => pathname?.startsWith(path));
      if (!isPublicPath) {
        router.push('/portal/login');
      }
    }
  }, [loading, user, pathname, router]);

  const logout = async () => {
    try {
      await fetch('/api/v1/portal/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/portal/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <BorrowerAuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </BorrowerAuthContext.Provider>
  );
}

export function useBorrowerAuth() {
  const context = useContext(BorrowerAuthContext);
  if (!context) {
    throw new Error('useBorrowerAuth must be used within a BorrowerAuthProvider');
  }
  return context;
}
