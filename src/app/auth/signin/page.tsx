'use client';

import React from 'react';
import Link from 'next/link';
import { AuthCard } from '@/components/auth/AuthCard';
import { Sparkles, Shield, ArrowLeft, Zap, Tv, Compass } from 'lucide-react';

export default function SignInPage() {
  return (
    <div className="relative min-h-[82vh] flex flex-col justify-center items-center py-8 px-4 overflow-hidden">
      {/* Cyberpunk Background Neon Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-gradient-to-tr from-violet-600/20 via-cyan-500/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Breadcrumb / Return */}
      <div className="w-full max-w-md mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          <span>Вернуться на главную</span>
        </Link>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>СЕРВЕР: ONLINE</span>
        </div>
      </div>

      {/* Main Glass Auth Card */}
      <AuthCard initialMode="login" redirectTo="/profile" />

      {/* Cyberpunk Feature Pillars */}
      <div className="w-full max-w-md mt-8 grid grid-cols-3 gap-3 text-center">
        <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm space-y-1">
          <Tv className="w-4 h-4 mx-auto text-cyan-400" />
          <p className="text-[10px] font-mono font-bold text-white">1080p FHD</p>
          <p className="text-[9px] text-slate-400">Без рекламы</p>
        </div>
        <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm space-y-1">
          <Zap className="w-4 h-4 mx-auto text-violet-400" />
          <p className="text-[10px] font-mono font-bold text-white">Синхронизация</p>
          <p className="text-[9px] text-slate-400">Все устройства</p>
        </div>
        <div className="p-2.5 rounded-2xl bg-white/[0.02] border border-white/5 backdrop-blur-sm space-y-1">
          <Shield className="w-4 h-4 mx-auto text-emerald-400" />
          <p className="text-[10px] font-mono font-bold text-white">Отаку-Паспорт</p>
          <p className="text-[9px] text-slate-400">Прокачка уровня</p>
        </div>
      </div>
    </div>
  );
}
