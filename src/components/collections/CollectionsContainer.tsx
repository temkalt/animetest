'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  X,
  Compass,
  Plus,
} from 'lucide-react';
import { EditorialCollection, COLLECTIONS_DATA } from '@/data/collections';
import { FeaturedCollection } from './FeaturedCollection';
import { CollectionCard } from './CollectionCard';
import { CollectionModal } from './CollectionModal';
import { CreateCollectionModal } from './CreateCollectionModal';
import { UserCollectionModal } from './UserCollectionModal';
import { SPRINGS } from '@/lib/motion-presets';
import { authStore } from '@/lib/auth/user-store';
import { UserCollection } from '@/types';

type FilterCategory = 'all' | 'sakuga' | 'cyberpunk' | 'fantasy' | 'seinen' | 'romance';
type SortOption = 'popularity' | 'count' | 'issue';

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
  const [selectedUserCollection, setSelectedUserCollection] = useState<UserCollection | null>(null);
  
  const [userCollections, setUserCollections] = useState<UserCollection[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isAuthenticated = authStore.isAuthenticated();

  useEffect(() => {
    const unsubscribe = authStore.subscribeCollections((collections) => {
      const user = authStore.getUser();
      if (user) {
        setUserCollections(collections.filter(c => c.userId === user.id));
      } else {
        setUserCollections([]);
      }

      // Update active user collection if open
      setSelectedUserCollection((prev) => {
        if (!prev) return null;
        return collections.find((c) => c.id === prev.id) || null;
      });
    });
    return () => unsubscribe();
  }, []);

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
      if (sortBy === 'count') return b.count - a.count;
      if (sortBy === 'issue') return a.issueNumber.localeCompare(b.issueNumber);
      return a.issueNumber.localeCompare(b.issueNumber);
    });
  }, [activeTab, searchQuery, sortBy]);

  return (
    <div className="space-y-10 sm:space-y-12 pb-16">
      {/* Editorial Header Section */}
      <div className="pt-2 space-y-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display text-zinc-100 tracking-tight leading-none">
              Коллекции
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 font-sans leading-relaxed max-w-xl">
              Авторские антологии с покадровой селекцией, глубоким разбором анимации и высоким разрешением Full HD 1080p.
            </p>
          </div>

          {/* Quick Metrics Cards */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
              <span className="text-base sm:text-lg font-extrabold font-display text-zinc-100 block leading-tight">
                {COLLECTIONS_DATA.length}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Антологий
              </span>
            </div>

            <div className="px-4 py-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-center">
              <span className="text-base sm:text-lg font-extrabold font-display text-zinc-100 block leading-tight">
                190+
              </span>
              <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                Шедевров
              </span>
            </div>
          </div>
        </div>
      </div>

      {isAuthenticated && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-zinc-100">Мои коллекции</h2>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Создать
            </button>
          </div>
          {userCollections.length === 0 ? (
            <div className="p-8 rounded-lg bg-zinc-900 border border-zinc-800 text-center text-zinc-400 text-sm">
              У вас пока нет своих коллекций. Нажмите «Создать», чтобы собрать первую подборку!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userCollections.map((col) => (
                <div
                  key={col.id}
                  onClick={() => setSelectedUserCollection(col)}
                  className="p-5 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group flex flex-col justify-between space-y-3 shadow-sm hover:scale-[1.01]"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {col.isPublic ? 'Публичная' : 'Приватная'}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">
                        {col.animeIds.length} тайтлов
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-zinc-100 group-hover:text-white transition-colors truncate">
                      {col.title}
                    </h3>
                    <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                      {col.description || 'Без описания'}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span>Открыть коллекцию →</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <CreateCollectionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      
      {/* User Collection Detail Modal */}
      <UserCollectionModal
        collection={selectedUserCollection}
        onClose={() => setSelectedUserCollection(null)}
      />

      {/* Featured Magazine Showcase */}
      {featured && activeTab === 'all' && !searchQuery && (
        <FeaturedCollection
          collection={featured}
          onQuickView={(col) => setSelectedCollection(col)}
        />
      )}

      {/* Filter Tabs & Search Control Bar */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-3 sm:p-4 rounded-lg bg-zinc-900 border border-zinc-800">
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
                  className={`relative px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all duration-300 shrink-0 cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'text-zinc-100 bg-zinc-800'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono transition-colors ${
                      isActive
                        ? 'bg-zinc-700 text-zinc-100'
                        : 'bg-zinc-800 text-zinc-400'
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
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-8 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 transition-all font-sans"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-100"
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
                className="bg-zinc-950 text-xs font-mono text-zinc-300 border border-zinc-800 rounded-lg px-3 py-2 appearance-none focus:outline-none focus:border-zinc-700 cursor-pointer pr-8"
              >
                <option value="popularity">По порядку</option>
                <option value="count">Больше тайтлов</option>
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
              Найдено: <strong className="text-zinc-100">{filteredCollections.length}</strong> {filteredCollections.length === 1 ? 'коллекция' : 'коллекций'}
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveTab('all');
                setSearchQuery('');
              }}
              className="text-zinc-100 hover:text-white transition-colors cursor-pointer"
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>

      {/* Grid of Curated Collections */}
      {filteredCollections.length === 0 ? (
        <div className="p-16 rounded-lg bg-zinc-900 border border-zinc-800 text-center space-y-4">
          <Compass className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="text-lg font-bold font-display text-zinc-100">Коллекции не найдены</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto font-sans">
            По запросу «{searchQuery}» ничего не найдено. Попробуйте изменить параметры поиска или выберите другую вкладку.
          </p>
          <button
            type="button"
            onClick={() => {
              setActiveTab('all');
              setSearchQuery('');
            }}
            className="px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-900 text-xs font-semibold transition-all cursor-pointer"
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
