'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Sparkles, Compass, Flame, PieChart, ArrowRight, BookOpen } from 'lucide-react';
import { BatchAnimeItem } from '@/app/api/anime/batch/route';
import { LocalWatchProgress, LocalBookmarkItem } from '@/lib/dexie/db';

export interface GenreRadarProps {
  history?: LocalWatchProgress[];
  bookmarks?: LocalBookmarkItem[];
  animeMap?: Record<number, BatchAnimeItem>;
  className?: string;
}

const GENRE_RU_MAP: Record<string, string> = {
  Action: 'Экшен',
  Adventure: 'Приключения',
  Comedy: 'Комедия',
  Drama: 'Драма',
  Fantasy: 'Фэнтези',
  Horror: 'Ужасы',
  'Mahou Shoujo': 'Махо-сёдзё',
  Mecha: 'Меха',
  Music: 'Музыка',
  Mystery: 'Детектив',
  Psychological: 'Психология',
  Romance: 'Романтика',
  'Sci-Fi': 'Фантастика',
  'Slice of Life': 'Повседневность',
  Sports: 'Спорт',
  Supernatural: 'Мистика',
  Thriller: 'Триллер',
  Shounen: 'Сёнэн',
  Shonen: 'Сёнэн',
  Seinen: 'Сэйнэн',
};

const GENRE_COLORS = [
  'from-indigo-500 to-purple-600',
  'from-cyan-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-rose-500 to-pink-600',
  'from-violet-500 to-fuchsia-600',
  'from-sky-500 to-indigo-600',
  'from-lime-500 to-emerald-600',
];

export const GenreRadarChart: React.FC<GenreRadarProps> = ({
  history = [],
  bookmarks = [],
  animeMap = {},
  className = '',
}) => {
  // Aggregate real genres from watched and bookmarked anime
  const genreStats = useMemo(() => {
    const counts: Record<string, { en: string; ru: string; count: number }> = {};
    const seenAnime = new Set<number>();

    // 1. Scan history
    history.forEach((h) => {
      seenAnime.add(h.animeId);
      const meta = animeMap[h.animeId];
      if (meta?.genres && Array.isArray(meta.genres)) {
        meta.genres.forEach((g) => {
          const ruName = GENRE_RU_MAP[g] || g;
          if (!counts[ruName]) {
            counts[ruName] = { en: g, ru: ruName, count: 0 };
          }
          counts[ruName].count += 1;
        });
      }
    });

    // 2. Scan bookmarks
    bookmarks.forEach((b) => {
      if (!seenAnime.has(b.animeId)) {
        seenAnime.add(b.animeId);
        const meta = animeMap[b.animeId];
        if (meta?.genres && Array.isArray(meta.genres)) {
          meta.genres.forEach((g) => {
            const ruName = GENRE_RU_MAP[g] || g;
            if (!counts[ruName]) {
              counts[ruName] = { en: g, ru: ruName, count: 0 };
            }
            counts[ruName].count += 1;
          });
        }
      }
    });

    const totalTitles = seenAnime.size;
    const list = Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 6)
      .map((item, idx) => ({
        ...item,
        percentage: totalTitles > 0 ? Math.min(100, Math.round((item.count / totalTitles) * 100)) : 0,
        gradient: GENRE_COLORS[idx % GENRE_COLORS.length],
      }));

    return {
      list,
      totalTitles,
      topGenre: list[0] || null,
      diversityScore: list.length > 0 ? Math.min(100, Math.round(list.length * 16.5)) : 0,
    };
  }, [history, bookmarks, animeMap]);

  return (
    <div className={`p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 shadow-sm flex flex-col justify-between space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 border border-zinc-700">
            <PieChart className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <span>Профиль вкусов</span>
              <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300 border border-zinc-700">
                LIVE
              </span>
            </h3>
            <p className="text-[11px] text-zinc-400">
              {genreStats.totalTitles > 0
                ? `На основе ${genreStats.totalTitles} тайтлов из истории и закладок`
                : 'Анализ жанровых предпочтений в реальном времени'}
            </p>
          </div>
        </div>

        {genreStats.topGenre && (
          <div className="text-right hidden sm:block">
            <div className="text-[10px] font-mono text-zinc-500 uppercase">Фаворит</div>
            <div className="text-xs font-bold text-zinc-200">{genreStats.topGenre.ru}</div>
          </div>
        )}
      </div>

      {/* Main Content */}
      {genreStats.list.length === 0 ? (
        <div className="py-10 text-center space-y-3 px-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-800/60 border border-zinc-750 flex items-center justify-center mx-auto text-zinc-500">
            <Compass className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-bold text-zinc-300">Профиль вкусов пока формируется</h4>
            <p className="text-[11px] text-zinc-500 max-w-xs mx-auto leading-relaxed">
              Начните смотреть серии или добавляйте интересные аниме в закладки — система автоматически рассчитает ваши предпочтения.
            </p>
          </div>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-300 hover:text-white pt-2 transition-colors"
          >
            <span>Перейти в каталог</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top Genre Highlight Card */}
          {genreStats.topGenre && (
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 border border-zinc-700">
                  <Flame className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-[10px] font-mono uppercase text-zinc-500">Любимый жанр</div>
                  <div className="text-xs font-bold text-zinc-100">{genreStats.topGenre.ru}</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-zinc-200">
                {genreStats.topGenre.count} {genreStats.topGenre.count === 1 ? 'тайтл' : 'тайтла'}
              </span>
            </div>
          )}

          {/* Genre Bars List */}
          <div className="space-y-3 pt-1">
            {genreStats.list.map((item, idx) => (
              <div key={item.ru} className="space-y-1.5 group">
                <div className="flex items-center justify-between text-xs">
                  <Link
                    href={`/catalog?genre=${encodeURIComponent(item.en)}`}
                    className="font-medium text-zinc-300 group-hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    <span>{item.ru}</span>
                    <span className="text-[10px] text-zinc-600 group-hover:text-zinc-400 transition-colors">
                      ({item.count})
                    </span>
                  </Link>
                  <span className="font-mono text-xs font-semibold text-zinc-400 group-hover:text-zinc-200 transition-colors">
                    {item.percentage}%
                  </span>
                </div>

                {/* Progress Meter */}
                <div className="w-full h-2 bg-zinc-950 rounded-full overflow-hidden border border-zinc-800/80 p-0.5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.16, 1, 0.3, 1] }}
                    className={`h-full rounded-full bg-gradient-to-r ${item.gradient}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Metrics */}
      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-zinc-800/80">
        <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] font-mono text-zinc-500 uppercase">Разнообразие</div>
            <div className="text-xs font-bold text-zinc-200">
              {genreStats.diversityScore > 0 ? `${genreStats.diversityScore}%` : '0%'}
            </div>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800 flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] font-mono text-zinc-500 uppercase">В архиве</div>
            <div className="text-xs font-bold text-zinc-200">
              {genreStats.totalTitles} {genreStats.totalTitles === 1 ? 'тайтл' : 'тайтлов'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
