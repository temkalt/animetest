'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { authStore, DEFAULT_AVATARS } from '@/lib/auth/user-store';
import { X, Sparkles, User, Mail, Lock, Check, ShieldCheck, ArrowRight } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'register',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@')) {
      setError('Введите корректный email адрес');
      return;
    }

    if (mode === 'register') {
      if (!name || name.trim().length < 2) {
        setError('Никнейм должен содержать минимум 2 символа');
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

      setSuccess('Отаку-паспорт успешно создан!');
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 800);
    } else {
      authStore.login(email);
      setSuccess('Успешный вход в систему!');
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 800);
    }
  };

  const handleGuest = () => {
    authStore.loginAsGuest();
    setSuccess('Вход в гостевом режиме!');
    setTimeout(() => {
      setSuccess('');
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md rounded-3xl bg-gradient-to-b from-[#141722] to-[#0E1017] border border-white/15 p-6 sm:p-8 shadow-[0_25px_60px_rgba(0,0,0,0.95)] z-10 space-y-6"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-mono mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ПАСПОРТ ОТАКУ</span>
          </div>
          <h2 className="text-2xl font-bold font-display text-white">
            {mode === 'register' ? 'Создать свой профиль' : 'Войти в аккаунт'}
          </h2>
          <p className="text-xs text-slate-400">
            {mode === 'register'
              ? 'Персональная история, закладки и синхронизация прогресса'
              : 'Введите данные для входа в ваш профиль'}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-[#07080B] border border-white/10">
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              mode === 'register'
                ? 'bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Регистрация
          </button>
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`py-2 rounded-lg text-xs font-mono font-bold transition-all ${
              mode === 'login'
                ? 'bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Вход
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-mono">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{success}</span>
            </div>
          )}

          {/* Avatar Selector (only for registration) */}
          {mode === 'register' && (
            <div className="space-y-2">
              <label className="block text-xs font-mono text-slate-300 font-semibold">
                Выберите аватар:
              </label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {DEFAULT_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 transition-all ${
                      selectedAvatar === av
                        ? 'ring-2 ring-violet-500 scale-105 shadow-[0_0_12px_rgba(139,92,246,0.6)]'
                        : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={av} alt="Avatar option" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {mode === 'register' && (
            <div className="space-y-1">
              <label className="block text-xs font-mono text-slate-300">Ваш никнейм:</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Например: Kirito_2026"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#07080B] border border-white/10 text-white text-xs font-sans placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>
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
            className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-display font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all flex items-center justify-center gap-2"
          >
            <span>{mode === 'register' ? 'Создать отаку-паспорт' : 'Войти в аккаунт'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Fast Guest Mode */}
        <div className="pt-2 border-t border-white/10 text-center">
          <button
            type="button"
            onClick={handleGuest}
            className="text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
          >
            Войти как гость без регистрации →
          </button>
        </div>
      </motion.div>
    </div>
  );
};
