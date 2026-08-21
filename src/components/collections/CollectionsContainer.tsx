'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layers,
  Search,
  SlidersHorizontal,
  X,
  Compass,
} from 'lucide-react';
import { EditorialCollection, COLLECTIONS_DATA } from '@/data/collections';
import { FeaturedCollection } from './FeaturedCollection';
import { CollectionCard } from './CollectionCard';
import { CollectionModal } from './CollectionModal';
import { SPRINGS } from '@/lib/motion-presets';

type FilterCategory = 'all' | 'sakuga' | 'cyberpunk' | 'fantasy' | 'seinen' | 'romance';
type SortOption = 'popularity' | 'likes' | 'count' | 'issue';

const FILTER_TABS: { id: FilterCategory; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'sakuga', label: 'Сакуга' },
  { id: 'cyberpunk', label: 'Киберпанк' },
  { id: 'fantasy', label: 'Фэнтези' },
  { id: 'seinen', label: 'Сэйнэн' },
  { id: 'romance', label: 'Романтика' },
];

export const CollectionsContainer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('popularity');
  const [selectedCollection, setSelectedCollection] = useState<EditorialCollection | null>(null);

  // Find the featured collection
  const featured = useMemo(() => {
    return COLLECTIONS_DATA.find((c) => c.featured) || COLLECTIONS_DATA[0];
  }, []);

  // Compute category counts for tab pills
  const categoryCounts = useMemo(() => {
    const counts: Record<FilterCategory, number> = {
      all: COLLECTIONS_DATA.length,
      sakuga: 0,
      cyberpunk: 0,
      fantasy: 0,
      seinen: 0,
      romance: 0,
    };
    COLLECTIONS_DATA.forEach((c) => {
      if (counts[c.category] !== undefined) {
        counts[c.category] += 1;
      }
    });
    return counts;
  }, []);

  // Filter and sort collections
  const filteredCollections = useMemo(() => {
    return COLLECTIONS_DATA.filter((c) => {
      const matchesTab = activeTab === 'all' || c.category === activeTab;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.curator.name.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q)) ||
        c.animeList.some(
          (a) =>
            a.title.toLowerCase().includes(q) ||
            (a.originalTitle && a.originalTitle.toLowerCase().includes(q))
        );

      return matchesTab && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'likes') return b.likes - a.likes;
      if (sortBy === 'count') return b.count - a.count;
      if (sortBy === 'issue') return a.issueNumber.localeCompare(b.issueNumber);
      return b.likes - a.likes; // default popularity
    });
  }, [activeTab, searchQuery, sortBy]);

  return (
    <div className="space-y-10 sm:space-y-12 pb-16">
      {/* Editorial Header Section */}
      <div className="relative pt-2 space-y-4">
        {/* Glow ambient background decoration */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-48 bg-gradient-to-r from-indigo-500/10 via-cyan-500/10 to-rose-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 backdrop-blur-md">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold text-indigo-300">
                  KuroNami Editorial Archive
                </span>
              </div>
              <span className="text-[11px] font-mono text-zinc-500 hidden sm:inline">
                VOL. 2026 // ISSUE #08
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-white tracking-tight leading-none">
              Тематические Коллекции
            </h1>

            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed max-w-xl">
              Авторские антологии с покадровой селекцией, глубоким разбором анимации и высоким разрешением Full HD 1080p.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-2xl bg-[#0A0D14] border border-white/[0.08] backdrop-blur-md text-center shadow-lg">
              <span className="text-base sm:text-lg font-extrabold font-display text-white block leading-tight">
                {COLLECTIONS_DATA.length}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Антологий
              </span>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-[#0A0D14] border border-white/[0.08] backdrop-blur-md text-center shadow-lg">
              <span className="text-base sm:text-lg font-extrabold font-display text-indigo-400 block leading-tight">
                190+
              </span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Шедевров
              </span>
            </div>

            <div className="px-4 py-2.5 rounded-2xl bg-[#0A0D14] border border-white/[0.08] backdrop-blur-md text-center shadow-lg">
              <span className="text-base sm:text-lg font-extrabold font-display text-amber-400 block leading-tight">
                ★ 9.1
              </span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Ср. балл
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Magazine Showcase */}
      {featured && activeTab === 'all' && !searchQuery && (
        <FeaturedCollection
          collection={featured}
          onQuickView={(col) => setSelectedCollection(col)}
        />
      )}

      {/* Filter Tabs & Search Control Bar */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-3 sm:p-4 rounded-3xl bg-[#0A0D14] border border-white/[0.08] shadow-xl backdrop-blur-xl">
          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 custom-scrollbar">
            {FILTER_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              const count = categoryCounts[tab.id];
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-4 py-2 rounded-2xl text-xs font-mono font-bold transition-all duration-300 shrink-0 cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'text-white shadow-lg shadow-indigo-600/20'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05]'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeFilterPill"
                      transition={{ ...SPRINGS.snappy, duration: 0.3 }}
                      className="absolute inset-0 bg-indigo-600 rounded-2xl -z-10"
                    />
                  )}
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono transition-colors ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-white/[0.06] text-zinc-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Sort Controls */}
          <div className="flex items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 lg:w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по темам, кураторам..."
                className="w-full bg-[#06070A] border border-white/[0.08] rounded-xl pl-9 pr-8 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/60 transition-all font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="relative shrink-0">
              <select
                aria-label="Сортировка коллекций"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="bg-[#06070A] text-xs font-mono text-zinc-300 border border-white/[0.08] rounded-xl px-3 py-2 appearance-none focus:outline-none focus:border-indigo-500/60 cursor-pointer pr-8"
              >
                <option value="popularity">Популярные</option>
                <option value="likes">Больше лайков</option>
                <option value="count">Много тайтлов</option>
                <option value="issue">По номеру выпуска</option>
              </select>
              <SlidersHorizontal className="w-3 h-3 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Active Filter Feedback */}
        {(activeTab !== 'all' || searchQuery) && (
          <div className="flex items-center justify-between px-2 text-xs text-zinc-400 font-mono">
            <div>
              Найдено: <strong className="text-white">{filteredCollections.length}</strong> {filteredCollections.length === 1 ? 'коллекция' : 'коллекций'}
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab('all');
                setSearchQuery('');
              }}
              className="text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>

      {/* Grid of Curated Collections */}
      {filteredCollections.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#0A0D14] border border-white/[0.08] text-center space-y-4">
          <Compass className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold font-display text-white">Коллекции не найдены</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto font-sans">
            По запросу «{searchQuery}» ничего не найдено. Попробуйте изменить параметры поиска или выберите другую вкладку.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            Показать все коллекции
          </button>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredCollections.map((col, idx) => (
              <CollectionCard
                key={col.id}
                collection={col}
                index={idx}
                onQuickView={(c) => setSelectedCollection(c)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Interactive Detail Modal */}
      <CollectionModal
        collection={selectedCollection}
        onClose={() => setSelectedCollection(null)}
      />
    </div>
  );
};
