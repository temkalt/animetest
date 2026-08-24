'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { authStore, DEFAULT_AVATARS } from '@/lib/auth/user-store';
import { CyberInput } from '@/components/auth/CyberInput';
import { AvatarSelector } from '@/components/auth/AvatarSelector';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  Check,
  X,
  KeyRound,
  UserPlus
} from 'lucide-react';

interface AuthCardProps {
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
  redirectTo?: string;
  isGate?: boolean;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  initialMode = 'register',
  onSuccess,
  onClose,
  showCloseButton = false,
  redirectTo,
  isGate = false,
}) => {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(DEFAULT_AVATARS[0]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-zinc-800' };
    let score = 0;
    if (pass.length >= 4) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) || /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 1, label: 'Простой', color: 'bg-rose-500' };
      case 2:
        return { score: 2, label: 'Средний', color: 'bg-amber-500' };
      case 3:
        return { score: 3, label: 'Надёжный', color: 'bg-zinc-300' };
      case 4:
        return { score: 4, label: 'Отличный', color: 'bg-white' };
      default:
        return { score: 0, label: '', color: 'bg-zinc-800' };
    }
  };

  const passwordStrength = getPasswordStrength(password);

  const [usernameStatus, setUsernameStatus] = useState<{
    isChecking: boolean;
    available?: boolean;
    reason?: string;
  }>({ isChecking: false });

  const cleanUsername = authStore.normalizeUsername(username);

  // Live debounced server-side check for username availability
  useEffect(() => {
    if (mode !== 'register') {
      setUsernameStatus({ isChecking: false });
      return;
    }

    if (!cleanUsername || cleanUsername.length < 2) {
      setUsernameStatus({ isChecking: false, available: undefined });
      return;
    }

    setUsernameStatus({ isChecking: true });

    const timer = setTimeout(async () => {
      const result = await authStore.checkUsernameAvailability(cleanUsername);
      setUsernameStatus({
        isChecking: false,
        available: result.available,
        reason: result.reason,
      });
    }, 250);

    return () => clearTimeout(timer);
  }, [cleanUsername, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'register') {
      const cleanUser = authStore.normalizeUsername(username);
      if (!cleanUser || cleanUser.length < 2) {
        setError('Укажите никнейм (минимум 2 символа: латиница, цифры)');
        return;
      }

      if (usernameStatus.available === false) {
        setError(usernameStatus.reason || `Никнейм @${cleanUser} уже занят. Выберите другой.`);
        return;
      }

      setIsLoading(true);

      // Perform a fresh live server check before creating
      const check = await authStore.checkUsernameAvailability(cleanUser);
      if (!check.available) {
        setIsLoading(false);
        setError(check.reason || `Никнейм @${cleanUser} уже зарегистрирован. Пожалуйста, укажите другой никнейм.`);
        return;
      }

      if (!email || !email.includes('@')) {
        setIsLoading(false);
        setError('Введите корректный email адрес');
        return;
      }

      if (!password || password.length < 4) {
        setIsLoading(false);
        setError('Пароль должен содержать минимум 4 символа');
        return;
      }

      try {
        await authStore.register({
          username: cleanUser,
          email: email.trim(),
          password,
          avatar: selectedAvatar,
        });

        setSuccess('Профиль успешно создан! Добро пожаловать.');
        setTimeout(() => {
          setSuccess('');
          setIsLoading(false);
          if (onSuccess) onSuccess();
          if (redirectTo) router.push(redirectTo);
        }, 600);
      } catch (err: any) {
        setIsLoading(false);
        setError(err?.message || 'Пользователь с таким никнеймом или email уже зарегистрирован');
      }
    } else {
      const loginId = username.trim() || email.trim();
      if (!loginId) {
        setError('Введите никнейм или email');
        return;
      }

      if (!password) {
        setError('Введите пароль');
        return;
      }

      setIsLoading(true);
      try {
        await authStore.login(loginId, password);
        setSuccess('Вход выполнен успешно!');
        setTimeout(() => {
          setSuccess('');
          setIsLoading(false);
          if (onSuccess) onSuccess();
          if (redirectTo) router.push(redirectTo);
        }, 600);
      } catch (err: any) {
        setIsLoading(false);
        setError(err?.message || 'Неверный никнейм или пароль');
      }
    }
  };

  const inputClassName = "!bg-zinc-950 !border-zinc-800 !rounded-lg focus-within:!border-zinc-600";

  return (
    <div className="relative w-full max-w-md mx-auto select-none">
      <div className="relative rounded-xl bg-zinc-900 border border-zinc-800 shadow-xl p-6 sm:p-8 space-y-6 overflow-hidden">
        {showCloseButton && onClose && !isGate && (
          <button
            onClick={onClose}
            type="button"
            className="absolute top-5 right-5 p-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-700/50 cursor-pointer z-20"
            title="Закрыть"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold font-sans text-zinc-100 tracking-tight">
            {isGate ? 'Вход обязателен' : mode === 'register' ? 'Создать профиль' : 'С возвращением'}
          </h2>
          <p className="text-sm text-zinc-400 max-w-xs mx-auto leading-relaxed font-sans">
            {mode === 'register'
              ? 'Зарегистрируйтесь для сохранения истории, поиска и создания коллекций'
              : 'Войдите в свой аккаунт для доступа ко всем функциям и поиску'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-lg bg-zinc-950 border border-zinc-800">
          <button
            type="button"
            onClick={() => {
              setError('');
              setMode('register');
            }}
            className={`relative py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              mode === 'register' ? 'text-zinc-950' : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-900/50'
            }`}
          >
            {mode === 'register' && (
              <motion.div
                layoutId="activeAuthTab"
                className="absolute inset-0 bg-zinc-100 rounded-lg shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
              <UserPlus className="w-4 h-4" />
              Регистрация
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setError('');
              setMode('login');
            }}
            className={`relative py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              mode === 'login' ? 'text-zinc-950' : 'text-zinc-400 hover:text-zinc-300 hover:bg-zinc-900/50'
            }`}
          >
            {mode === 'login' && (
              <motion.div
                layoutId="activeAuthTab"
                className="absolute inset-0 bg-zinc-100 rounded-lg shadow-sm"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center gap-2">
              <KeyRound className="w-4 h-4" />
              Вход
            </span>
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm font-sans flex items-center gap-2"
            >
              <X className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-sm font-sans flex items-center gap-2"
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
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <AvatarSelector
                  selectedAvatar={selectedAvatar}
                  onSelect={setSelectedAvatar}
                  nickname={username}
                />

                <div className="space-y-1">
                  <CyberInput
                    label="Уникальный Никнейм (@username)"
                    icon={User}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    className={inputClassName}
                    required
                  />
                  {/* Real-time username validation helper */}
                  {username.trim().length > 0 && (
                    <div className="px-1 text-[11px] font-mono flex items-center justify-between">
                      {usernameStatus.isChecking ? (
                        <span className="text-zinc-400 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 border border-zinc-400 border-t-transparent rounded-full animate-spin" />
                          Проверка...
                        </span>
                      ) : usernameStatus.available === false ? (
                        <span className="text-rose-400 font-semibold flex items-center gap-1">
                          <X className="w-3.5 h-3.5" />
                          {usernameStatus.reason || `Никнейм @${cleanUsername} уже занят`}
                        </span>
                      ) : usernameStatus.available === true ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Никнейм @{cleanUsername} свободен
                        </span>
                      ) : cleanUsername.length < 2 ? (
                        <span className="text-zinc-500">Минимум 2 символа</span>
                      ) : null}
                    </div>
                  )}
                </div>

                <CyberInput
                  label="Email (Приватный)"
                  icon={Mail}
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  className={inputClassName}
                  required
                />

                <div className="space-y-2">
                  <CyberInput
                    label="Пароль"
                    icon={Lock}
                    isPassword
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className={inputClassName}
                    required
                  />

                  {password.length > 0 && (
                    <div className="space-y-1.5 px-1">
                      <div className="flex items-center justify-between text-xs text-zinc-400 font-sans">
                        <span>Надёжность пароля:</span>
                        <span className="font-medium text-zinc-300">{passwordStrength.label}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 h-1.5">
                        {[1, 2, 3, 4].map((step) => (
                          <div
                            key={step}
                            className={`h-full rounded-full transition-colors duration-200 ${
                              step <= passwordStrength.score ? passwordStrength.color : 'bg-zinc-800'
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
                exit={{ opacity: 0, x: 12 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <CyberInput
                  label="Никнейм или Email"
                  icon={User}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                  className={inputClassName}
                  required
                />

                <CyberInput
                  label="Пароль"
                  icon={Lock}
                  isPassword
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  className={inputClassName}
                  required
                />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading || (mode === 'register' && (usernameStatus.available === false || usernameStatus.isChecking))}
            className="w-full py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-900 font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-4"
          >
            <span>{isLoading ? 'Обработка...' : mode === 'register' ? 'Зарегистрироваться' : 'Войти'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-3 border-t border-zinc-800 text-center">
          <p className="text-xs text-zinc-500">
            {mode === 'register'
              ? 'Ваш email строго конфиденциален'
              : 'Вход даёт доступ к плееру 1080p, коллекциям и поиску'}
          </p>
        </div>
      </div>
    </div>
  );
};