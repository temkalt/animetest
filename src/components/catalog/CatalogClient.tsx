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
  SlidersHorizontal,
  ArrowUpDown,
  Sparkles,
  Flame,
  Star,
  Calendar,
  Film,
  Tv,
  RotateCcw,
  Check,
  Compass,
  Grid,
  LayoutGrid,
  ListFilter,
  Play,
  ArrowRight,
  Zap,
  Sun,
  Snowflake,
  Flower2,
  Leaf,
  Layers,
  ChevronDown,
} from 'lucide-react';
import { UnifiedAnime } from '@/types';
import { AnimeCard } from '@/components/anime/AnimeCard';
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

export const CatalogClient: React.FC<CatalogClientProps> = ({
  initialAnimeList,
  pageInfo,
  activeParams,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Search input state
  const [searchInput, setSearchInput] = useState(activeParams.search || '');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Filter drawer & dropdown states
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isGenreExpandOpen, setIsGenreExpandOpen] = useState(false);
  const [genreSearch, setGenreSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'compact' | 'list'>('grid');
  const [jumpPageInput, setJumpPageInput] = useState('');

  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Sync search input when activeParams.search changes externally
  useEffect(() => {
    setSearchInput(activeParams.search || '');
  }, [activeParams.search]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(e.target as Node)
      ) {
        setIsSortDropdownOpen(false);
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
    updateFilters({ search: searchInput.trim() || undefined, page: 1 });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    updateFilters({ search: undefined, page: 1 });
    searchInputRef.current?.focus();
  };

  const handleApplyPreset = (preset: CatalogPreset) => {
    // Replace all existing filter params with the preset's params
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
    }
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

  // Filter genres in expandable dialog
  const filteredGenres = GENRE_ITEMS.filter(
    (g) =>
      g.value !== '' &&
      (g.label.toLowerCase().includes(genreSearch.toLowerCase()) ||
        (g.en && g.en.toLowerCase().includes(genreSearch.toLowerCase())))
  );

  // Top quick genre chips (first 8 prominent genres)
  const quickGenres = GENRE_ITEMS.filter((g) =>
    ['Action', 'Fantasy', 'Romance', 'Comedy', 'Drama', 'Sci-Fi', 'Horror', 'Mystery'].includes(
      g.value
    )
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header & Search Hero */}
      <div className="relative rounded-lg bg-zinc-950 border border-zinc-800 p-6 sm:p-8 md:p-10 shadow-sm overflow-hidden">
        {/* Glow ambient meshes */}
        
        

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Header Title & Badges */}
          <div className="space-y-2.5 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-mono font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-white " />
                <span>Каталог 2026</span>
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-zinc-300 border border-cyan-500/20 text-xs font-mono">
                Ultra HD 1080p
              </span>
              {isPending && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-mono ">
                  <RotateCcw className="w-3 h-3 animate-spin" />
                  <span>Обновление...</span>
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-sans tracking-tight text-white">
              Вселенная <span className="text-white">Аниме</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
              Исследуйте тысячи тайтлов с мгновенной фильтрацией по жанрам, сезонам, форматам и студиям.
            </p>
          </div>

          {/* Search Form with Modern Clear Button */}
          <div className="w-full lg:max-w-md">
            <form onSubmit={handleSearchSubmit} className="relative group">
              <div className="relative flex items-center bg-zinc-950 hover:bg-zinc-900 focus-within:bg-zinc-900 border border-zinc-800 focus-within:border-zinc-700 shadow-sm rounded-lg transition-all duration-300 p-1.5">
                <Search className="w-4 h-4 text-zinc-400 ml-3 shrink-0 group-focus-within:text-white transition-colors" />

                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Поиск по названию, студии..."
                  className="w-full bg-transparent px-3 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none font-sans"
                />

                {/* Instant Clear Button */}
                {searchInput.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-all mr-1 cursor-pointer"
                    title="Очистить поиск"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* Submit Search Button */}
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-900 text-white text-xs sm:text-sm font-semibold shadow-sm text-zinc-900 transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                >
                  <span>Найти</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

            {/* Search shortcuts or popular suggestions */}
            <div className="flex items-center gap-2 mt-2.5 text-[11px] text-zinc-500 overflow-x-auto no-scrollbar py-0.5">
              <span className="font-mono shrink-0">Часто ищут:</span>
              {['Solo Leveling', 'Клинок', 'Магическая битва', 'Берсерк', 'Наруто'].map((term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => {
                    setSearchInput(term);
                    updateFilters({ search: term, page: 1 });
                  }}
                  className="px-2 py-0.5 rounded-md bg-white/[0.04] hover:bg-white/[0.08] hover:text-zinc-300 text-zinc-400 transition-colors shrink-0 font-sans cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="mt-6 pt-6 border-t border-white/[0.06] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>Быстрые подборки 2026:</span>
            </span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 no-scrollbar">
            {CATALOG_PRESETS.map((preset) => {
              const isMatch =
                (!preset.params.genre || activeParams.genre === preset.params.genre) &&
                (!preset.params.status || activeParams.status === preset.params.status) &&
                (!preset.params.format || activeParams.format === preset.params.format) &&
                (!preset.params.year || activeParams.year === preset.params.year) &&
                (!preset.params.sort || activeParams.sort === preset.params.sort);

              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  className={`group inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 border cursor-pointer ${
                    isMatch && hasActiveFilters
                      ? 'bg-gradient-to-r from-indigo-600/30 to-violet-600/30 text-white border-indigo-500/60 shadow-lg shadow-indigo-500/20'
                      : `bg-gradient-to-r ${preset.color} bg-opacity-10 backdrop-blur-sm hover:scale-[1.02]`
                  }`}
                >
                  <span className="text-sm">{preset.icon}</span>
                  <span>{preset.label}</span>
                  {preset.badge && (
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-black/40 border border-white/10 text-white">
                      {preset.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Filter Toolbar Container */}
      <div className="p-4 sm:p-5 rounded-lg bg-zinc-950 border border-zinc-800 shadow-sm space-y-4 backdrop-blur-xl">
        {/* Row 1: Primary Controls (Genre Chips + Sort + Expand) */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Quick Genre Chips Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-1">
            <button
              type="button"
              onClick={() => updateFilters({ genre: undefined, page: 1 })}
              className={`px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                !activeParams.genre
                  ? 'bg-zinc-800 text-white border-zinc-700 shadow-sm'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white'
              }`}
            >
              Все жанры
            </button>

            {quickGenres.map((g) => {
              const isSelected = activeParams.genre === g.value;
              return (
                <button
                  key={g.value}
                  type="button"
                  onClick={() =>
                    updateFilters({
                      genre: isSelected ? undefined : g.value,
                      page: 1,
                    })
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                    isSelected
                      ? 'bg-zinc-800 text-white border-zinc-700 shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:bg-zinc-800 hover:text-white'
                  }`}
                >
                  <span>{g.icon}</span>
                  <span>{g.label}</span>
                </button>
              );
            })}

            {/* Expand All Genres Button */}
            <button
              type="button"
              onClick={() => setIsGenreExpandOpen(!isGenreExpandOpen)}
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all cursor-pointer border ${
                isGenreExpandOpen || (activeParams.genre && !quickGenres.some((q) => q.value === activeParams.genre))
                  ? 'bg-zinc-800 text-zinc-300 border-zinc-700'
                  : 'bg-[#0E121E] text-zinc-400 border-white/[0.08] hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>{activeGenreItem && !quickGenres.some((q) => q.value === activeParams.genre) ? activeGenreItem.label : 'Все 19+ жанров'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform duration-200 ${
                  isGenreExpandOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* Right: Sleek Sort Dropdown & Advanced Filters Toggle */}
          <div className="flex items-center gap-2.5 self-end lg:self-auto shrink-0">
            {/* Custom Sort Dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                type="button"
                onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#0E121E] hover:bg-[#131929] border-zinc-800 hover:border-white/20 text-xs font-medium text-white transition-all cursor-pointer shadow-sm"
              >
                <ArrowUpDown className="w-3.5 h-3.5 text-white" />
                <span className="text-zinc-400 font-normal">Сортировка:</span>
                <span className="font-semibold text-white">{activeSortItem.label}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                    isSortDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {isSortDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={SPRINGS.snappy}
                    className="absolute right-0 top-full mt-2 w-64 p-2 rounded-lg glass-dropdown z-50 shadow-2xl border border-white/[0.12] space-y-1"
                  >
                    <div className="px-2.5 py-1.5 text-[10px] font-mono text-zinc-500 uppercase tracking-wider">
                      Порядок отображения
                    </div>
                    {SORT_ITEMS.map((item) => {
                      const isSelected = activeSortItem.value === item.value;
                      return (
                        <button
                          key={item.value}
                          type="button"
                          onClick={() => {
                            updateFilters({ sort: item.value, page: 1 });
                            setIsSortDropdownOpen(false);
                          }}
                          className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-lg text-left transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-indigo-600/20 text-zinc-300 border border-indigo-500/30'
                              : 'hover:bg-white/[0.06] text-zinc-300 hover:text-white'
                          }`}
                        >
                          <div className="pt-0.5">
                            {item.value === 'POPULARITY_DESC' && <Flame className="w-3.5 h-3.5 text-amber-400" />}
                            {item.value === 'SCORE_DESC' && <Star className="w-3.5 h-3.5 text-yellow-400" />}
                            {item.value === 'TRENDING_DESC' && <Zap className="w-3.5 h-3.5 text-white" />}
                            {item.value === 'START_DATE_DESC' && <Calendar className="w-3.5 h-3.5 text-cyan-400" />}
                            {item.value === 'FAVOURITES_DESC' && <Star className="w-3.5 h-3.5 text-rose-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold flex items-center justify-between">
                              <span>{item.label}</span>
                              {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                            </div>
                            <p className="text-[10px] text-zinc-500 line-clamp-1">
                              {item.description}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Advanced Filters Drawer Toggle */}
            <button
              type="button"
              onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                isAdvancedOpen || (activeFiltersCount > 0 && !activeParams.genre)
                  ? 'bg-indigo-600/20 text-zinc-300 border-indigo-500/40 shadow-sm'
                  : 'bg-[#0E121E] hover:bg-[#131929] text-zinc-300 border-white/[0.1] hover:text-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-white" />
              <span>Параметры</span>
              {activeFiltersCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-lg bg-indigo-500 text-white text-[10px] font-mono font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Expandable Genre Matrix */}
        <AnimatePresence>
          {isGenreExpandOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={SPRINGS.gentle}
              className="overflow-hidden pt-3 border-t border-white/[0.06] space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-white" />
                  <span>Полный каталог жанров ({GENRE_ITEMS.length - 1}):</span>
                </span>

                <div className="relative max-w-xs w-full">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={genreSearch}
                    onChange={(e) => setGenreSearch(e.target.value)}
                    placeholder="Поиск по жанрам..."
                    className="w-full bg-zinc-950 border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50"
                  />
                  {genreSearch && (
                    <button
                      type="button"
                      onClick={() => setGenreSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 max-h-56 overflow-y-auto pr-1">
                {filteredGenres.map((g) => {
                  const isSelected = activeParams.genre === g.value;
                  return (
                    <button
                      key={g.value}
                      type="button"
                      onClick={() => {
                        updateFilters({
                          genre: isSelected ? undefined : g.value,
                          page: 1,
                        });
                        setIsGenreExpandOpen(false);
                      }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-zinc-800 text-white border-zinc-700 shadow-sm'
                          : 'bg-zinc-950 hover:bg-[#111726] text-zinc-300 hover:text-white border-white/[0.06]'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        <span>{g.icon}</span>
                        <span className="truncate">{g.label}</span>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 shrink-0 text-white ml-1" />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Expandable Advanced Filter Panel (Status, Format, Season, Year) */}
        <AnimatePresence>
          {isAdvancedOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={SPRINGS.gentle}
              className="overflow-hidden pt-4 border-t border-white/[0.06] space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Status Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                    Статус релиза
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 bg-zinc-950 p-1 rounded-lg border-zinc-800">
                    {STATUS_ITEMS.map((s) => {
                      const isSelected = (activeParams.status || '') === s.value;
                      return (
                        <button
                          key={s.value || 'all'}
                          type="button"
                          onClick={() => updateFilters({ status: s.value || undefined, page: 1 })}
                          className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                          }`}
                        >
                          {s.dotColor && <span className={`w-2 h-2 rounded-lg ${s.dotColor}`} />}
                          <span className="truncate">{s.shortLabel || s.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Format Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                    Тип / Формат
                  </label>
                  <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border-zinc-800 overflow-x-auto no-scrollbar">
                    {FORMAT_ITEMS.map((f) => {
                      const isSelected = (activeParams.format || '') === f.value;
                      return (
                        <button
                          key={f.value || 'all'}
                          type="button"
                          onClick={() => updateFilters({ format: f.value || undefined, page: 1 })}
                          className={`flex-1 min-w-[50px] px-2 py-1.5 rounded-lg text-xs font-medium transition-all text-center cursor-pointer ${
                            isSelected
                              ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                          }`}
                        >
                          {f.shortLabel || f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Season Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                    Сезон года
                  </label>
                  <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-lg border-zinc-800 overflow-x-auto no-scrollbar">
                    {SEASON_ITEMS.map((season) => {
                      const isSelected = (activeParams.season || '') === season.value;
                      return (
                        <button
                          key={season.value || 'all'}
                          type="button"
                          onClick={() => updateFilters({ season: season.value || undefined, page: 1 })}
                          className={`flex-1 min-w-[50px] flex items-center justify-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all text-center cursor-pointer ${
                            isSelected
                              ? 'bg-zinc-800 text-white font-semibold shadow-sm'
                              : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                          }`}
                        >
                          <span>{season.icon}</span>
                          <span className="hidden sm:inline">{season.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Year Selector */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                    Год выпуска
                  </label>
                  <div className="relative">
                    <select
                      aria-label="Фильтр по году"
                      value={activeParams.year || ''}
                      onChange={(e) => updateFilters({ year: e.target.value || undefined, page: 1 })}
                      className="w-full bg-zinc-950 text-xs text-zinc-200 border-zinc-800 rounded-lg px-3.5 py-2 appearance-none focus:outline-none focus:border-indigo-500/60 cursor-pointer"
                    >
                      {YEAR_ITEMS.map((y) => (
                        <option key={y.value} value={y.value} className="bg-zinc-950 text-white">
                          {y.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Filter Badges Bar */}
        {hasActiveFilters && (
          <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between flex-wrap gap-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono text-zinc-400">Активные фильтры:</span>

              {/* Genre Pill */}
              {activeParams.genre && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-mono">
                  <span>{activeGenreItem?.icon || '✨'}</span>
                  <span>{activeGenreItem?.label || activeParams.genre}</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ genre: undefined, page: 1 })}
                    className="p-0.5 rounded-md hover:bg-zinc-700/50 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="Удалить фильтр жанра"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Status Pill */}
              {activeParams.status && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-mono">
                  {activeStatusItem?.dotColor && (
                    <span className={`w-2 h-2 rounded-lg ${activeStatusItem.dotColor}`} />
                  )}
                  <span>{activeStatusItem?.label || activeParams.status}</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ status: undefined, page: 1 })}
                    className="p-0.5 rounded-md hover:bg-zinc-700/50 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="Удалить фильтр статуса"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Format Pill */}
              {activeParams.format && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-mono">
                  <span>{activeFormatItem?.icon || '🎬'}</span>
                  <span>{activeFormatItem?.label || activeParams.format}</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ format: undefined, page: 1 })}
                    className="p-0.5 rounded-md hover:bg-zinc-700/50 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="Удалить фильтр формата"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Season Pill */}
              {activeParams.season && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-mono">
                  <span>{activeSeasonItem?.icon || '❄️'}</span>
                  <span>{activeSeasonItem?.label || activeParams.season}</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ season: undefined, page: 1 })}
                    className="p-0.5 rounded-md hover:bg-zinc-700/50 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="Удалить фильтр сезона"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Year Pill */}
              {activeParams.year && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-mono">
                  <Calendar className="w-3 h-3 text-purple-400" />
                  <span>{activeParams.year} год</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ year: undefined, page: 1 })}
                    className="p-0.5 rounded-md hover:bg-zinc-700/50 text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    title="Удалить фильтр года"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Search Query Pill */}
              {activeParams.search && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-mono">
                  <Search className="w-3 h-3 text-amber-400" />
                  <span>«{activeParams.search}»</span>
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="p-0.5 rounded-md hover:bg-amber-500/30 text-amber-300 hover:text-white transition-colors cursor-pointer"
                    title="Очистить поисковый запрос"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Sort Pill (if custom) */}
              {activeParams.sort && activeParams.sort !== 'POPULARITY_DESC' && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-white/10 text-xs font-mono">
                  <ArrowUpDown className="w-3 h-3 text-zinc-400" />
                  <span>{activeSortItem.label}</span>
                  <button
                    type="button"
                    onClick={() => updateFilters({ sort: 'POPULARITY_DESC', page: 1 })}
                    className="p-0.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                    title="Сбросить сортировку"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Reset All Button */}
            <button
              type="button"
              onClick={handleResetAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 hover:border-rose-500/40 text-xs font-mono font-medium transition-all cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Сбросить всё ({activeFiltersCount})</span>
            </button>
          </div>
        )}
      </div>

      {/* Catalog Status Bar & View Density Controls */}
      <div className="flex items-center justify-between gap-4 text-xs font-mono text-zinc-400 px-1">
        <div className="flex items-center gap-2">
          <span>Найдено:</span>
          <span className="px-2.5 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 font-bold">
            {totalItems.toLocaleString('ru-RU')} тайтлов
          </span>
          <span className="hidden sm:inline text-zinc-600">•</span>
          <span className="hidden sm:inline">Страница {currentPage} из {totalPages}</span>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-[#090C14] p-1 rounded-lg border-zinc-800">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            title="Стандартная сетка"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('compact')}
            title="Компактная сетка"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'compact'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            title="Список с описанием"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ListFilter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of Results / List of Results / Empty State */}
      {initialAnimeList.length === 0 ? (
        /* Empty State */
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-12 sm:p-16 rounded-lg bg-[#090C14] border-zinc-800 text-center space-y-5 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />

          <div className="w-20 h-20 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-white flex items-center justify-center mx-auto shadow-inner">
            <Filter className="w-10 h-10 " />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold font-sans text-white">
              Ничего не найдено
            </h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
              По выбранным параметрам фильтрации аниме не найдено. Попробуйте смягчить критерии поиска или воспользуйтесь готовыми подборками.
            </p>
          </div>

          {/* Quick suggestions chips */}
          <div className="pt-2 flex items-center justify-center gap-2 flex-wrap max-w-lg mx-auto">
            <button
              type="button"
              onClick={handleResetAll}
              className="px-4 py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-900 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer inline-flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сбросить все фильтры</span>
            </button>
            <button
              type="button"
              onClick={() => updateFilters({ genre: 'Action', page: 1 })}
              className="px-3.5 py-2.5 rounded-lg bg-[#0E121E] hover:bg-[#151D2F] text-zinc-300 hover:text-white border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
            >
              ⚔️ Экшен
            </button>
            <button
              type="button"
              onClick={() => updateFilters({ status: 'RELEASING', page: 1 })}
              className="px-3.5 py-2.5 rounded-lg bg-[#0E121E] hover:bg-[#151D2F] text-zinc-300 hover:text-white border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
            >
              ⚡ Онгоинги
            </button>
            <button
              type="button"
              onClick={() => updateFilters({ sort: 'SCORE_DESC', page: 1 })}
              className="px-3.5 py-2.5 rounded-lg bg-[#0E121E] hover:bg-[#151D2F] text-zinc-300 hover:text-white border-zinc-800 text-xs font-medium transition-colors cursor-pointer"
            >
              🏆 Шедевры (9.0+)
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
                className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg bg-[#090C14] hover:bg-[#0E1322] border-zinc-800 hover:border-indigo-500/40 shadow-lg hover:shadow-indigo-500/10 transition-all duration-300"
              >
                {/* Poster Thumbnail */}
                <div className="relative w-20 h-28 sm:w-24 sm:h-32 rounded-lg overflow-hidden shrink-0 bg-[#06070A] border border-white/10">
                  {anime.coverImage.original && (
                    <Image
                      src={anime.coverImage.original}
                      alt={title}
                      fill
                      sizes="96px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  )}
                  {anime.score > 0 && (
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-mono font-bold text-amber-400 border border-amber-500/30">
                      <Star className="w-2.5 h-2.5 fill-amber-400" />
                      <span>{anime.score.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400 flex-wrap">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/15 text-zinc-300 font-semibold">
                      {anime.format || 'TV'}
                    </span>
                    {anime.seasonYear && <span>{anime.seasonYear} г.</span>}
                    {anime.episodesTotal && <span>• {anime.episodesTotal} эп.</span>}
                    {anime.status === 'RELEASING' && (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-lg bg-emerald-400" />
                        Онгоинг
                      </span>
                    )}
                  </div>

                  <h3 className="text-base sm:text-lg font-bold font-sans text-white group-hover:text-zinc-300 transition-colors line-clamp-1">
                    {title}
                  </h3>

                  {anime.genres && anime.genres.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {anime.genres.slice(0, 4).map((genre) => (
                        <span
                          key={genre}
                          className="px-2 py-0.5 rounded-md bg-white/[0.04] text-[10px] font-mono text-zinc-400"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  )}

                  {anime.synopsisEn && (
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed font-sans">
                      {anime.synopsisEn.replace(/<[^>]*>?/gm, '')}
                    </p>
                  )}
                </div>

                {/* Action CTA */}
                <div className="hidden sm:flex items-center justify-center p-3 rounded-lg bg-indigo-600/10 group-hover:bg-indigo-600 text-white group-hover:text-white transition-all shrink-0">
                  <Play className="w-5 h-5 ml-0.5 fill-current" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Grid Views (Standard or Compact) */
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.03 },
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
            <motion.div
              key={anime.id}
              variants={{
                hidden: { opacity: 0, y: 12, scale: 0.97 },
                show: { opacity: 1, y: 0, scale: 1 },
              }}
              transition={SPRINGS.snappy}
            >
              <AnimeCard anime={anime} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* 2026 Beautiful Pagination Controls */}
      {totalPages > 1 && (
        <div className="pt-8 pb-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Results Summary */}
          <div className="text-xs font-mono text-zinc-400 text-center sm:text-left">
            Показано <span className="text-white font-bold">{(currentPage - 1) * 36 + 1}–{Math.min(currentPage * 36, totalItems)}</span> из{' '}
            <span className="text-white font-bold">{totalItems.toLocaleString('ru-RU')}</span> тайтлов
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {/* First Page */}
            {currentPage > 2 && (
              <button
                type="button"
                onClick={() => {
                  updateFilters({ page: 1 });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-2 rounded-lg bg-[#090C14] hover:bg-[#121726] text-zinc-400 hover:text-white border-zinc-800 transition-all cursor-pointer"
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
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                currentPage <= 1
                  ? 'opacity-40 pointer-events-none bg-[#090C14] border-white/[0.04] text-zinc-500'
                  : 'bg-[#090C14] hover:bg-[#121726] text-zinc-300 hover:text-white border-white/[0.08] hover:border-indigo-500/40'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Назад</span>
            </button>

            {/* Page Number Pills Window */}
            {(() => {
              const pages: (number | string)[] = [];
              const delta = 2; // window of +/- 2 around current

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
                      className="px-2 py-2 text-xs font-mono text-zinc-500"
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
                    className={`min-w-[36px] h-9 px-2.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white border-indigo-400 shadow-lg shadow-indigo-600/40 scale-105'
                        : 'bg-[#090C14] hover:bg-[#121726] text-zinc-400 hover:text-white border-white/[0.08] hover:border-white/20'
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
              className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                currentPage >= totalPages
                  ? 'opacity-40 pointer-events-none bg-[#090C14] border-white/[0.04] text-zinc-500'
                  : 'bg-[#090C14] hover:bg-[#121726] text-zinc-300 hover:text-white border-white/[0.08] hover:border-indigo-500/40'
              }`}
            >
              <span className="hidden sm:inline">Вперёд</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Last Page */}
            {currentPage < totalPages - 1 && (
              <button
                type="button"
                onClick={() => {
                  updateFilters({ page: totalPages });
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="p-2 rounded-lg bg-[#090C14] hover:bg-[#121726] text-zinc-400 hover:text-white border-zinc-800 transition-all cursor-pointer"
                title="Последняя страница"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Page Jump Form */}
          <form onSubmit={handleJumpPage} className="flex items-center gap-1.5">
            <span className="text-xs font-mono text-zinc-500">Стр:</span>
            <input
              type="number"
              min={1}
              max={totalPages}
              value={jumpPageInput}
              onChange={(e) => setJumpPageInput(e.target.value)}
              placeholder={String(currentPage)}
              className="w-14 bg-[#090C14] border-zinc-800 rounded-lg px-2 py-1.5 text-xs text-center text-white font-mono focus:outline-none focus:border-indigo-500/60"
            />
            <button
              type="submit"
              className="px-2.5 py-1.5 rounded-lg bg-[#0E121E] hover:bg-[#151D2F] text-zinc-300 hover:text-white border-zinc-800 text-xs font-mono font-medium transition-colors cursor-pointer"
            >
              Перейти
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
