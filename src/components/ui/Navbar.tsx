'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Search,
  Film,
  Flame,
  Layers,
  Sparkles,
  User,
  X,
  Menu,
  Star,
  Tv,
  Command,
  ArrowRight,
  LogIn,
  TrendingUp,
  SlidersHorizontal,
  Compass,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authStore, UserProfile } from '@/lib/auth/user-store';
import { searchStore } from '@/lib/search/search-store';
import { AuthModal } from '@/components/auth/AuthModal';

const NAV_LINKS = [
  { href: '/catalog', label: 'Каталог', icon: Film, accent: 'group-hover:text-zinc-100' },
  { href: '/catalog?status=RELEASING', label: 'Онгоинги', icon: Flame, accent: 'group-hover:text-zinc-100' },
  { href: '/collections', label: 'Коллекции', icon: Layers, accent: 'group-hover:text-zinc-100' },
];

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    return authStore.subscribe((u) => setCurrentUser(u));
  }, []);

  const handleOpenSearch = () => {
    searchStore.open();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-zinc-800 bg-zinc-950 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group select-none">
              <span className="text-lg font-bold text-white tracking-tight">
                KuroNami
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative px-3.5 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 flex items-center gap-2 group ${
                      isActive
                        ? 'text-white bg-white/[0.08] shadow-sm'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 transition-colors ${link.accent}`} />
                    <span>{link.label}</span>
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute bottom-0 inset-x-3 h-[2px] bg-white rounded-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Actions: Search Bar & Profile */}
          <div className="flex items-center gap-3">
            {/* Quick Search Trigger Button */}
            <button
              type="button"
              onClick={handleOpenSearch}
              className="flex items-center gap-3 px-3.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 transition-all text-xs cursor-pointer group"
              title="Поиск аниме (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-zinc-300" />
              <span className="hidden sm:inline font-sans">
                Поиск аниме...
              </span>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400 border border-zinc-700">
                <Command className="w-2.5 h-2.5" /> K
              </kbd>
            </button>

            {/* Profile / Auth Button */}
            {currentUser ? (
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href={`/user/${currentUser.username}`}
                  className="flex items-center gap-2.5 p-1 pl-3 pr-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all text-xs font-medium text-white group"
                >
                  <div className="flex flex-col items-end text-right hidden sm:flex">
                    <span className="max-w-[100px] truncate text-xs font-semibold leading-tight">{currentUser.name}</span>
                    <span className="text-[9px] font-mono text-zinc-400 leading-tight">LVL {currentUser.level || 1}</span>
                  </div>
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900 transition-colors">
                    <Image src={currentUser.avatar} alt={currentUser.name} fill className="object-cover" />
                  </div>
                </Link>
              </motion.div>
            ) : (
              <motion.button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-900 text-xs font-medium transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Войти</span>
              </motion.button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Открыть мобильное меню"
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="md:hidden border-t border-zinc-800 bg-zinc-950 px-4 py-4 space-y-2 overflow-hidden"
            >
              {/* Search in Mobile Drawer */}
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    searchStore.open();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-sm text-zinc-200"
                >
                  <div className="flex items-center gap-3">
                    <Search className="w-4 h-4 text-zinc-100" />
                    <span className="font-semibold">Поиск аниме</span>
                  </div>
                  <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400 border border-zinc-700">
                    Ctrl+K
                  </kbd>
                </button>
              </motion.div>
              {NAV_LINKS.map((link, i) => {
                const Icon = link.icon;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-sm text-zinc-200"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-zinc-100" />
                        <span className="font-semibold">{link.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                    </Link>
                  </motion.div>
                );
              })}
              
              <motion.div
                initial={{ x: -10, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: NAV_LINKS.length * 0.05 }}
              >
                <Link
                  href={currentUser ? `/user/${currentUser.username}` : '#'}
                  onClick={(e) => {
                    setIsMobileMenuOpen(false);
                    if (!currentUser) {
                      e.preventDefault();
                      setIsAuthModalOpen(true);
                    }
                  }}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-sm text-zinc-200"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-zinc-100" />
                    <span className="font-semibold">Личный профиль</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};
