'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authStore } from '@/lib/auth/user-store';
import { Sparkles, Mail, Lock, ArrowRight, User } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Пожалуйста, введите валидный email');
      return;
    }
    authStore.login(email);
    router.push('/profile');
  };

  const handleGuest = () => {
    authStore.loginAsGuest();
    router.push('/profile');
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <div className="p-8 rounded-3xl bg-[#0E1017] border border-white/10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ВХОД В АККАУНТ</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-white">Добро пожаловать в KuroNami</h1>
          <p className="text-xs text-slate-400">Войдите в свой профиль для доступа к истории и закладкам</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          <div className="space-y-1">
            <label className="block text-xs font-mono text-slate-300">Email адрес:</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07080B] border border-white/10 text-white text-xs font-sans placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono text-slate-300">Пароль:</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07080B] border border-white/10 text-white text-xs font-sans placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-display font-bold text-xs shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-2"
          >
            <span>Войти в профиль</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-white/10 flex flex-col gap-2 text-center text-xs font-mono">
          <Link href="/auth/signup" className="text-violet-400 hover:underline">
            Еще нет аккаунта? Зарегистрироваться →
          </Link>
          <button onClick={handleGuest} className="text-slate-400 hover:text-cyan-400 transition-colors">
            Войти как гость
          </button>
        </div>
      </div>
    </div>
  );
}
