'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { authStore, DEFAULT_AVATARS } from '@/lib/auth/user-store';
import { Sparkles, Mail, Lock, User, ArrowRight } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0]);
  const [error, setError] = useState('');

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || name.trim().length < 2) {
      setError('Никнейм должен содержать минимум 2 символа');
      return;
    }
    if (!email || !email.includes('@')) {
      setError('Пожалуйста, введите валидный email');
      return;
    }
    if (!password || password.length < 4) {
      setError('Пароль должен содержать минимум 4 символа');
      return;
    }

    authStore.register({
      name,
      email,
      password,
      avatar: selectedAvatar,
    });

    router.push('/profile');
  };

  return (
    <div className="max-w-md mx-auto py-12 space-y-6">
      <div className="p-8 rounded-3xl bg-[#0E1017] border border-white/10 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5" />
            <span>РЕГИСТРАЦИЯ ПРОФИЛЯ</span>
          </div>
          <h1 className="text-2xl font-bold font-display text-white">Создайте свой Отаку-паспорт</h1>
          <p className="text-xs text-slate-400">Сохраняйте любимые аниме и историю на всех устройствах</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          {/* Avatar Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-mono text-slate-300 font-semibold">Выберите аватар:</label>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {DEFAULT_AVATARS.map((av, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(av)}
                  className={`relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 transition-all ${
                    selectedAvatar === av ? 'ring-2 ring-violet-500 scale-105' : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image src={av} alt="Avatar option" fill className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-mono text-slate-300">Ваш никнейм:</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Например: Tanjiro_Kun"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07080B] border border-white/10 text-white text-xs font-sans placeholder-slate-500 focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

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
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-display font-bold text-xs shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-2"
          >
            <span>Зарегистрировать профиль</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-white/10 text-center text-xs font-mono">
          <Link href="/auth/signin" className="text-violet-400 hover:underline">
            Уже есть аккаунт? Войти →
          </Link>
        </div>
      </div>
    </div>
  );
}
