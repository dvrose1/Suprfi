// ABOUTME: Auth context for SuprClient client-side auth state
// ABOUTME: Provides contractor user info and auth methods to components

'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { ContractorRole } from './contractor-roles';
import { canAccessPage, canPerformAction } from './contractor-roles';

interface ContractorUser {
  id: string;
  email: string;
  name: string | null;
  role: ContractorRole;
  contractorId: string;
  contractorName: string | null;
}

interface ContractorAuthContextType {
  user: ContractorUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  canAccess: (action: string) => boolean;
}

const ContractorAuthContext = createContext<ContractorAuthContextType | null>(null);

export function ContractorAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ContractorUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/client/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch contractor user:', err);
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
    if (!loading && !user && pathname?.startsWith('/client') && 
        !pathname?.startsWith('/client/login') && 
        !pathname?.startsWith('/client/forgot-password') &&
        !pathname?.startsWith('/client/reset-password') &&
        !pathname?.startsWith('/client/invite')) {
      router.push('/client/login');
    }
    
    // Check page access based on role
    if (!loading && user && pathname) {
      if (!canAccessPage(user.role, pathname)) {
        router.push('/client?error=unauthorized');
      }
    }
  }, [loading, user, pathname, router]);

  const logout = async () => {
    try {
      await fetch('/api/v1/client/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/client/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  const canAccess = useCallback((action: string): boolean => {
    if (!user) return false;
    return canPerformAction(user.role, action);
  }, [user]);

  return (
    <ContractorAuthContext.Provider value={{ user, loading, logout, refreshUser, canAccess }}>
      {children}
    </ContractorAuthContext.Provider>
  );
}

export function useContractorAuth() {
  const context = useContext(ContractorAuthContext);
  if (!context) {
    throw new Error('useContractorAuth must be used within a ContractorAuthProvider');
  }
  return context;
}

export function useRequireContractorAuth(requiredRole?: ContractorRole) {
  const { user, loading, canAccess } = useContractorAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/client/login');
    }
    
    if (!loading && user && requiredRole) {
      const roleLevel: Record<ContractorRole, number> = {
        viewer: 1,
        tech: 2,
        manager: 3,
        owner: 4,
      };
      
      if (roleLevel[user.role] < roleLevel[requiredRole]) {
        router.push('/client?error=unauthorized');
      }
    }
  }, [loading, user, requiredRole, router]);

  return { user, loading, isAuthorized: !loading && !!user, canAccess };
}
