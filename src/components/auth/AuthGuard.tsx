'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authStore } from '@/lib/auth/user-store';

const PUBLIC_PATHS = ['/auth/signin', '/auth/signup'];

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = authStore.subscribe((user) => {
      const authed = Boolean(user);
      setIsAuthenticated(authed);
      setIsChecking(false);

      if (!authed && !PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
        router.replace('/auth/signup');
      }
    });
    return unsubscribe;
  }, [pathname, router]);

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return <>{children}</>;
  }

  // Still checking auth state
  if (isChecking) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <div className='w-6 h-6 border-2 border-zinc-600 border-t-zinc-100 rounded-full animate-spin' />
      </div>
    );
  }

  // Not authenticated — show nothing while redirecting
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
