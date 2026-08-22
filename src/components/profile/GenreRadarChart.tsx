'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, LayoutGrid, Clock, Star } from 'lucide-react';

export interface GenrePoint {
  genre: string;
  value: number; // percentage
  count?: number;
}

export interface GenreRadarProps {
  data?: GenrePoint[];
  className?: string;
  totalWatched?: number;
  totalHours?: number;
  averageScore?: number;
}

export const GenreRadarChart: React.FC<GenreRadarProps> = ({
  data = [],
  className = '',
  totalWatched = 0,
  totalHours = 0,
  averageScore = 0,
}) => {
  const topGenre = data.length > 0 ? data[0] : null;

  if (data.length === 0) {
    return (
      <div className={`w-full p-6 rounded-lg bg-zinc-900 border border-zinc-800 ${className}`}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center">
            <Activity className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Матрица предпочтений</h3>
            <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-800/50 mt-1 inline-block">
              АНАЛИТИКА ВКУСА
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Activity className="w-8 h-8 text-zinc-600 mb-3" />
          <p className="text-sm text-zinc-400 max-w-[280px]">
            Анализ вкусов формируется в реальном времени на основе просмотренных серий и закладок. Начните просмотр тайтлов в каталоге.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full p-6 rounded-lg bg-zinc-900 border border-zinc-800 flex flex-col gap-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-zinc-800 flex items-center justify-center border border-zinc-700/50">
            <Activity className="w-5 h-5 text-zinc-100" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100">Матрица предпочтений</h3>
            <span className="text-[10px] font-mono text-zinc-400 px-2 py-0.5 rounded bg-zinc-800 mt-1 inline-block border border-zinc-700/50">
              АНАЛИТИКА ВКУСА
            </span>
          </div>
        </div>
        {topGenre && (
          <div className="text-right hidden sm:block">
            <div className="text-[10px] text-zinc-400 uppercase tracking-wider mb-0.5">Любимый жанр</div>
            <div className="text-sm font-medium text-zinc-100">
              {topGenre.genre} <span className="text-zinc-500">•</span> {topGenre.value}%
            </div>
          </div>
        )}
      </div>

      {/* Genre Bars */}
      <div className="flex flex-col gap-3">
        {data.map((item, i) => (
          <div key={item.genre} className="group flex flex-col gap-1.5">
            <div className="flex justify-between items-end text-xs">
              <span className="font-medium text-zinc-200 group-hover:text-white transition-colors">
                {item.genre}
              </span>
              <div className="flex items-center gap-2 font-mono text-[10px]">
                {item.count !== undefined && (
                  <span className="text-zinc-500">{item.count} тайтлов</span>
                )}
                <span className="text-zinc-300 w-8 text-right">{item.value}%</span>
              </div>
            </div>
            <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: 'easeOut' }}
                className="h-full bg-zinc-300 rounded-full"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-zinc-800/50">
        <div className="flex flex-col gap-1 p-3 rounded-lg bg-zinc-800/50 border border-zinc-800 hover:bg-zinc-800 transition-colors">
          <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono uppercase tracking-wider">Тайтлов</span>
          </div>
          <span className="text-sm font-semibold text-zinc-100">{totalWatched}</span>
        </div>
        <div className="flex flex-col gap-1 p-3 rounded-lg bg-zinc-800/50 border border-zinc-800 hover:bg-zinc-800 transition-colors">
          <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono uppercase tracking-wider">Часов</span>
          </div>
          <span className="text-sm font-semibold text-zinc-100">{totalHours}</span>
        </div>
        <div className="flex flex-col gap-1 p-3 rounded-lg bg-zinc-800/50 border border-zinc-800 hover:bg-zinc-800 transition-colors">
          <div className="flex items-center gap-1.5 text-zinc-400 mb-1">
            <Star className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono uppercase tracking-wider">Оценка</span>
          </div>
          <span className="text-sm font-semibold text-zinc-100">{averageScore.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
};
