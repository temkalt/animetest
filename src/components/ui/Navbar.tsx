'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Search, Film, Calendar, Bookmark, User, Play, X, Sparkles, Flame, LogOut, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authStore, UserProfile } from '@/lib/auth/user-store';
import { AuthModal } from '@/components/auth/AuthModal';

export const Navbar: React.FC = () => {
  const router = useRouter();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
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

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/5 bg-[#07080B]/80 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5 shadow-[0_0_20px_rgba(139,92,246,0.4)] group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-[#07080B] rounded-[10px] flex items-center justify-center">
                  <Play className="w-4 h-4 text-violet-400 fill-violet-400 ml-0.5" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-bold tracking-wider font-display bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-violet-400">
                  KURONAMI
                </span>
                <span className="text-[9px] font-mono tracking-widest text-cyan-400 uppercase -mt-1 font-semibold">
                  NEXUS STREAM
                </span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/catalog" className="text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors">
                <Film className="w-4 h-4 text-violet-400" />
                <span>Каталог</span>
              </Link>
              <Link href="/catalog?status=RELEASING" className="text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors">
                <Flame className="w-4 h-4 text-rose-400" />
                <span>Онгоинги</span>
              </Link>
              <Link href="/collections" className="text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Коллекции</span>
              </Link>
            </nav>
          </div>

          {/* Search Trigger & User Profile */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white text-xs font-mono transition-all shadow-inner"
            >
              <Search className="w-3.5 h-3.5 text-violet-400" />
              <span className="hidden sm:inline">Поиск аниме...</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-white/10 rounded border border-white/10 text-slate-300">
                Ctrl K
              </kbd>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 p-1 pl-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors group"
                >
                  <span className="text-xs font-bold font-mono text-white hidden sm:inline">
                    {currentUser.name}
                  </span>
                  <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-violet-500/50">
                    <Image
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </Link>
                <button
                  onClick={() => authStore.logout()}
                  title="Выйти"
                  className="p-2 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-display font-semibold text-xs shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Войти / Регистрация</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {/* Global Quick Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl rounded-2xl bg-[#0E1017] border border-white/15 shadow-[0_24px_50px_rgba(0,0,0,0.9)] overflow-hidden z-10"
            >
              {/* Search Bar Input */}
              <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
                <Search className="w-5 h-5 text-violet-400 flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Введите название тайтла (на русском, английском или ромадзи)..."
                  className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none font-sans"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Instant Results */}
              <div className="max-h-96 overflow-y-auto p-2 divide-y divide-white/5">
                {isLoading && (
                  <div className="py-8 text-center text-xs font-mono text-slate-400">
                    <div className="inline-block w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-2" />
                    <div>Поиск по вселенной аниме...</div>
                  </div>
                )}

                {!isLoading && searchResults.length > 0 && (
                  <div className="space-y-1">
                    {searchResults.map((item) => (
                      <Link
                        key={item.id}
                        href={`/anime/${item.id}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                      >
                        <div className="relative w-11 h-15 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                          {item.coverImage?.medium && (
                            <Image
                              src={item.coverImage.medium}
                              alt={item.title.romaji}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white group-hover:text-violet-400 transition-colors truncate">
                            {item.title.russian || item.title.english || item.title.romaji}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                            <span>{item.format || 'TV'}</span>
                            {item.seasonYear && <span>• {item.seasonYear}</span>}
                            {item.averageScore && (
                              <span className="text-amber-400 font-bold">
                                ★ {(item.averageScore / 10).toFixed(1)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {!isLoading && searchQuery.length >= 2 && searchResults.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400 font-mono">
                    Ничего не найдено по запросу «{searchQuery}»
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
