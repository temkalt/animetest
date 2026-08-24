'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, TrendingUp, Star, ArrowRight, Loader2 } from 'lucide-react';
import { searchStore } from '@/lib/search/search-store';
import { getRussianGenre } from '@/components/catalog/catalog-data';

const POPULAR_SEARCH_TAGS = [
  'Атака титанов',
  'Магическая битва',
  'Клинок рассекающий демонов',
  'Человек-бензопила',
  'Соло Левелинг',
  'Фрирен',
  'Блич',
  'Дандадан',
];

export const SearchModal: React.FC = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    return searchStore.subscribe((open) => {
      setIsOpen(open);
    });
  }, []);

  // Keyboard shortcut Ctrl+K / Cmd+K and Esc & Custom Events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchStore.toggle();
      }
      if (e.key === 'Escape' && searchStore.isOpen()) {
        e.preventDefault();
        searchStore.close();
      }
    };

    const handleOpen = () => {
      searchStore.open();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-search-modal', handleOpen);
    window.addEventListener('kuronami:open-search', handleOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-search-modal', handleOpen);
      window.removeEventListener('kuronami:open-search', handleOpen);
    };
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Live search debounced fetch
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/anime/search?q=${encodeURIComponent(q)}`);
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

  const handleClose = () => {
    searchStore.close();
  };

  const handleSelectResult = (animeId: number) => {
    handleClose();
    setSearchQuery('');
    router.push(`/anime/${animeId}`);
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
  };

  if (!mounted || typeof document === 'undefined' || !document.body) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-[999999] flex items-start justify-center p-3 sm:p-4 pt-12 sm:pt-20 overscroll-contain"
          onWheel={(e) => e.stopPropagation()}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -16 }}
            transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative z-10 w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden flex flex-col max-h-[82vh] shadow-2xl"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 sm:px-5 py-4 border-b border-zinc-800 bg-zinc-950">
              <Search className="w-5 h-5 text-zinc-400 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск аниме по русскому или английскому названию..."
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none font-sans font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={handleClose}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-[11px] font-mono text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors cursor-pointer"
              >
                ESC
              </button>
            </div>

            {/* Popular Search Suggestions (when empty query) */}
            {!searchQuery && (
              <div className="p-4 sm:p-5 border-b border-zinc-800/80 bg-zinc-900/60">
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
                      className="px-3 py-1 rounded-lg bg-zinc-800/90 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/80 text-xs transition-all cursor-pointer"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Search Results List */}
            <div
              className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin bg-zinc-950 overscroll-contain min-h-[140px]"
              onWheel={(e) => e.stopPropagation()}
            >
              {isLoading ? (
                <div className="py-16 text-center text-xs text-zinc-400 font-mono flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-6 h-6 animate-spin text-zinc-300" />
                  <span>Поиск по каталогу аниме...</span>
                </div>
              ) : searchResults.length > 0 ? (
                searchResults.map((item) => {
                  const title = item.title?.russian || item.title?.english || item.title?.romaji || 'Аниме';
                  const subTitle = item.title?.english || item.title?.romaji || '';
                  const cover =
                    item.coverImage?.original ||
                    item.coverImage?.large ||
                    item.coverImage?.medium ||
                    item.cover;
                  const score =
                    typeof item.score === 'number' && item.score > 0
                      ? item.score
                      : item.averageScore
                      ? item.averageScore / 10
                      : 0;

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => handleSelectResult(item.id)}
                      className="flex items-center gap-3.5 p-2.5 rounded-xl hover:bg-zinc-900 border border-transparent hover:border-zinc-800 cursor-pointer transition-all group"
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
                  <p>Начните вводить название тайтла на русском или английском</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
