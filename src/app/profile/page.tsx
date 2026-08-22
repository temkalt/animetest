'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authStore } from '@/lib/auth/user-store';

export default function ProfileRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    const user = authStore.getUser();
    if (user) {
      router.replace(`/user/${user.username}`);
    } else {
      router.replace('/');
    }
  }, [router]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-zinc-600 border-t-zinc-100 rounded-full animate-spin" />
    </div>
  );
}
