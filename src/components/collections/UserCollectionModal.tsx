'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Play,
  Info,
  Star,
  Search,
  Plus,
  Trash2,
  Globe,
  Lock,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { authStore, UserCollection } from '@/lib/auth/user-store';
import { modalVariants } from '@/lib/motion-presets';
import { BatchAnimeItem } from '@/app/api/anime/batch/route';
import { getRussianGenre } from '@/components/catalog/catalog-data';

interface UserCollectionModalProps {
  collection: UserCollection | null;
  onClose: () => void;
  onDeleted?: () => void;
}

export const UserCollectionModal: React.FC<UserCollectionModalProps> = ({
  collection,
  onClose,
  onDeleted,
}) => {
  const [mounted, setMounted] = useState(false);
  const [animeMap, setAnimeMap] = useState<Record<number, BatchAnimeItem>>({});
  const [isLoadingAnime, setIsLoadingAnime] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (collection) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [collection, onClose]);

  // Search anime to add
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const currentUser = authStore.getUser();
  const isOwner = currentUser && collection ? currentUser.id === collection.userId : true;

  // Load anime metadata for IDs in this collection
  useEffect(() => {
    if (!collection || collection.animeIds.length === 0) {
      setAnimeMap({});
      return;
    }

    let isMounted = true;
    setIsLoadingAnime(true);

    fetch('/api/anime/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: collection.animeIds }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.items) {
          setAnimeMap(data.items);
        }
      })
      .catch((err) => console.error('Error fetching collection anime:', err))
      .finally(() => {
        if (isMounted) setIsLoadingAnime(false);
      });

    return () => {
      isMounted = false;
    };
  }, [collection?.animeIds]);

  // Live search for adding anime
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/anime/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        setSearchResults(data.results || []);
        setShowSearchDropdown(true);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside search
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2200);
  };

  if (!collection) return null;

  const handleAddAnime = (anime: any) => {
    authStore.addAnimeToCollection(collection.id, anime.id);
    // Update local cache
    setAnimeMap((prev) => ({
      ...prev,
      [anime.id]: {
        id: anime.id,
        title: {
          russian: anime.title?.russian || anime.title?.romaji || anime.title?.english,
          english: anime.title?.english,
          romaji: anime.title?.romaji,
        },
        format: anime.format || 'TV',
        seasonYear: anime.seasonYear,
        score: anime.averageScore ? anime.averageScore / 10 : undefined,
        coverImage: {
          original: anime.coverImage?.extraLarge || anime.coverImage?.large || anime.coverImage?.medium || '',
          medium: anime.coverImage?.medium || '',
        },
        genres: anime.genres || [],
      },
    }));

    setSearchQuery('');
    setShowSearchDropdown(false);
    showToast(`Тайтл «${anime.title?.russian || anime.title?.romaji || ''}» добавлен в коллекцию! ✨`);
  };

  const handleRemoveAnime = (animeId: number) => {
    authStore.removeAnimeFromCollection(collection.id, animeId);
    showToast('Тайтл удален из коллекции');
  };

  const handleDeleteCollection = () => {
    if (confirm(`Вы уверены, что хотите удалить коллекцию «${collection.title}»?`)) {
      authStore.deleteCollection(collection.id);
      onClose();
      if (onDeleted) onDeleted();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {collection && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

        {/* Modal Window */}
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-4xl rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden z-10 my-6 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="relative p-5 sm:p-6 bg-zinc-900 border-b border-zinc-800 shrink-0 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                    Коллекция пользователя
                  </span>
                  {collection.isPublic ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      <Globe className="w-3 h-3" />
                      <span>Публичная</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-400 border border-zinc-700">
                      <Lock className="w-3 h-3" />
                      <span>Приватная</span>
                    </span>
                  )}
                  <span className="text-xs font-mono text-zinc-400">
                    {collection.animeIds.length} тайтлов
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">
                  {collection.title}
                </h2>

                {collection.description && (
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {collection.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {isOwner && (
                  <button
                    type="button"
                    onClick={handleDeleteCollection}
                    className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors cursor-pointer"
                    title="Удалить коллекцию"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Live Search to Add Anime */}
            {isOwner && (
              <div className="relative pt-2" ref={searchContainerRef}>
                <div className="relative flex items-center bg-zinc-950 border border-zinc-800 focus-within:border-zinc-600 rounded-lg">
                  <Search className="w-4 h-4 text-zinc-500 ml-3 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => {
                      if (searchResults.length > 0) setShowSearchDropdown(true);
                    }}
                    placeholder="Найти аниме и добавить в коллекцию..."
                    className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="p-1 text-zinc-500 hover:text-zinc-300 mr-2"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Search Results Dropdown */}
                {showSearchDropdown && searchResults.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl z-50 max-h-60 overflow-y-auto p-1.5 space-y-1">
                    <div className="px-2 py-1 text-[10px] font-mono text-zinc-500 uppercase">
                      Результаты поиска
                    </div>
                    {searchResults.map((anime) => {
                      const isAlreadyIn = collection.animeIds.includes(anime.id);
                      const title = anime.title?.russian || anime.title?.romaji || anime.title?.english;
                      return (
                        <div
                          key={anime.id}
                          className="flex items-center justify-between p-2 rounded-md hover:bg-zinc-800/70 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="relative w-8 h-11 rounded bg-zinc-950 overflow-hidden shrink-0">
                              {anime.coverImage?.medium && (
                                <Image
                                  src={anime.coverImage.medium}
                                  alt={title || ''}
                                  fill
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-zinc-100 truncate">
                                {title}
                              </div>
                              <div className="text-[10px] text-zinc-400 font-mono">
                                {anime.format || 'TV'} {anime.seasonYear ? `• ${anime.seasonYear}` : ''}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={isAlreadyIn}
                            onClick={() => handleAddAnime(anime)}
                            className={`px-3 py-1 rounded text-xs font-semibold shrink-0 transition-colors cursor-pointer ${
                              isAlreadyIn
                                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                : 'bg-white text-zinc-900 hover:bg-zinc-200'
                            }`}
                          >
                            {isAlreadyIn ? 'Уже добавлен' : '+ Добавить'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Toast Alert */}
          {toastMessage && (
            <div className="mx-6 mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-600 text-xs text-zinc-200">
              <Sparkles className="w-3.5 h-3.5 text-zinc-300 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Anime List Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar space-y-4">
            {collection.animeIds.length === 0 ? (
              <div className="py-16 text-center text-zinc-500 text-xs font-mono space-y-3">
                <Layers className="w-8 h-8 text-zinc-600 mx-auto" />
                <p>В этой коллекции пока нет тайтлов</p>
                {isOwner && (
                  <p className="text-zinc-400">
                    Используйте поиск выше, чтобы добавить аниме в коллекцию
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {collection.animeIds.map((animeId) => {
                  const anime = animeMap[animeId];
                  const title = anime?.title?.russian || anime?.title?.romaji || anime?.title?.english || `Аниме #${animeId}`;
                  const cover = anime?.coverImage?.original || anime?.coverImage?.medium;

                  return (
                    <div
                      key={animeId}
                      className="group relative rounded-xl bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 p-3 flex gap-3 transition-all hover:bg-zinc-900"
                    >
                      {/* Poster */}
                      <div className="relative w-18 sm:w-20 aspect-[3/4] rounded-lg overflow-hidden shrink-0 bg-zinc-950 border border-zinc-800">
                        {cover ? (
                          <Image
                            src={cover}
                            alt={title}
                            fill
                            sizes="80px"
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-mono text-xs text-zinc-600">
                            #{animeId}
                          </div>
                        )}
                        {anime?.score && (
                          <div className="absolute top-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[9px] font-mono font-bold text-zinc-200 flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-zinc-200 text-zinc-200" />
                            <span>{anime.score.toFixed(1)}</span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between space-y-1.5">
                        <div>
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                            <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-semibold">
                              {anime?.format || 'TV'}
                            </span>
                            {anime?.seasonYear && <span>• {anime.seasonYear} г.</span>}
                            {anime?.episodesTotal && <span>• {anime.episodesTotal} эп.</span>}
                          </div>

                          <h4 className="text-xs sm:text-sm font-bold text-zinc-100 line-clamp-1 group-hover:text-white transition-colors pt-0.5">
                            {title}
                          </h4>

                          {anime?.genres && anime.genres.length > 0 && (
                            <div className="flex items-center gap-1 flex-wrap pt-1">
                              {anime.genres.slice(0, 2).map((g) => (
                                <span
                                  key={g}
                                  className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-zinc-800/80 text-zinc-400"
                                >
                                  {getRussianGenre(g)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/60">
                          <div className="flex items-center gap-1.5">
                            <Link
                              href={`/watch/${animeId}/1`}
                              onClick={onClose}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Смотреть</span>
                            </Link>
                            <Link
                              href={`/anime/${animeId}`}
                              onClick={onClose}
                              className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                              title="Страница тайтла"
                            >
                              <Info className="w-3.5 h-3.5" />
                            </Link>
                          </div>

                          {isOwner && (
                            <button
                              type="button"
                              onClick={() => handleRemoveAnime(animeId)}
                              className="p-1 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Удалить из коллекции"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
