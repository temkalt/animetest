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
import { AuthModal } from '@/components/auth/AuthModal';
import { modalVariants } from '@/lib/motion-presets';
import { getRussianGenre } from '@/components/catalog/catalog-data';

const NAV_LINKS = [
  { href: '/catalog', label: 'Каталог', icon: Film, accent: 'group-hover:text-zinc-100' },
  { href: '/catalog?status=RELEASING', label: 'Онгоинги', icon: Flame, accent: 'group-hover:text-zinc-100' },
  { href: '/collections', label: 'Коллекции', icon: Layers, accent: 'group-hover:text-zinc-100' },
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

  const mounted = React.useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  useEffect(() => {
    return authStore.subscribe((u) => setCurrentUser(u));
  }, []);

  // Lock background scroll when search modal is open
  useEffect(() => {
    if (isSearchOpen) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }

      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isSearchOpen]);

  const handleOpenSearch = () => {
    setIsSearchOpen(true);
  };

  // Keyboard shortcut Ctrl+K / Cmd+K and Global Custom Event
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

    const handleOpenSearchModal = () => {
      setIsSearchOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-search-modal', handleOpenSearchModal);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-search-modal', handleOpenSearchModal);
    };
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/anime/search?q=${encodeURIComponent(searchQuery.trim())}`);
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

      {/* Global Interactive Search Modal (Cmd+K) */}
      <AnimatePresence>
        {mounted && isSearchOpen && createPortal(
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setIsSearchOpen(false);
              }
            }}
            className="fixed inset-0 z-[9999] bg-zinc-950/80 backdrop-blur-sm flex items-start justify-center p-4 pt-12 sm:pt-20 overscroll-contain"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -12 }}
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden flex flex-col max-h-[82vh] shadow-2xl"
            >
              {/* Search Bar Input */}
              <div className="flex items-center gap-3.5 px-5 py-4 border-b border-zinc-800 bg-zinc-950">
                <Search className="w-5 h-5 text-zinc-400 flex-shrink-0" />
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
                    className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <kbd className="px-2 py-0.5 rounded-lg bg-zinc-800 text-[10px] font-mono text-zinc-400 border border-zinc-700 cursor-pointer" onClick={() => setIsSearchOpen(false)}>
                  ESC
                </kbd>
              </div>

              {/* Popular Search Suggestions (when empty query) */}
              {!searchQuery && (
                <div className="p-5 border-b border-zinc-800 bg-zinc-900">
                  <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-3">
                    <TrendingUp className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Часто ищут:</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {POPULAR_SEARCH_TAGS.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagClick(tag)}
                        className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 text-xs transition-all cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results List */}
              <div 
                className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin bg-zinc-950 overscroll-contain"
                onWheel={(e) => e.stopPropagation()}
              >
                {isLoading ? (
                  <div className="py-16 text-center text-xs text-zinc-400 font-mono">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <span>Поиск по базе аниме...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((item) => {
                    const title = item.title?.russian || item.title?.english || item.title?.romaji || 'Аниме';
                    const subTitle = item.title?.english || item.title?.romaji || '';
                    const cover = item.coverImage?.original || item.coverImage?.large || item.coverImage?.medium || item.cover;
                    const score = typeof item.score === 'number' && item.score > 0
                      ? item.score
                      : item.averageScore
                      ? item.averageScore / 10
                      : 0;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.01 }}
                        onClick={() => handleSelectResult(item.id)}
                        className="flex items-center gap-3.5 p-2.5 rounded-lg hover:bg-zinc-900 border border-transparent hover:border-zinc-800 cursor-pointer transition-all group"
                      >
                        {/* Poster Thumbnail */}
                        <div className="relative w-12 h-16 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0">
                          {cover ? (
                            <Image
                              src={cover}
                              alt={title}
                              fill
                              sizes="48px"
                              className="object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-mono text-[10px] text-zinc-600">
                              #{item.id}
                            </div>
                          )}
                        </div>

                        {/* Title & Metadata */}
                        <div className="flex-1 min-w-0 space-y-0.5">
                          <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-zinc-200 transition-colors truncate">
                            {title}
                          </h4>
                          {subTitle && subTitle !== title && (
                            <p className="text-[10px] sm:text-[11px] text-zinc-500 truncate font-sans">
                              {subTitle}
                            </p>
                          )}
                          <div className="flex items-center gap-2 text-[10px] sm:text-[11px] text-zinc-400 font-mono pt-0.5">
                            {score > 0 && (
                              <span className="flex items-center gap-0.5 text-zinc-200 font-bold">
                                <Star className="w-3 h-3 fill-zinc-200 text-zinc-200" />
                                {score.toFixed(1)}
                              </span>
                            )}
                            <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-bold">
                              {item.format || 'TV'}
                            </span>
                            {item.seasonYear && <span>• {item.seasonYear} г.</span>}
                            {item.genres && item.genres.length > 0 && (
                              <span className="truncate text-zinc-500 hidden sm:inline">
                                • {item.genres.slice(0, 2).map((g: string) => getRussianGenre(g)).join(', ')}
                              </span>
                            )}
                          </div>
                        </div>

                        <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-1 transition-all shrink-0" />
                      </motion.div>
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
          </motion.div>,
          document.body
        )}
      </AnimatePresence>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};
