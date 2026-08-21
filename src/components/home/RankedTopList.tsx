'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Flame, 
  Star, 
  Play, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Check, 
  Clock, 
  Award,
  ChevronRight
} from 'lucide-react';
import { UnifiedAnime } from '@/types';
import { SPRINGS } from '@/lib/motion-presets';

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
  const leader = list[0];
  const restItems = list.slice(1, 10);

  const getRankBadgeStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return {
          badge: 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-black font-black shadow-[0_0_15px_rgba(245,158,11,0.6)] border-amber-300',
          numberColor: 'text-amber-400',
          border: 'border-amber-500/40 hover:border-amber-400/80',
          glow: 'shadow-[0_0_30px_rgba(245,158,11,0.15)]',
        };
      case 2:
        return {
          badge: 'bg-gradient-to-br from-slate-200 via-zinc-300 to-slate-400 text-black font-black shadow-[0_0_15px_rgba(203,213,225,0.4)] border-slate-200',
          numberColor: 'text-slate-300',
          border: 'border-slate-400/30 hover:border-slate-300/70',
          glow: 'shadow-[0_0_25px_rgba(203,213,225,0.1)]',
        };
      case 3:
        return {
          badge: 'bg-gradient-to-br from-amber-600 via-amber-700 to-orange-600 text-white font-black shadow-[0_0_15px_rgba(217,119,6,0.4)] border-amber-500',
          numberColor: 'text-amber-600',
          border: 'border-amber-600/30 hover:border-amber-500/70',
          glow: 'shadow-[0_0_25px_rgba(217,119,6,0.1)]',
        };
      default:
        return {
          badge: 'bg-white/[0.08] text-zinc-300 font-bold border-white/10',
          numberColor: 'text-zinc-500',
          border: 'border-white/[0.06] hover:border-indigo-500/40',
          glow: 'hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]',
        };
    }
  };

  return (
    <section className="w-full space-y-6 select-none">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold font-display tracking-tight text-white">
                Топ Чарты KuroNami
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold">
                TOP 10
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans">
              Самые просматриваемые и высокооценённые аниме платформы
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0E1118] border border-white/[0.08] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('trending')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'trending'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>В тренде</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('top_rated')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'top_rated'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            <span>Рейтинг</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('popular')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'popular'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Популярное</span>
          </button>
        </div>
      </div>

      {/* Main Chart Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Featured #1 Champion Showcase Card (Left, Spans 5 cols) */}
        {leader && (
          <div className="lg:col-span-5 flex flex-col">
            <Link
              href={`/anime/${leader.id}`}
              className="group relative flex-1 rounded-3xl overflow-hidden bg-[#0A0D15] border border-amber-500/40 hover:border-amber-400 shadow-[0_0_35px_rgba(245,158,11,0.15)] flex flex-col justify-end p-6 sm:p-8 transition-all duration-300 hover:scale-[1.01]"
            >
              {/* Background Poster & Backdrop */}
              <div className="absolute inset-0 z-0">
                {leader.bannerImage || leader.coverImage.original ? (
                  <Image
                    src={leader.bannerImage || leader.coverImage.original}
                    alt={leader.title.russian || leader.title.romaji}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-700 filter saturate-[1.1] brightness-[0.8]"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/80 via-40% to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#08090D] via-transparent to-transparent" />
              </div>

              {/* Champion Crown Badge */}
              <div className="absolute top-5 left-5 z-20 flex items-center gap-2">
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 text-black font-extrabold text-xs font-mono shadow-lg shadow-amber-500/40 border border-amber-300">
                  <Award className="w-4 h-4" />
                  <span>#1 В ЧАРТЕ</span>
                </div>

                <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-black/70 backdrop-blur-md text-amber-400 text-xs font-mono font-bold border border-amber-500/30">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{leader.score > 0 ? leader.score.toFixed(1) : '9.5'}</span>
                </div>
              </div>

              {/* Champion Content */}
              <div className="relative z-20 space-y-3 pt-48 sm:pt-60">
                <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 flex-wrap">
                  <span className="text-amber-400 font-bold">{leader.format || 'TV'}</span>
                  <span>•</span>
                  <span>{leader.seasonYear || '2026'}</span>
                  {leader.episodesTotal && (
                    <>
                      <span>•</span>
                      <span>{leader.episodesTotal} серий</span>
                    </>
                  )}
                  {leader.studios?.[0] && (
                    <>
                      <span>•</span>
                      <span className="text-zinc-300 font-semibold">{leader.studios[0]}</span>
                    </>
                  )}
                </div>

                <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-tight drop-shadow-md">
                  {leader.title.russian || leader.title.english || leader.title.romaji}
                </h3>

                <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed font-sans">
                  {leader.synopsisRu || leader.synopsisEn || 'Лидер пользовательского рейтинга KuroNami. Доступно в Full HD 1080p.'}
                </p>

                {/* Direct Watch CTA */}
                <div className="flex items-center gap-3 pt-2">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-display font-bold text-xs shadow-lg shadow-amber-500/30 transition-all group-hover:scale-105">
                    <Play className="w-3.5 h-3.5 fill-black" />
                    <span>Смотреть прямо сейчас</span>
                  </span>

                  <span className="text-xs font-mono text-zinc-400 group-hover:text-white flex items-center gap-1 transition-colors">
                    <span>Подробнее</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Ranked List (#2 - #10) (Right, Spans 7 cols) */}
        <div className="lg:col-span-7 flex flex-col space-y-2">
          {restItems.map((item, idx) => {
            const rank = idx + 2;
            const style = getRankBadgeStyle(rank);
            const title = item.title.russian || item.title.english || item.title.romaji;
            const subtitle = item.title.romaji !== title ? item.title.romaji : item.title.english;
            const cover = item.coverImage.medium || item.coverImage.original || '';

            return (
              <Link
                key={item.id}
                href={`/anime/${item.id}`}
                className={`group relative flex items-center gap-3.5 sm:gap-4 p-2.5 sm:p-3 rounded-2xl bg-[#0A0D15]/80 hover:bg-[#121624] border ${style.border} ${style.glow} transition-all duration-200 hover:translate-x-1`}
              >
                {/* Numerical Rank Badge */}
                <div className="flex-shrink-0 w-8 sm:w-10 text-center font-display font-black">
                  <span className={`text-base sm:text-lg tracking-tight ${style.numberColor}`}>
                    #{rank < 10 ? `0${rank}` : rank}
                  </span>
                </div>

                {/* Poster Thumbnail */}
                <div className="relative w-11 h-15 sm:w-12 sm:h-16 rounded-xl overflow-hidden bg-zinc-900 flex-shrink-0 border border-white/10 shadow-md">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={title}
                      fill
                      sizes="48px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : null}
                </div>

                {/* Title & Metadata */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono text-zinc-400">
                    <span className="text-indigo-400 font-semibold">{item.format || 'TV'}</span>
                    <span>•</span>
                    <span className="truncate">{item.genres?.[0] || 'Аниме'}</span>
                    {item.seasonYear && (
                      <>
                        <span>•</span>
                        <span>{item.seasonYear}</span>
                      </>
                    )}
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold font-display text-white group-hover:text-indigo-300 transition-colors truncate">
                    {title}
                  </h4>

                  {subtitle && (
                    <p className="text-[10px] font-mono text-zinc-400 truncate hidden sm:block">
                      {subtitle}
                    </p>
                  )}
                </div>

                {/* Score & Arrow Action */}
                <div className="flex items-center gap-3 flex-shrink-0 pr-2">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-amber-400 font-mono text-xs font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{item.score > 0 ? item.score.toFixed(1) : '8.5'}</span>
                  </div>

                  <div className="w-8 h-8 rounded-xl bg-white/[0.04] group-hover:bg-indigo-600 text-zinc-500 group-hover:text-white flex items-center justify-center transition-all">
                    <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Catalog Link Footer */}
      <div className="flex justify-end pt-1">
        <Link
          href="/catalog?sort=SCORE_DESC"
          className="inline-flex items-center gap-2 text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-colors group"
        >
          <span>Смотреть полный рейтинг Топ-100</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
};
