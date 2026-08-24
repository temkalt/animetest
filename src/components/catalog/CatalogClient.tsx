'use client';

import React, { useState, useTransition, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  ArrowUpDown,
  Sparkles,
  Flame,
  Star,
  Calendar,
  Film,
  Tv,
  RotateCcw,
  Check,
  Grid,
  LayoutGrid,
  ListFilter,
  Play,
  ArrowRight,
  ChevronDown,
  Layers,
  Lock,
} from 'lucide-react';
import { UnifiedAnime } from '@/types';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { authStore, UserProfile } from '@/lib/auth/user-store';
import { AuthModal } from '@/components/auth/AuthModal';
import {
  CATALOG_PRESETS,
  GENRE_ITEMS,
  STATUS_ITEMS,
  FORMAT_ITEMS,
  SEASON_ITEMS,
  YEAR_ITEMS,
  SORT_ITEMS,
  CatalogPreset,
} from './catalog-data';
import { SPRINGS } from '@/lib/motion-presets';

interface CatalogClientProps {
  initialAnimeList: UnifiedAnime[];
  pageInfo: {
    total: number;
    currentPage: number;
    lastPage: number;
    hasNextPage: boolean;
  };
  activeParams: {
    page: number;
    genre?: string;
    status?: string;
    format?: string;
    season?: string;
    year?: string;
    search?: string;
    sort?: string;
  };
}

type DropdownType = 'genre' | 'status' | 'format' | 'season' | 'year' | 'sort' | null;

