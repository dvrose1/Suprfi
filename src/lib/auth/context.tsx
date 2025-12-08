// ABOUTME: Auth context for client-side auth state
// ABOUTME: Provides user info and auth methods to components

'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export type AdminRole = 'god' | 'admin' | 'ops' | 'viewer';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: AdminRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/admin/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
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
    if (!loading && !user && pathname?.startsWith('/admin') && 
        !pathname?.startsWith('/admin/login') && 
        !pathname?.startsWith('/admin/forgot-password') &&
        !pathname?.startsWith('/admin/reset-password')) {
      router.push('/admin/login');
    }
  }, [loading, user, pathname, router]);

  const logout = async () => {
    try {
      await fetch('/api/v1/admin/auth/logout', { method: 'POST' });
      setUser(null);
      router.push('/admin/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useRequireAuth(requiredRole?: AdminRole) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
    
    if (!loading && user && requiredRole) {
      const roleLevel: Record<AdminRole, number> = {
        viewer: 1,
        ops: 2,
        admin: 3,
        god: 4,
      };
      
      if (roleLevel[user.role] < roleLevel[requiredRole]) {
        router.push('/admin?error=unauthorized');
      }
    }
  }, [loading, user, requiredRole, router]);

  return { user, loading, isAuthorized: !loading && !!user };
}
