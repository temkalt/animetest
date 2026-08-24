'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  Film,
  Layers,
  Search,
  User,
  LogIn,
} from 'lucide-react';
import { authStore, UserProfile } from '@/lib/auth/user-store';
import { AuthModal } from '@/components/auth/AuthModal';

export const MobileBottomNav: React.FC = () => {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    return authStore.subscribe((u) => setCurrentUser(u));
  }, []);

  const NAV_ITEMS = [
    { href: '/', label: 'Главная', icon: Home },
    { href: '/catalog', label: 'Каталог', icon: Film },
    {
      href: '#search',
      label: 'Поиск',
      icon: Search,
      isAction: true,
      onClick: () => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('open-search-modal'));
        }
      },
    },
    { href: '/collections', label: 'Подборки', icon: Layers },
    {
      href: currentUser ? `/user/${currentUser.username}` : '#',
      label: currentUser ? 'Профиль' : 'Войти',
      icon: currentUser ? User : LogIn,
      isAuth: !currentUser,
    },
  ];

  return (
    <>
      <nav
        aria-label="Мобильная навигация"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-800/80 px-2 py-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] select-none"
      >
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href) && item.href !== '#';

            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  if (item.isAction && item.onClick) {
                    e.preventDefault();
                    item.onClick();
                  } else if (item.isAuth) {
                    e.preventDefault();
                    setIsAuthOpen(true);
                  }
                }}
                className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all duration-200 ${
                  isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="mobileNavActivePill"
                    className="absolute -top-1 w-8 h-1 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.6)]"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <div className={`p-1 rounded-lg ${isActive ? 'bg-zinc-800/80' : ''}`}>
                  <Icon className={`w-5 h-5 transition-transform active:scale-90 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                </div>
                <span className={`text-[10px] font-medium tracking-tight mt-0.5 ${isActive ? 'text-white font-semibold' : 'text-zinc-400'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};