export const CatalogClient: React.FC<CatalogClientProps> = ({
  initialAnimeList,
  pageInfo,
  activeParams,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Auth state for search access
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Search input state
  const [searchInput, setSearchInput] = useState(activeParams.search || '');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Active open dropdown
  const [openDropdown, setOpenDropdown] = useState<DropdownType>(null);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);

  // Advanced filters state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  // Genre filter search query inside genre popover
  const [genreSearch, setGenreSearch] = useState('');

  // View Mode
  const [viewMode, setViewMode] = useState<'grid' | 'compact' | 'list'>('grid');
  const [jumpPageInput, setJumpPageInput] = useState('');

  useEffect(() => {
    return authStore.subscribe((u) => setCurrentUser(u));
  }, []);

  // Sync search input when activeParams.search changes externally
  useEffect(() => {
    setSearchInput(activeParams.search || '');
  }, [activeParams.search]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownContainerRef.current &&
        !dropdownContainerRef.current.contains(e.target as Node)
      ) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update URL search parameters
  const updateFilters = (newParams: Record<string, string | number | undefined | null>) => {
    const current = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === '' ||
        (key === 'page' && Number(value) <= 1) ||
        (key === 'sort' && value === 'POPULARITY_DESC')
      ) {
        current.delete(key);
      } else {
        current.set(key, String(value));
      }
    });

    // Reset to page 1 whenever any filter besides page changes
    if (!('page' in newParams)) {
      current.delete('page');
    }

    const qs = current.toString();
    const destination = qs ? `${pathname}?${qs}` : pathname;

    startTransition(() => {
      router.push(destination, { scroll: false });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return;
    }
    updateFilters({ search: searchInput.trim() || undefined, page: 1 });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    updateFilters({ search: undefined, page: 1 });
    searchInputRef.current?.focus();
  };

  const handleApplyPreset = (preset: CatalogPreset) => {
    const isCurrent =
      (!preset.params.genre || activeParams.genre === preset.params.genre) &&
      (!preset.params.status || activeParams.status === preset.params.status) &&
      (!preset.params.format || activeParams.format === preset.params.format) &&
      (!preset.params.year || activeParams.year === preset.params.year) &&
      (!preset.params.sort || activeParams.sort === preset.params.sort);

    if (isCurrent && hasActiveFilters) {
      // Toggle off -> reset
      handleResetAll();
      return;
    }

    const current = new URLSearchParams();
    Object.entries(preset.params).forEach(([k, v]) => {
      if (v) current.set(k, v);
    });
    const qs = current.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const handleResetAll = () => {
    setSearchInput('');
    setOpenDropdown(null);
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  };

  const handleJumpPage = (e: React.FormEvent) => {
    e.preventDefault();
    const p = parseInt(jumpPageInput, 10);
    if (!isNaN(p) && p >= 1 && p <= totalPages) {
      updateFilters({ page: p });
      setJumpPageInput('');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleDropdown = (name: DropdownType) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  const currentPage = activeParams.page || 1;
  const totalPages = Math.min(pageInfo.lastPage || 100, 500);
  const totalItems = pageInfo.total || (initialAnimeList.length > 0 ? totalPages * 36 : 0);

  // Active filter detections
  const activeGenreItem = GENRE_ITEMS.find((g) => g.value === activeParams.genre);
  const activeStatusItem = STATUS_ITEMS.find((s) => s.value === activeParams.status);
  const activeFormatItem = FORMAT_ITEMS.find((f) => f.value === activeParams.format);
  const activeSeasonItem = SEASON_ITEMS.find((s) => s.value === activeParams.season);
  const activeSortItem =
    SORT_ITEMS.find((s) => s.value === (activeParams.sort || 'POPULARITY_DESC')) ||
    SORT_ITEMS[0];

  const hasActiveFilters = Boolean(
    activeParams.genre ||
      activeParams.status ||
      activeParams.format ||
      activeParams.season ||
      activeParams.year ||
      activeParams.search ||
      (activeParams.sort && activeParams.sort !== 'POPULARITY_DESC')
  );

  const activeFiltersCount = [
    activeParams.genre,
    activeParams.status,
    activeParams.format,
    activeParams.season,
    activeParams.year,
    activeParams.search,
    activeParams.sort && activeParams.sort !== 'POPULARITY_DESC' ? activeParams.sort : undefined,
  ].filter(Boolean).length;

  // Filter genres in dropdown search
  const filteredGenres = GENRE_ITEMS.filter(
    (g) =>
      g.value !== '' &&
      (g.label.toLowerCase().includes(genreSearch.toLowerCase()) ||
        (g.en && g.en.toLowerCase().includes(genreSearch.toLowerCase())))
  );

  return (
    <div className="space-y-6 sm:space-y-8" ref={dropdownContainerRef}>
      {/* 1. Header & Presets Bar */}
      <div className="space-y-4">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-zinc-800/80">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-100">
                Каталог аниме
              </h1>
              {isPending && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                  <RotateCcw className="w-3 h-3 animate-spin text-zinc-400" />
                  <span>Поиск...</span>
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-zinc-400">
              Поиск и удобная фильтрация по жанрам, сезонам, форматам и годам
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-300">
              {totalItems.toLocaleString('ru-RU')} тайтлов
            </span>
          </div>
        </div>

        {/* Quick Presets (Naturally wrapping flex pills - NO horizontal scrollbars) */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
          <span className="text-xs font-mono text-zinc-500 mr-1 hidden sm:inline">
            Подборки:
          </span>
          {CATALOG_PRESETS.map((preset) => {
            const isMatch =
              (!preset.params.genre || activeParams.genre === preset.params.genre) &&
              (!preset.params.status || activeParams.status === preset.params.status) &&
              (!preset.params.format || activeParams.format === preset.params.format) &&
              (!preset.params.year || activeParams.year === preset.params.year) &&
              (!preset.params.sort || activeParams.sort === preset.params.sort);

            const isActive = isMatch && hasActiveFilters;

            return (
              <motion.button
                key={preset.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => handleApplyPreset(preset)}
                className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer border ${
                  isActive
                    ? 'text-zinc-950 font-semibold border-white/0 shadow-sm'
                    : 'bg-zinc-900/90 text-zinc-300 border-zinc-800 hover:bg-zinc-800 hover:text-zinc-100 hover:border-zinc-700'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCatalogPreset"
                    className="absolute inset-0 bg-zinc-100 rounded-lg -z-10"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{preset.icon}</span>
                <span className="relative z-10">{preset.label}</span>
                {preset.badge && (
                  <span
                    className={`relative z-10 px-1 py-0.2 text-[9px] font-mono font-bold rounded ${
                      isActive
                        ? 'bg-zinc-900 text-zinc-100'
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}
                  >
                    {preset.badge}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 2. Unified Clean Filter Toolbar */}
      <div className="relative z-30 p-3 sm:p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 shadow-sm space-y-3 backdrop-blur-md">
        {/* Row 1: Search + Sort Dropdown + View Toggle */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <form onSubmit={handleSearchSubmit} className="flex-1 relative">
            <div
              onClick={() => {
                if (!currentUser) {
                  setIsAuthModalOpen(true);
                }
              }}
              className={`relative flex items-center bg-zinc-950 border rounded-lg transition-colors ${
                !currentUser
                  ? 'border-zinc-800 hover:border-zinc-700 cursor-pointer'
                  : 'border-zinc-800 focus-within:border-zinc-700'
              }`}
            >
              {currentUser ? (
                <Search className="w-4 h-4 text-zinc-500 ml-3 shrink-0" />
              ) : (
                <Lock className="w-4 h-4 text-zinc-500 ml-3 shrink-0" />
              )}
              <input
                ref={searchInputRef}
                type="text"
                value={searchInput}
                onChange={(e) => {
                  if (!currentUser) {
                    setIsAuthModalOpen(true);
                    return;
                  }
                  setSearchInput(e.target.value);
                }}
                onFocus={(e) => {
                  if (!currentUser) {
                    e.target.blur();
                    setIsAuthModalOpen(true);
                  }
                }}
                placeholder={currentUser ? "Поиск по названию аниме..." : "Поиск (войдите для доступа)..."}
                className={`w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none ${
                  !currentUser ? 'cursor-pointer' : ''
                }`}
              />

              <AnimatePresence>
                {searchInput.length > 0 && currentUser && (
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    type="button"
                    onClick={handleClearSearch}
                    className="p-1.5 text-zinc-400 hover:text-zinc-100 transition-colors mr-1 cursor-pointer"
                    title="Очистить"
                  >
                    <X className="w-3.5 h-3.5" />
                  </motion.button>
                )}
              </AnimatePresence>

              <button
                type="submit"
                className="px-3.5 py-1.5 mr-1 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-colors cursor-pointer shrink-0"
              >
                {currentUser ? 'Найти' : 'Войти'}
              </button>
            </div>
          </form>

          {/* Sort Menu & View Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Custom Sort Dropdown */}
            <div className={`relative flex-1 sm:flex-initial ${openDropdown === 'sort' ? 'z-50' : 'z-10'}`}>
              <button
                type="button"
                onClick={() => toggleDropdown('sort')}
                className={`w-full inline-flex items-center justify-between gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                  openDropdown === 'sort' || (activeParams.sort && activeParams.sort !== 'POPULARITY_DESC')
                    ? 'bg-zinc-800 text-zinc-100 border-zinc-600'
                    : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-900 hover:text-zinc-100 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-1.5 truncate">
                  <ArrowUpDown className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  <span className="truncate">{activeSortItem.label}</span>
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-150 ${
                    openDropdown === 'sort' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {openDropdown === 'sort' && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    transition={SPRINGS.snappy}
                    className="absolute right-0 top-full mt-1.5 w-56 p-1.5 rounded-lg bg-zinc-900 border border-zinc-700 shadow-2xl z-50 space-y-0.5"
                  >
                    <div className="px-2.5 py-1 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      Сортировка
                    </div>
                    {SORT_ITEMS.map((item) => {
                      const isSelected = activeSortItem.value === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            updateFilters({ sort: item.value, page: 1 });
                            setOpenDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-left text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-zinc-800 text-zinc-100 font-semibold'
                              : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100'
                          }`}
                        >
                          <span>{item.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-zinc-100 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mobile Filter Button Trigger (sm:hidden) */}
            <button
              type="button"
              onClick={() => setIsMobileFiltersOpen(true)}
              className="sm:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-200 hover:border-zinc-700 transition-colors"
            >
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <span>Фильтры</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-zinc-950 text-[10px] font-bold flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-zinc-950 p-0.5 rounded-lg border border-zinc-800">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                title="Сетка"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('compact')}
                title="Компактная сетка"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'compact'
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                title="Список"
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <ListFilter className="w-4 h-4" />
              </button>
            </div>
            
          </div>
        </div>

        {/* Quick Genre Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
          {GENRE_ITEMS.slice(0, 9).map((genre) => {
            if (!genre.value) return null;
            const isActive = activeParams.genre === genre.value;
            return (
              <button
                key={genre.value}
                onClick={() => updateFilters({ genre: isActive ? undefined : genre.value, page: 1 })}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer border ${
                  isActive ? 'text-zinc-100 border-zinc-700/0' : 'bg-zinc-900/50 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCatalogGenre"
                    className="absolute inset-0 bg-zinc-800 rounded-lg -z-10"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <span>{genre.icon}</span>
                  {genre.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Row 2: 5 Core Filter Selectors (Always visible, clean floating popovers without clipping) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2 border-t border-zinc-800/80 relative z-30">
          {/* 1. Genre Dropdown */}
          <div className={`relative ${openDropdown === 'genre' ? 'z-50' : 'z-20'}`}>
            <button
              type="button"
              onClick={() => toggleDropdown('genre')}
              className={`w-full inline-flex items-center justify-between gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                openDropdown === 'genre' || activeParams.genre
                  ? 'bg-zinc-800 text-zinc-100 border-zinc-600 font-semibold shadow-sm'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-900 hover:text-zinc-100 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span>{activeGenreItem?.icon || '🎭'}</span>
                <span className="truncate">{activeGenreItem?.label || 'Все жанры'}</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-150 ${
                  openDropdown === 'genre' ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Genre Popover */}
            <AnimatePresence>
              {openDropdown === 'genre' && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={SPRINGS.snappy}
                  className="absolute left-0 top-full mt-1.5 w-72 sm:w-80 p-2.5 rounded-lg bg-zinc-900 border border-zinc-700 shadow-2xl z-50 space-y-2"
                >
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={genreSearch}
                      onChange={(e) => setGenreSearch(e.target.value)}
                      placeholder="Поиск по жанрам..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-md pl-8 pr-7 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600"
                    />
                    {genreSearch && (
                      <button
                        type="button"
                        onClick={() => setGenreSearch('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-100"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-0.5 pr-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        updateFilters({ genre: undefined, page: 1 });
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                        !activeParams.genre
                          ? 'bg-zinc-800 text-zinc-100 font-semibold'
                          : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span>✨</span>
                        <span>Все жанры</span>
                      </div>
                      {!activeParams.genre && <Check className="w-3.5 h-3.5 text-zinc-100" />}
                    </button>

                    {filteredGenres.map((g) => {
                      const isSelected = activeParams.genre === g.value;
                      return (
                        <button
                          key={g.value}
                          type="button"
                          onClick={() => {
                            updateFilters({ genre: isSelected ? undefined : g.value, page: 1 });
                            setOpenDropdown(null);
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-zinc-800 text-zinc-100 font-semibold'
                              : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span>{g.icon}</span>
                            <span className="truncate">{g.label}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-zinc-100 shrink-0 ml-1" />}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 2. Status Dropdown */}
          <div className={`relative ${openDropdown === 'status' ? 'z-50' : 'z-20'}`}>
            <button
              type="button"
              onClick={() => toggleDropdown('status')}
              className={`w-full inline-flex items-center justify-between gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                openDropdown === 'status' || activeParams.status
                  ? 'bg-zinc-800 text-zinc-100 border-zinc-600 font-semibold shadow-sm'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-900 hover:text-zinc-100 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                {activeStatusItem?.dotColor ? (
                  <span className={`w-2 h-2 rounded-full ${activeStatusItem.dotColor}`} />
                ) : (
                  <span>🌐</span>
                )}
                <span className="truncate">{activeStatusItem?.shortLabel || 'Все статусы'}</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-150 ${
                  openDropdown === 'status' ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {openDropdown === 'status' && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={SPRINGS.snappy}
                  className="absolute left-0 top-full mt-1.5 w-52 p-1.5 rounded-lg bg-zinc-900 border border-zinc-700 shadow-2xl z-50 space-y-0.5"
                >
                  {STATUS_ITEMS.map((s) => {
                    const isSelected = (activeParams.status || '') === s.value;
                    return (
                      <button
                        key={s.value || 'all'}
                        type="button"
                        onClick={() => {
                          updateFilters({ status: s.value || undefined, page: 1 });
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-800 text-zinc-100 font-semibold'
                            : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          {s.dotColor && <span className={`w-2 h-2 rounded-full ${s.dotColor}`} />}
                          <span className="truncate">{s.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-zinc-100 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 3. Format Dropdown */}
          <div className={`relative ${openDropdown === 'format' ? 'z-50' : 'z-20'}`}>
            <button
              type="button"
              onClick={() => toggleDropdown('format')}
              className={`w-full inline-flex items-center justify-between gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                openDropdown === 'format' || activeParams.format
                  ? 'bg-zinc-800 text-zinc-100 border-zinc-600 font-semibold shadow-sm'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-900 hover:text-zinc-100 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span>{activeFormatItem?.icon || '🎬'}</span>
                <span className="truncate">{activeFormatItem?.shortLabel || 'Все форматы'}</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-150 ${
                  openDropdown === 'format' ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {openDropdown === 'format' && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={SPRINGS.snappy}
                  className="absolute left-0 top-full mt-1.5 w-52 p-1.5 rounded-lg bg-zinc-900 border border-zinc-700 shadow-2xl z-50 space-y-0.5"
                >
                  {FORMAT_ITEMS.map((f) => {
                    const isSelected = (activeParams.format || '') === f.value;
                    return (
                      <button
                        key={f.value || 'all'}
                        type="button"
                        onClick={() => {
                          updateFilters({ format: f.value || undefined, page: 1 });
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-800 text-zinc-100 font-semibold'
                            : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span>{f.icon}</span>
                          <span className="truncate">{f.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-zinc-100 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 4. Season Dropdown */}
          <div className={`relative ${openDropdown === 'season' ? 'z-50' : 'z-20'}`}>
            <button
              type="button"
              onClick={() => toggleDropdown('season')}
              className={`w-full inline-flex items-center justify-between gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                openDropdown === 'season' || activeParams.season
                  ? 'bg-zinc-800 text-zinc-100 border-zinc-600 font-semibold shadow-sm'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-900 hover:text-zinc-100 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span>{activeSeasonItem?.icon || '🗓️'}</span>
                <span className="truncate">{activeSeasonItem?.label || 'Все сезоны'}</span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-150 ${
                  openDropdown === 'season' ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {openDropdown === 'season' && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={SPRINGS.snappy}
                  className="absolute left-0 sm:left-auto sm:right-0 lg:left-0 top-full mt-1.5 w-48 p-1.5 rounded-lg bg-zinc-900 border border-zinc-700 shadow-2xl z-50 space-y-0.5"
                >
                  {SEASON_ITEMS.map((season) => {
                    const isSelected = (activeParams.season || '') === season.value;
                    return (
                      <button
                        key={season.value || 'all'}
                        type="button"
                        onClick={() => {
                          updateFilters({ season: season.value || undefined, page: 1 });
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-800 text-zinc-100 font-semibold'
                            : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>{season.icon}</span>
                          <span>{season.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-zinc-100 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 5. Year Dropdown */}
          <div className={`relative ${openDropdown === 'year' ? 'z-50' : 'z-20'}`}>
            <button
              type="button"
              onClick={() => toggleDropdown('year')}
              className={`w-full inline-flex items-center justify-between gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                openDropdown === 'year' || activeParams.year
                  ? 'bg-zinc-800 text-zinc-100 border-zinc-600 font-semibold shadow-sm'
                  : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-900 hover:text-zinc-100 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <Calendar className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                <span className="truncate">
                  {activeParams.year ? `${activeParams.year} год` : 'Все годы'}
                </span>
              </div>
              <ChevronDown
                className={`w-3.5 h-3.5 text-zinc-400 shrink-0 transition-transform duration-150 ${
                  openDropdown === 'year' ? 'rotate-180' : ''
                }`}
              />
            </button>

            <AnimatePresence>
              {openDropdown === 'year' && (
                <motion.div
                  initial={{ opacity: 0, y: 4, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.98 }}
                  transition={SPRINGS.snappy}
                  className="absolute right-0 top-full mt-1.5 w-48 p-1.5 rounded-lg bg-zinc-900 border border-zinc-700 shadow-2xl z-50 max-h-60 overflow-y-auto space-y-0.5"
                >
                  {YEAR_ITEMS.map((y) => {
                    const isSelected = (activeParams.year || '') === y.value;
                    return (
                      <button
                        key={y.value || 'all'}
                        type="button"
                        onClick={() => {
                          updateFilters({ year: y.value || undefined, page: 1 });
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-zinc-800 text-zinc-100 font-semibold'
                            : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100'
                        }`}
                      >
                        <span>{y.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5 text-zinc-100 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Active Filters Badges & Quick Reset */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-mono text-zinc-500">Фильтры:</span>

              {/* Genre Chip */}
              {activeParams.genre && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs">
                  <span>{activeGenreItem?.icon || '🎭'}</span>
                  <span>{activeGenreItem?.label || activeParams.genre}</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ genre: undefined, page: 1 })}
                    className="p-0.5 text-zinc-400 hover:text-zinc-100 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Status Chip */}
              {activeParams.status && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs">
                  {activeStatusItem?.dotColor && (
                    <span className={`w-1.5 h-1.5 rounded-full ${activeStatusItem.dotColor}`} />
                  )}
                  <span>{activeStatusItem?.shortLabel || activeParams.status}</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ status: undefined, page: 1 })}
                    className="p-0.5 text-zinc-400 hover:text-zinc-100 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Format Chip */}
              {activeParams.format && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs">
                  <span>{activeFormatItem?.icon || '🎬'}</span>
                  <span>{activeFormatItem?.shortLabel || activeParams.format}</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ format: undefined, page: 1 })}
                    className="p-0.5 text-zinc-400 hover:text-zinc-100 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Season Chip */}
              {activeParams.season && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs">
                  <span>{activeSeasonItem?.icon || '🗓️'}</span>
                  <span>{activeSeasonItem?.label || activeParams.season}</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ season: undefined, page: 1 })}
                    className="p-0.5 text-zinc-400 hover:text-zinc-100 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Year Chip */}
              {activeParams.year && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs">
                  <Calendar className="w-3 h-3 text-zinc-400" />
                  <span>{activeParams.year} год</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ year: undefined, page: 1 })}
                    className="p-0.5 text-zinc-400 hover:text-zinc-100 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Search Query Chip */}
              {activeParams.search && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs">
                  <Search className="w-3 h-3 text-zinc-400" />
                  <span>«{activeParams.search}»</span>
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="p-0.5 text-zinc-400 hover:text-zinc-100 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Sort Chip */}
              {activeParams.sort && activeParams.sort !== 'POPULARITY_DESC' && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-200 border border-zinc-700 text-xs">
                  <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                  <span>{activeSortItem.label}</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ sort: 'POPULARITY_DESC', page: 1 })}
                    className="p-0.5 text-zinc-400 hover:text-zinc-100 cursor-pointer ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Reset All Action */}
            <button
              type="button"
              onClick={handleResetAll}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Сбросить всё ({activeFiltersCount})</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Results Section */}
      {initialAnimeList.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-10 sm:p-14 rounded-xl bg-zinc-900/50 border border-zinc-800 text-center space-y-4 shadow-sm"
        >
          <div className="w-14 h-14 rounded-xl bg-zinc-800/80 border border-zinc-700 text-zinc-400 flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>

          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="text-lg font-bold text-zinc-100">
              По вашему запросу ничего не найдено
            </h3>
            <p className="text-xs text-zinc-400">
              Попробуйте сбросить некоторые фильтры или выбрать популярный жанр
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleResetAll}
              className="px-3.5 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сбросить фильтры</span>
            </button>
            <button
              type="button"
              onClick={() => updateFilters({ genre: 'Action', page: 1 })}
              className="px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
            >
              ⚔️ Экшен
            </button>
            <button
              type="button"
              onClick={() => updateFilters({ status: 'RELEASING', page: 1 })}
              className="px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
            >
              ⚡ Онгоинги
            </button>
          </div>
        </motion.div>
      ) : viewMode === 'list' ? (
        /* List View */
        <div className="space-y-3">
          {initialAnimeList.map((anime) => {
            const title = anime.title.russian || anime.title.english || anime.title.romaji;
            return (
              <Link
                key={anime.id}
                href={`/anime/${anime.id}`}
                className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-3.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/60 border border-zinc-800 hover:border-zinc-700 transition-all duration-200"
              >
                {/* Poster Thumbnail */}
                <div className="relative w-20 h-28 sm:w-24 sm:h-32 rounded-lg overflow-hidden shrink-0 bg-zinc-950 border border-zinc-800">
                  {anime.coverImage.original && (
                    <Image
                      src={anime.coverImage.original}
                      alt={title}
                      fill
                      sizes="96px"
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  )}
                  {anime.score > 0 && (
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-zinc-900/90 text-[10px] font-mono font-bold text-zinc-100 border border-zinc-700">
                      <Star className="w-2.5 h-2.5 fill-zinc-100" />
                      <span>{anime.score.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 font-semibold border border-zinc-700">
                      {anime.format || 'TV'}
                    </span>
                    {anime.seasonYear && <span>{anime.seasonYear} г.</span>}
                    {anime.episodesTotal && <span>• {anime.episodesTotal} эп.</span>}
                    {anime.status === 'RELEASING' && (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Онгоинг
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-zinc-100 group-hover:text-white transition-colors line-clamp-1">
                    {title}
                  </h3>

                  {anime.genres && anime.genres.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {anime.genres.slice(0, 4).map((genre) => (
                        <span
                          key={genre}
                          className="px-2 py-0.5 rounded bg-zinc-800/80 text-[10px] font-mono text-zinc-400 border border-zinc-800"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}

                  {anime.synopsisEn && (
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {anime.synopsisEn.replace(/<[^>]*>?/gm, '')}
                    </p>
                  )}
                </div>

                {/* Action CTA */}
                <div className="hidden sm:flex items-center justify-center p-2.5 rounded-lg bg-zinc-800 group-hover:bg-zinc-700 text-zinc-300 group-hover:text-white transition-colors shrink-0">
                  <Play className="w-4 h-4 ml-0.5 fill-current" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Grid Views (Standard or Compact) */
        <motion.div
          layout
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.02 },
            },
          }}
          initial="hidden"
          animate="show"
          className={`grid gap-3 sm:gap-4 ${
            viewMode === 'compact'
              ? 'grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-8'
              : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
          }`}
        >
          {initialAnimeList.map((anime) => (
            <div key={anime.id}>
              <AnimeCard anime={anime} />
            </div>
          ))}
        </motion.div>
      )}

      {/* 4. Pagination */}
      {totalPages > 1 && (
        <div className="pt-6 pb-2 border-t border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs font-mono text-zinc-500 text-center sm:text-left">
            Страница <span className="text-zinc-200 font-bold">{currentPage}</span> из{' '}
            <span className="text-zinc-200 font-bold">{totalPages}</span>
          </div>

          <div className="flex items-center gap-1 flex-wrap justify-center">
            {/* First Page */}
            {currentPage > 2 && (
              <button
                type="button"
                onClick={() => {
                  updateFilters({ page: 1 });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 transition-colors cursor-pointer"
                title="Первая страница"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
            )}

            {/* Prev Page */}
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => {
                updateFilters({ page: Math.max(1, currentPage - 1) });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                currentPage <= 1
                  ? 'opacity-40 pointer-events-none bg-zinc-900 border-zinc-800 text-zinc-600'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border-zinc-800'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Назад</span>
            </button>

            {/* Page Number Pills */}
            {(() => {
              const pages: (number | string)[] = [];
              const delta = 2;
              const left = Math.max(1, currentPage - delta);
              const right = Math.min(totalPages, currentPage + delta);

              if (left > 1) {
                pages.push(1);
                if (left > 2) pages.push('...');
              }

              for (let i = left; i <= right; i++) {
                pages.push(i);
              }

              if (right < totalPages) {
                if (right < totalPages - 1) pages.push('...');
                pages.push(totalPages);
              }

              return pages.map((page, idx) => {
                if (page === '...') {
                  return (
                    <span
                      key={`ellipsis-${idx}`}
                      className="px-1.5 py-1 text-xs font-mono text-zinc-600"
                    >
                      ...
                    </span>
                  );
                }

                const pageNum = Number(page);
                const isActive = pageNum === currentPage;

                return (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => {
                      updateFilters({ page: pageNum });
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer border ${
                      isActive
                        ? 'bg-zinc-100 text-zinc-950 border-white shadow-sm'
                        : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border-zinc-800'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              });
            })()}

            {/* Next Page */}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => {
                updateFilters({ page: Math.min(totalPages, currentPage + 1) });
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer ${
                currentPage >= totalPages
                  ? 'opacity-40 pointer-events-none bg-zinc-900 border-zinc-800 text-zinc-600'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border-zinc-800'
              }`}
            >
              <span className="hidden sm:inline">Вперёд</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            {/* Last Page */}
            {currentPage < totalPages - 1 && (
              <button
                type="button"
                onClick={() => {
                  updateFilters({ page: totalPages });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800 transition-colors cursor-pointer"
                title="Последняя страница"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Page Jump */}
          <form onSubmit={handleJumpPage} className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-zinc-500">Стр:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              placeholder={String(currentPage)}
              className="w-12 bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-center text-zinc-100 font-mono focus:outline-none focus:border-zinc-600"
            />
            <button
              type="submit"
              className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono font-medium transition-colors cursor-pointer"
            >
              ОК
            </button>
          </form>
        </div>
      )}

      {/* Mobile Filter Drawer (Bottom Sheet) */}
      <AnimatePresence>
        {isMobileFiltersOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />

            {/* Sheet Panel */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="relative w-full max-h-[85vh] bg-zinc-900 border-t border-zinc-800 rounded-t-2xl p-4 pb-8 space-y-4 overflow-y-auto z-10"
            >
              {/* Sheet Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 sticky top-0 bg-zinc-900 z-20">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-zinc-300" />
                  <h3 className="text-base font-bold text-zinc-100">Фильтры каталога</h3>
                  {activeFiltersCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 text-xs font-mono">
                      {activeFiltersCount}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {activeFiltersCount > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        handleResetAll();
                        setIsMobileFiltersOpen(false);
                      }}
                      className="text-xs text-rose-400 font-medium px-2 py-1 rounded bg-rose-500/10"
                    >
                      Сброс
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setIsMobileFiltersOpen(false)}
                    className="p-1 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Status Section */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Статус тайтла</div>
                <div className="flex flex-wrap gap-1.5">
                  {STATUS_ITEMS.map((st) => {
                    const isSelected = (!st.value && !activeParams.status) || activeParams.status === st.value;
                    return (
                      <button
                        key={st.label}
                        type="button"
                        onClick={() => updateFilters({ status: st.value || undefined, page: 1 })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          isSelected
                            ? 'bg-white text-zinc-950 border-white font-semibold'
                            : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                        }`}
                      >
                        {st.icon} {st.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Format Section */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Формат</div>
                <div className="flex flex-wrap gap-1.5">
                  {FORMAT_ITEMS.map((fmt) => {
                    const isSelected = (!fmt.value && !activeParams.format) || activeParams.format === fmt.value;
                    return (
                      <button
                        key={fmt.label}
                        type="button"
                        onClick={() => updateFilters({ format: fmt.value || undefined, page: 1 })}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          isSelected
                            ? 'bg-white text-zinc-950 border-white font-semibold'
                            : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                        }`}
                      >
                        {fmt.icon} {fmt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Genres Section */}
              <div className="space-y-2">
                <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Жанры</div>
                <div className="grid grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-1 bg-zinc-950 rounded-lg border border-zinc-800">
                  {GENRE_ITEMS.map((g) => {
                    const isSelected = (!g.value && !activeParams.genre) || activeParams.genre === g.value;
                    return (
                      <button
                        key={g.label}
                        type="button"
                        onClick={() => updateFilters({ genre: g.value || undefined, page: 1 })}
                        className={`px-2.5 py-1.5 rounded-md text-xs text-left truncate flex items-center gap-1.5 border transition-colors ${
                          isSelected
                            ? 'bg-zinc-800 text-white border-zinc-600 font-semibold'
                            : 'text-zinc-400 border-transparent hover:text-zinc-200'
                        }`}
                      >
                        <span>{g.icon}</span>
                        <span className="truncate">{g.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Apply Button */}
              <div className="pt-2 sticky bottom-0 bg-zinc-900">
                <button
                  type="button"
                  onClick={() => setIsMobileFiltersOpen(false)}
                  className="w-full py-3 rounded-xl bg-white text-zinc-950 font-bold text-sm shadow-lg active:scale-98 transition-transform"
                >
                  Применить фильтры
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auth Modal for search protection */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};
