'use client';
import React from 'react';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/AuthCard';
import { ArrowLeft } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className='min-h-[80vh] flex flex-col justify-center items-center py-8 px-4'>
      <div className='w-full max-w-md mb-6'>
        <Link href='/' className='inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors'>
          <ArrowLeft className='w-4 h-4' />
          <span>На главную</span>
        </Link>
      </div>
      <AuthCard initialMode='login' redirectTo='/profile' />
    </div>
  );
}
