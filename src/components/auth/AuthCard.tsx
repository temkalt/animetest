'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { authStore, DEFAULT_AVATARS } from '@/lib/auth/user-store';
import { CyberInput } from '@/components/auth/CyberInput';
import { AvatarSelector } from '@/components/auth/AvatarSelector';
import {
  Sparkles,
  User,
  Mail,
  Lock,
  ArrowRight,
  Zap,
  Check,
  ShieldCheck,
  X,
  Flame,
  KeyRound,
} from 'lucide-react';

interface AuthCardProps {
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
  redirectTo?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  initialMode = 'register',
  onSuccess,
  onClose,
  showCloseButton = false,
  redirectTo,
}) => {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Calculate password strength for registration
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 4) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Слабый пароль', color: 'bg-rose-500' };
      case 2:
        return { score: 2, label: 'Базовый доступ', color: 'bg-amber-500' };
      case 3:
        return { score: 3, label: 'Надежный шифр', color: 'bg-cyan-400' };
      case 4:
        return { score: 4, label: 'Кибер-щит активирован', color: 'bg-violet-400' };
      default:
        return { score: 0, label: '', color: 'bg-slate-700' };
    }
  };

  const passwordStrength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
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

      setIsLoading(true);
      try {
        authStore.register({
          name: name.trim(),
          email: email.trim(),
          password,
          avatar: selectedAvatar,
        });

        setSuccess('Отаку-паспорт успешно активирован!');
        setTimeout(() => {
          setSuccess('');
          setIsLoading(false);
          if (onSuccess) onSuccess();
          if (redirectTo) router.push(redirectTo);
        }, 700);
      } catch (err) {
        setIsLoading(false);
        setError('Ошибка при регистрации. Попробуйте еще раз.');
      }
    } else {
      if (!password || password.length < 1) {
        setError('Пожалуйста, введите пароль для входа');
        return;
      }

      setIsLoading(true);
      try {
        authStore.login(email.trim());
        setSuccess('Нейро-синхронизация завершена! Вход выполнен.');
        setTimeout(() => {
          setSuccess('');
          setIsLoading(false);
          if (onSuccess) onSuccess();
          if (redirectTo) router.push(redirectTo);
        }, 700);
      } catch (err) {
        setIsLoading(false);
        setError('Ошибка при входе. Проверьте введенные данные.');
      }
    }
  };

  const handleGuestLogin = () => {
    setIsLoading(true);
    authStore.loginAsGuest();
    setSuccess('Гостевой режим активирован! Добро пожаловать.');
    setTimeout(() => {
      setSuccess('');
      setIsLoading(false);
      if (onSuccess) onSuccess();
      if (redirectTo) router.push(redirectTo);
    }, 600);
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* Specular Neon Violet/Cyan Ambient Glow Aura */}
      <div className="absolute -inset-1 rounded-[2.5rem] bg-gradient-to-r from-violet-600/30 via-cyan-500/25 to-indigo-600/30 blur-xl opacity-70 pointer-events-none transition-all duration-500" />

      {/* Cyberpunk Glass Card Wrapper with Specular Gradient Border */}
      <div className="relative rounded-[2rem] p-[1px] bg-gradient-to-b from-cyan-400/40 via-violet-500/20 to-white/5 shadow-[0_20px_60px_rgba(0,0,0,0.9),0_0_40px_-10px_rgba(6,182,212,0.2)]">
        {/* Card Body */}
        <div className="relative rounded-[1.95rem] bg-[#090C16]/90 backdrop-blur-2xl p-6 sm:p-8 space-y-6 overflow-hidden border border-white/5">
          {/* Subtle Cyberpunk Scanline / Top Glow Line */}
          <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

          {/* Close Button (if enabled for modal) */}
          {showCloseButton && onClose && (
            <button
              onClick={onClose}
              type="button"
              className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all border border-white/5 hover:border-cyan-400/30 group z-20"
              title="Закрыть окно"
            >
              <X className="w-4 h-4 transition-transform group-hover:rotate-90" />
            </button>
          )}

          {/* Header & HUD Telemetry */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-violet-500/20 via-cyan-500/20 to-violet-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono shadow-[0_0_15px_rgba(6,182,212,0.2)]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span className="tracking-wider uppercase font-bold">
                {mode === 'register' ? 'ПАСПОРТ ОТАКУ // 2026' : 'АВТОРИЗАЦИЯ // KURO-NET'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight">
              {mode === 'register' ? 'Создать свой профиль' : 'Добро пожаловать'}
            </h2>

            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
              {mode === 'register'
                ? 'Персональная история просмотров, закладки и синхронизация уровня'
                : 'Войдите в учетную запись для доступа ко всем функциям KuroNami'}
            </p>
          </div>

          {/* Smooth Mode Switcher Tabs */}
          <div className="relative grid grid-cols-2 p-1 rounded-2xl bg-[#05070E]/90 border border-white/10 backdrop-blur-md">
            <button
              type="button"
              onClick={() => {
                setError('');
                setMode('register');
              }}
              className={`relative py-2.5 rounded-xl text-xs font-mono font-bold transition-colors z-10 ${
                mode === 'register' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode === 'register' && (
                <motion.div
                  layoutId="authTabIndicator"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-[0_0_15px_rgba(139,92,246,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)]"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Регистрация
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setError('');
                setMode('login');
              }}
              className={`relative py-2.5 rounded-xl text-xs font-mono font-bold transition-colors z-10 ${
                mode === 'login' ? 'text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode === 'login' && (
                <motion.div
                  layoutId="authTabIndicator"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 shadow-[0_0_15px_rgba(6,182,212,0.6),inset_0_1px_1px_rgba(255,255,255,0.2)]"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center justify-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5" />
                Вход
              </span>
            </button>
          </div>

          {/* Form with Animated Switch */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-center gap-2 shadow-[0_0_15px_rgba(244,63,94,0.15)]"
              >
                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Success Message Display */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
              >
                <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {mode === 'register' ? (
                <motion.div
                  key="register-fields"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3.5"
                >
                  {/* Interactive Avatar Selector & Live Level Preview */}
                  <AvatarSelector
                    selectedAvatar={selectedAvatar}
                    onSelect={setSelectedAvatar}
                    nickname={name}
                  />

                  {/* Nickname Input with Floating Label */}
                  <CyberInput
                    label="Ваш никнейм"
                    icon={User}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="username"
                    required
                  />

                  {/* Email Input with Floating Label */}
                  <CyberInput
                    label="Email адрес"
                    icon={Mail}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />

                  {/* Password Input with Reveal Toggle & Strength Meter */}
                  <div className="space-y-1.5">
                    <CyberInput
                      label="Пароль для защиты профиля"
                      icon={Lock}
                      isPassword
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="new-password"
                      required
                    />

                    {/* Password Strength Indicator */}
                    {password.length > 0 && (
                      <div className="space-y-1 px-1">
                        <div className="flex items-center justify-between text-[10px] font-mono">
                          <span className="text-slate-400">Уровень защиты:</span>
                          <span className="font-semibold text-slate-200">
                            {passwordStrength.label}
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-1 h-1">
                          {[1, 2, 3, 4].map((step) => (
                            <div
                              key={step}
                              className={`h-full rounded-full transition-all duration-300 ${
                                step <= passwordStrength.score
                                  ? passwordStrength.color
                                  : 'bg-white/10'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="login-fields"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3.5"
                >
                  {/* Email Input with Floating Label */}
                  <CyberInput
                    label="Email адрес"
                    icon={Mail}
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />

                  {/* Password Input with Floating Label & Reveal Toggle */}
                  <CyberInput
                    label="Пароль"
                    icon={Lock}
                    isPassword
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Action Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full py-3.5 rounded-2xl text-white font-display font-bold text-xs sm:text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden shadow-lg ${
                mode === 'register'
                  ? 'bg-gradient-to-r from-violet-600 via-indigo-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 shadow-[0_0_25px_rgba(139,92,246,0.45)]'
                  : 'bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-[0_0_25px_rgba(6,182,212,0.45)]'
              } disabled:opacity-50`}
            >
              {/* Button Specular Flare */}
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <span className="relative z-10">
                {isLoading
                  ? 'Синхронизация...'
                  : mode === 'register'
                  ? 'Создать отаку-паспорт'
                  : 'Войти в аккаунт'}
              </span>
              <ArrowRight className="w-4 h-4 relative z-10 transition-transform group-hover:translate-x-1" />
            </button>
          </form>

          {/* Instant One-Click Guest Login Option */}
          <div className="pt-3 border-t border-white/10 space-y-2">
            <button
              type="button"
              onClick={handleGuestLogin}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-2xl bg-[#0F1426]/70 hover:bg-[#151D38]/90 border border-cyan-500/20 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 font-mono text-xs transition-all duration-200 flex items-center justify-between group shadow-sm"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <Zap className="w-3.5 h-3.5 fill-cyan-400/30" />
                </div>
                <div className="text-left">
                  <span className="font-bold text-white group-hover:text-cyan-300">
                    Войти как гость
                  </span>
                  <span className="hidden sm:inline text-[10px] text-slate-400 pl-1.5">
                    (Без пароля)
                  </span>
                </div>
              </div>
              <span className="text-[11px] text-cyan-400 group-hover:translate-x-0.5 transition-transform">
                Быстрый вход →
              </span>
            </button>

            <p className="text-[10px] font-mono text-slate-500 text-center">
              История просмотров и закладки сохраняются локально на этом устройстве
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
