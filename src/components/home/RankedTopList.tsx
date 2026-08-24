'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Flame, 
  Star, 
  TrendingUp, 
  ArrowRight,
  Play,
} from 'lucide-react';
import { UnifiedAnime } from '@/types';
import { getRussianGenre } from '@/components/catalog/catalog-data';
import { ensureRussianTitle } from '@/lib/api/russian-titles';

interface RankedTopListProps {
  trendingItems: UnifiedAnime[];
  topRatedItems?: UnifiedAnime[];
  popularItems?: UnifiedAnime[];
}

export const RankedTopList: React.FC<RankedTopListProps> = ({
  trendingItems = [],
  topRatedItems = [],
  popularItems = [],
}) => {
  const [activeTab, setActiveTab] = useState<'trending' | 'top_rated' | 'popular'>('trending');

  const getActiveList = () => {
    switch (activeTab) {
      case 'top_rated':
        return topRatedItems.length > 0 ? topRatedItems.slice(0, 10) : trendingItems.slice(0, 10);
      case 'popular':
        return popularItems.length > 0 ? popularItems.slice(0, 10) : trendingItems.slice(0, 10);
      case 'trending':
      default:
        return trendingItems.slice(0, 10);
    }
  };

  const list = getActiveList();

  return (
    <section className="w-full space-y-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100 flex items-center gap-2">
            Топ Чарты KuroNami
            <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 text-xs font-mono font-medium">
              TOP 10
            </span>
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Самые просматриваемые и высокооценённые аниме
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('trending')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'trending'
                ? 'text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {activeTab === 'trending' && (
              <motion.div layoutId="activeRankedTab" className="absolute inset-0 bg-zinc-800 rounded-lg -z-10" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
            )}
            <Flame className="w-4 h-4 relative z-10" />
            <span className="relative z-10">В тренде</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('top_rated')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'top_rated'
                ? 'text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {activeTab === 'top_rated' && (
              <motion.div layoutId="activeRankedTab" className="absolute inset-0 bg-zinc-800 rounded-lg -z-10" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
            )}
            <Star className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Рейтинг</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('popular')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
              activeTab === 'popular'
                ? 'text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {activeTab === 'popular' && (
              <motion.div layoutId="activeRankedTab" className="absolute inset-0 bg-zinc-800 rounded-lg -z-10" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
            )}
            <TrendingUp className="w-4 h-4 relative z-10" />
            <span className="relative z-10">Популярное</span>
          </button>
        </div>
      </div>

      {/* Main List */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 sm:p-4">
        <motion.div 
          key={activeTab} 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ duration: 0.15, ease: 'easeOut' }}
          className="flex flex-col gap-2"
        >
            {list.map((item, idx) => {
              const rank = idx + 1;
              const title = (item.title.russian && /[а-яё]/i.test(item.title.russian))
                ? item.title.russian
                : ensureRussianTitle({
                    russian: item.title.russian,
                    english: item.title.english,
                    romaji: item.title.romaji,
                    id: item.id,
                    malId: item.malId,
                    slug: item.slug,
                  });
              const cover = item.coverImage.medium || item.coverImage.original || '';
              const isTop3 = rank <= 3;

              return (
                <motion.div key={item.id} whileHover={{ x: 3 }}>
                  <Link
                    href={`/anime/${item.id}`}
                    className="group flex items-center gap-4 p-2 rounded-lg hover:bg-zinc-800/50 hover:border-zinc-700 transition-colors border border-transparent"
                  >
                    {/* Numerical Rank */}
                    <div className="w-8 text-center flex-shrink-0">
                      <span className={`text-lg font-mono ${isTop3 ? 'font-bold text-zinc-100' : 'text-zinc-500'}`}>
                        {rank < 10 ? `0${rank}` : rank}
                      </span>
                    </div>

                    {/* Poster Thumbnail */}
                    <div className="relative w-12 h-16 rounded overflow-hidden bg-zinc-800 flex-shrink-0 border border-zinc-800">
                      {cover ? (
                        <Image
                          src={cover}
                          alt={title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>

                    {/* Title & Metadata */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-zinc-100 truncate group-hover:text-white transition-colors">
                        {title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400 font-mono">
                        <span>{item.format || 'TV'}</span>
                        <span>•</span>
                        <span>{item.seasonYear || '2026'}</span>
                        <span className="hidden sm:inline">•</span>
                        <span className="hidden sm:inline truncate">{getRussianGenre(item.genres?.[0]) || 'Аниме'}</span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-1.5 flex-shrink-0 px-3">
                      <Star className="w-4 h-4 text-zinc-400" />
                      <span className="text-sm font-mono text-zinc-300">
                        {item.score > 0 ? item.score.toFixed(1) : '—'}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
      </div>

      {/* Footer Link */}
      <div className="flex justify-end">
        <Link
          href="/catalog?sort=SCORE_DESC"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors group"
        >
          <span>Смотреть полный рейтинг</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
};
