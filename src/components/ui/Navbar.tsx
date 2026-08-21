'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Search,
  Film,
  Calendar,
  Layers,
  User,
  X,
  Flame,
  Menu,
  Star,
  Tv,
  Command,
  ArrowRight,
  LogIn,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authStore, UserProfile } from '@/lib/auth/user-store';
import { AuthModal } from '@/components/auth/AuthModal';
import { modalVariants } from '@/lib/motion-presets';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return authStore.subscribe((u) => setCurrentUser(u));
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/anime/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch {
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectResult = (animeId: number) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    router.push(`/anime/${animeId}`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#08090D]/85 backdrop-blur-2xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group">
              {/* Bespoke Geometric Logo Icon */}
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-cyan-500 p-[1px] shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#090A0F] rounded-[11px] flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                    <path
                      d="M4 14C8 10 12 18 16 12C18 9 20 10 20 10"
                      stroke="url(#logo-grad-1)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M7 7L17 17M17 7L7 17"
                      stroke="url(#logo-grad-2)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      opacity="0.4"
                    />
                    <circle cx="17" cy="7" r="2.5" fill="#06B6D4" />
                    <defs>
                      <linearGradient id="logo-grad-1" x1="4" y1="10" x2="20" y2="18" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#818CF8" />
                        <stop offset="1" stopColor="#06B6D4" />
                      </linearGradient>
                      <linearGradient id="logo-grad-2" x1="7" y1="7" x2="17" y2="17" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#6366F1" />
                        <stop offset="1" stopColor="#A855F7" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Brand Wordmark */}
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-extrabold tracking-wider font-display bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-300">
                  KURONAMI
                </span>
                <span className="text-[9px] font-mono tracking-widest text-indigo-400 uppercase -mt-1 font-semibold">
                  STREAM & ARCHIVE
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold tracking-wide">
              <Link
                href="/catalog"
                className="text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors py-1 hover:border-b border-indigo-500/60"
              >
                <Film className="w-3.5 h-3.5 text-indigo-400" />
                <span>Каталог</span>
              </Link>
              <Link
                href="/catalog?status=RELEASING"
                className="text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors py-1 hover:border-b border-rose-500/60"
              >
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                <span>Онгоинги</span>
              </Link>
              <Link
                href="/collections"
                className="text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors py-1 hover:border-b border-cyan-500/60"
              >
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Коллекции</span>
              </Link>
            </nav>
          </div>

          {/* Right Actions: Search Bar & Profile */}
          <div className="flex items-center gap-3">
            {/* Quick Search Trigger Button */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-[#0F1117] hover:bg-[#151822] border border-white/[0.08] hover:border-indigo-500/30 text-zinc-400 hover:text-zinc-200 transition-all text-xs cursor-pointer shadow-sm"
            >
              <Search className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden sm:inline">Поиск аниме...</span>
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] font-mono text-zinc-400 border border-white/[0.05]">
                <Command className="w-2.5 h-2.5" /> K
              </kbd>
            </button>

            {/* Profile / Auth Button */}
            {currentUser ? (
              <Link
                href="/profile"
                className="flex items-center gap-2 p-1 pl-2.5 pr-1.5 rounded-xl bg-[#0F1117] border border-white/[0.08] hover:border-indigo-500/40 transition-all text-xs font-medium text-white group"
              >
                <span className="max-w-[100px] truncate hidden sm:inline">{currentUser.name}</span>
                <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-indigo-500/40 bg-zinc-800">
                  <Image src={currentUser.avatar} alt={currentUser.name} fill className="object-cover" />
                </div>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Войти</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="md:hidden flex items-center justify-center w-8 h-8 rounded-xl bg-[#0F1117] border border-white/[0.08] text-zinc-300"
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
              className="md:hidden border-t border-white/[0.06] bg-[#090A0F] px-4 py-4 space-y-3"
            >
              <Link
                href="/catalog"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] text-sm text-zinc-200"
              >
                <div className="flex items-center gap-2.5">
                  <Film className="w-4 h-4 text-indigo-400" />
                  <span>Полный каталог</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              </Link>

              <Link
                href="/catalog?status=RELEASING"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] text-sm text-zinc-200"
              >
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>Онгоинги сезона</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              </Link>

              <Link
                href="/collections"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] text-sm text-zinc-200"
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span>Тематические коллекции</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Global Interactive Search Modal (Cmd+K) */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-start justify-center p-4 pt-16 sm:pt-24">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-xl bg-[#0E1118] border border-white/[0.1] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              {/* Search Bar Input */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] bg-[#090A0E]">
                <Search className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Поиск по названию, студии, жанру..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none font-sans"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-zinc-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <kbd className="px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] font-mono text-zinc-400 border border-white/[0.06]">
                  ESC
                </kbd>
              </div>

              {/* Search Results List */}
              <div className="flex-1 overflow-y-auto p-2 divide-y divide-white/[0.04] scrollbar-thin">
                {isLoading ? (
                  <div className="p-8 text-center text-xs text-zinc-400 font-mono">
                    <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Поиск по базе аниме...
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((item) => {
                    const title = item.title.russian || item.title.english || item.title.romaji;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectResult(item.id)}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.05] cursor-pointer transition-all group"
                      >
                        <div className="relative w-10 h-14 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
                          {item.coverImage?.original && (
                            <Image src={item.coverImage.original} alt={title} fill className="object-cover" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                            {title}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono mt-0.5">
                            {item.score > 0 && (
                              <span className="flex items-center gap-0.5 text-amber-400">
                                <Star className="w-3 h-3 fill-amber-400" />
                                {item.score.toFixed(1)}
                              </span>
                            )}
                            <span>{item.format || 'TV'}</span>
                            <span>•</span>
                            <span className="truncate">{item.genres?.slice(0, 2).join(', ')}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    );
                  })
                ) : searchQuery.trim().length >= 2 ? (
                  <div className="p-8 text-center text-xs text-zinc-500 font-mono">
                    Ничего не найдено по запросу «{searchQuery}»
                  </div>
                ) : (
                  <div className="p-6 text-center text-xs text-zinc-500 font-mono space-y-1">
                    <p>Начните вводить название аниме</p>
                    <p className="text-[10px] text-zinc-600">Например: «Атака титанов», «Магическая битва»</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};
