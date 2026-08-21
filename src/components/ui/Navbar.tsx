'use client';

import React, { useState, useEffect, useRef } from 'react';
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
import { AuthModal } from '@/components/auth/AuthModal';
import { modalVariants } from '@/lib/motion-presets';

const NAV_LINKS = [
  { href: '/catalog', label: 'Каталог', icon: Film, accent: 'group-hover:text-indigo-400' },
  { href: '/catalog?status=RELEASING', label: 'Онгоинги', icon: Flame, accent: 'group-hover:text-rose-400' },
  { href: '/collections', label: 'Коллекции', icon: Layers, accent: 'group-hover:text-cyan-400' },
];

const POPULAR_SEARCH_TAGS = [
  'Атака титанов',
  'Магическая битва',
  'Клинок рассекающий демонов',
  'Человек-бензопила',
  'Соло Левелинг',
  'Фрирен',
];

export const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
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
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectResult = (animeId: number) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    router.push(`/anime/${animeId}`);
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/[0.07] bg-[#06070A]/80 backdrop-blur-2xl transition-all shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo & Main Nav */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-3 group select-none">
              {/* Bespoke Geometric Logo Icon */}
              <div className="relative w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300">
                <div className="w-full h-full bg-[#090C14] rounded-[15px] flex items-center justify-center overflow-hidden">
                  <svg viewBox="0 0 24 24" className="w-5 h-5 transition-transform duration-500 group-hover:scale-110" fill="none">
                    <path
                      d="M4 14C8 10 12 18 16 12C18 9 20 10 20 10"
                      stroke="url(#nav-logo-1)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M7 7L17 17M17 7L7 17"
                      stroke="url(#nav-logo-2)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      opacity="0.5"
                    />
                    <circle cx="17" cy="7" r="2.5" fill="#06B6D4" />
                    <defs>
                      <linearGradient id="nav-logo-1" x1="4" y1="10" x2="20" y2="18" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#818CF8" />
                        <stop offset="1" stopColor="#06B6D4" />
                      </linearGradient>
                      <linearGradient id="nav-logo-2" x1="7" y1="7" x2="17" y2="17" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#6366F1" />
                        <stop offset="1" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Brand Wordmark */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base sm:text-lg font-black tracking-widest font-display text-white">
                    KURONAMI
                  </span>
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#06B6D4]" />
                </div>
                <span className="text-[9px] font-mono tracking-[0.2em] text-indigo-400 uppercase -mt-1 font-semibold">
                  NEXUS STREAMING
                </span>
              </div>
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
                        className="absolute bottom-0 inset-x-3 h-[2px] bg-gradient-to-r from-indigo-500 to-cyan-400 rounded-full"
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
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
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-3 px-3.5 py-2 rounded-xl bg-[#0F131D] hover:bg-[#161B29] border border-white/[0.08] hover:border-indigo-500/40 text-zinc-400 hover:text-zinc-200 transition-all text-xs cursor-pointer shadow-sm group"
            >
              <Search className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline font-sans">Поиск аниме...</span>
              <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/[0.06] text-[10px] font-mono text-zinc-400 border border-white/[0.06]">
                <Command className="w-2.5 h-2.5" /> K
              </kbd>
            </button>

            {/* Profile / Auth Button */}
            {currentUser ? (
              <Link
                href="/profile"
                className="flex items-center gap-2.5 p-1 pl-3 pr-1.5 rounded-2xl bg-[#0F131D] border border-white/[0.08] hover:border-indigo-500/50 hover:bg-[#161B29] transition-all text-xs font-medium text-white group shadow-sm"
              >
                <div className="flex flex-col items-end text-right hidden sm:flex">
                  <span className="max-w-[100px] truncate text-xs font-semibold leading-tight">{currentUser.name}</span>
                  <span className="text-[9px] font-mono text-indigo-400 leading-tight">LVL {currentUser.level || 1}</span>
                </div>
                <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-indigo-500/40 bg-zinc-900 group-hover:border-cyan-400 transition-colors">
                  <Image src={currentUser.avatar} alt={currentUser.name} fill className="object-cover" />
                </div>
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Войти</span>
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              aria-label="Открыть мобильное меню"
              className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl bg-[#0F131D] border border-white/[0.08] text-zinc-300 hover:text-white"
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
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-white/[0.07] bg-[#07090F]/95 backdrop-blur-2xl px-4 py-4 space-y-2 overflow-hidden shadow-2xl"
            >
              {NAV_LINKS.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-sm text-zinc-200"
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-indigo-400" />
                      <span className="font-semibold">{link.label}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-500" />
                  </Link>
                );
              })}
              
              <Link
                href="/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-sm text-zinc-200"
              >
                <div className="flex items-center gap-3">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span className="font-semibold">Личный профиль</span>
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
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xl flex items-start justify-center p-4 pt-12 sm:pt-20">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="w-full max-w-2xl bg-[#0B0E17] border border-white/[0.12] rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[82vh]"
            >
              {/* Search Bar Input */}
              <div className="flex items-center gap-3.5 px-5 py-4 border-b border-white/[0.08] bg-[#07090F]">
                <Search className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Поиск аниме по русскому или английскому названию..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent text-sm text-white placeholder-zinc-500 focus:outline-none font-sans font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/[0.06]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <kbd className="px-2 py-0.5 rounded-lg bg-white/[0.06] text-[10px] font-mono text-zinc-400 border border-white/[0.06] cursor-pointer" onClick={() => setIsSearchOpen(false)}>
                  ESC
                </kbd>
              </div>

              {/* Popular Search Suggestions (when empty query) */}
              {!searchQuery && (
                <div className="p-5 border-b border-white/[0.05] bg-[#090C15]/50">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-3">
                    <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                    <span>Часто ищут:</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {POPULAR_SEARCH_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagClick(tag)}
                        className="px-3 py-1 rounded-xl bg-white/[0.04] hover:bg-indigo-600/20 text-zinc-300 hover:text-indigo-300 border border-white/[0.06] hover:border-indigo-500/40 text-xs transition-all cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin">
                {isLoading ? (
                  <div className="py-16 text-center text-xs text-zinc-400 font-mono">
                    <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <span>Поиск по базе аниме...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((item) => {
                    const title = item.title.russian || item.title.english || item.title.romaji;
                    return (
                      <div
                        key={item.id}
                        onClick={() => handleSelectResult(item.id)}
                        className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-white/[0.06] border border-transparent hover:border-white/[0.08] cursor-pointer transition-all group"
                      >
                        <div className="relative w-12 h-16 rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0 shadow-md">
                          {item.coverImage?.original && (
                            <Image src={item.coverImage.original} alt={title} fill className="object-cover group-hover:scale-105 transition-transform" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                            {title}
                          </h4>
                          <div className="flex items-center gap-2.5 text-[11px] text-zinc-400 font-mono">
                            {item.score > 0 && (
                              <span className="flex items-center gap-1 text-amber-400 font-bold">
                                <Star className="w-3 h-3 fill-amber-400" />
                                {item.score.toFixed(1)}
                              </span>
                            )}
                            <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                              {item.format || 'TV'}
                            </span>
                            <span className="truncate text-zinc-400">{item.genres?.slice(0, 3).join(', ')}</span>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    );
                  })
                ) : searchQuery.trim().length >= 2 ? (
                  <div className="py-16 text-center text-xs text-zinc-500 font-mono">
                    Ничего не найдено по запросу «{searchQuery}»
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-zinc-500 font-mono space-y-1">
                    <p>Начните вводить название тайтла</p>
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
