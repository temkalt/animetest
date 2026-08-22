'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Play,
  Check,
  Search,
  Zap,
  Film,
  Sparkles,
  CornerDownLeft,
  Tv,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { syncManager } from '@/lib/dexie/sync';
import { LocalWatchProgress } from '@/lib/dexie/db';

interface EpisodeGridProps {
  animeId: number;
  totalEpisodes: number;
  activeEpisode?: number;
}

export const EpisodeGrid: React.FC<EpisodeGridProps> = ({
  animeId,
  totalEpisodes,
  activeEpisode,
}) => {
  const router = useRouter();
  const chunkSize = 50;
  const totalChunks = Math.max(1, Math.ceil(totalEpisodes / chunkSize));

  const [selectedChunk, setSelectedChunk] = useState<number>(() =>
    activeEpisode ? Math.floor((activeEpisode - 1) / chunkSize) : 0
  );
  const [jumpInput, setJumpInput] = useState<string>('');
  const [jumpError, setJumpError] = useState<boolean>(false);
  const [progressMap, setProgressMap] = useState<Record<number, LocalWatchProgress>>({});
  
  const chunkTabsRef = useRef<HTMLDivElement>(null);

  // Sync selected chunk when activeEpisode changes
  useEffect(() => {
    if (activeEpisode && activeEpisode >= 1 && activeEpisode <= totalEpisodes) {
      const targetChunk = Math.floor((activeEpisode - 1) / chunkSize);
      setSelectedChunk(targetChunk);
    }
  }, [activeEpisode, totalEpisodes]);

  // Load client watch progress from Dexie database
  useEffect(() => {
    let isMounted = true;
    if (typeof window !== 'undefined' && animeId) {
      syncManager
        .getAllAnimeProgress(animeId)
        .then((records) => {
          if (isMounted && records) {
            const map: Record<number, LocalWatchProgress> = {};
            for (const item of records) {
              map[item.episodeNumber] = item;
            }
            setProgressMap(map);
          }
        })
        .catch(() => {
          // Graceful fallback for SSR/offline storage errors
        });
    }
    return () => {
      isMounted = false;
    };
  }, [animeId]);

  // Compute episodes for currently selected chunk
  const startEp = selectedChunk * chunkSize + 1;
  const endEp = Math.min(totalEpisodes, (selectedChunk + 1) * chunkSize);
  const episodesInCurrentChunk = useMemo(() => {
    const list: number[] = [];
    for (let ep = startEp; ep <= endEp; ep++) {
      list.push(ep);
    }
    return list;
  }, [startEp, endEp]);

  // Count total watched episodes
  const totalWatchedCount = useMemo(() => {
    return Object.values(progressMap).filter(
      (p) => p.isCompleted || (p.progressPercentage && p.progressPercentage >= 85)
    ).length;
  }, [progressMap]);

  // Handle fast jump submission
  const handleJump = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const ep = parseInt(jumpInput.trim(), 10);
    if (!isNaN(ep) && ep >= 1 && ep <= totalEpisodes) {
      setJumpError(false);
      router.push(`/watch/${animeId}/${ep}`);
    } else {
      setJumpError(true);
      setTimeout(() => setJumpError(false), 2000);
    }
  };

  const scrollChunks = (direction: 'left' | 'right') => {
    if (chunkTabsRef.current) {
      const amount = direction === 'left' ? -200 : 200;
      chunkTabsRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-4 select-none">
      {/* 1. Gaming HUD Control Header */}
      <div className="p-3.5 sm:p-4 rounded-lg bg-zinc-900 border border-zinc-800  shadow-sm relative overflow-hidden">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5">
          {/* Left: Info HUD & Stats */}
          <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-800 text-zinc-300">
              <Film className="w-3.5 h-3.5 text-zinc-400" />
              <span>
                Всего серий:{' '}
                <strong className="text-white font-bold">{totalEpisodes}</strong>
              </span>
            </div>

            {totalWatchedCount > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-800 text-zinc-300">
                <Check className="w-3.5 h-3.5 text-zinc-400" />
                <span>
                  Просмотрено: <strong>{totalWatchedCount}</strong>
                </span>
                <span className="text-[10px] text-zinc-400/70">
                  ({Math.round((totalWatchedCount / totalEpisodes) * 100)}%)
                </span>
              </div>
            )}

            {activeEpisode && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-800 text-zinc-300">
                <span className="relative flex h-2 w-2">
                  <span className=" absolute inline-flex h-full w-full rounded-lg bg-zinc-800 opacity-75"></span>
                  <span className="relative inline-flex rounded-lg h-2 w-2 bg-zinc-800"></span>
                </span>
                <span>
                  Текущая: <strong className="text-zinc-100">#{activeEpisode}</strong>
                </span>
              </div>
            )}
          </div>

          {/* Right: Fast Number Jump Form & Quick Helpers */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <form onSubmit={handleJump} className="relative flex items-center group w-full sm:w-auto">
              <div className="relative flex items-center flex-1 sm:w-48">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 pointer-events-none group-focus-within:text-zinc-400 transition-colors" />
                <input
                  type="number"
                  min={1}
                  max={totalEpisodes}
                  value={jumpInput}
                  onChange={(e) => {
                    setJumpInput(e.target.value);
                    if (jumpError) setJumpError(false);
                  }}
                  placeholder={`№ (1–${totalEpisodes})`}
                  className={`w-full pl-8 pr-8 py-1.5 rounded-lg bg-zinc-950 border text-xs font-mono text-zinc-100 placeholder-zinc-500 focus:outline-none transition-all ${
                    jumpError
                      ? 'border-zinc-800 -500/30 text-zinc-300'
                      : 'border-zinc-800 focus:border-zinc-800 focus:ring-2 focus:ring-cyan-500/20'
                  }`}
                />
                <kbd className="absolute right-2.5 hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono text-zinc-400 bg-zinc-800 rounded border border-zinc-800 pointer-events-none">
                  ↵
                </kbd>
              </div>

              <button
                type="submit"
                className="ml-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-zinc-100 text-xs font-mono font-semibold shadow-sm  active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <span>Перейти</span>
                <CornerDownLeft className="w-3 h-3 text-zinc-200" />
              </button>
            </form>

            {/* Quick shortcuts for long anime */}
            {totalEpisodes > 50 && (
              <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono">
                <button
                  type="button"
                  onClick={() => router.push(`/watch/${animeId}/1`)}
                  className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
                  title="Первая серия"
                >
                  №1
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/watch/${animeId}/${totalEpisodes}`)}
                  className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer"
                  title="Последняя серия"
                >
                  №{totalEpisodes}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. 50-Episode Chunk Selector Tabs */}
        {totalChunks > 1 && (
          <div className="mt-3 pt-3 border-t border-zinc-800 relative">
            <div className="flex items-center gap-1.5">
              {/* Left Scroll Button */}
              <button
                type="button"
                onClick={() => scrollChunks('left')}
                className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer shrink-0 hidden sm:flex items-center justify-center"
                aria-label="Назад"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Scrollable Chunk Pills Container */}
              <div
                ref={chunkTabsRef}
                className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-0.5 flex-1 scroll-smooth"
              >
                {Array.from({ length: totalChunks }).map((_, idx) => {
                  const cStart = idx * chunkSize + 1;
                  const cEnd = Math.min(totalEpisodes, (idx + 1) * chunkSize);
                  const isSelected = selectedChunk === idx;
                  const hasActiveEp =
                    activeEpisode &&
                    activeEpisode >= cStart &&
                    activeEpisode <= cEnd;

                  // Count completed episodes in this specific chunk
                  let chunkWatchedCount = 0;
                  for (let i = cStart; i <= cEnd; i++) {
                    const p = progressMap[i];
                    if (p?.isCompleted || (p?.progressPercentage ?? 0) >= 85) {
                      chunkWatchedCount++;
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedChunk(idx)}
                      className={`relative group px-3.5 py-1.5 rounded-lg text-xs font-mono font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-2 shrink-0 border ${
                        isSelected
                          ? 'text-zinc-100 border-zinc-700'
                          : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 border-zinc-800'
                      }`}
                    >
                      {/* Animated Tab Background */}
                      {isSelected && (
                        <motion.div
                          layoutId="activeEpChunk"
                          className="absolute inset-0 bg-zinc-800 rounded-lg"
                          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                        />
                      )}

                      {/* Content (Z-indexed above background) */}
                      <div className="relative z-10 flex items-center gap-2">
                        {/* Active Indicator Neon LED */}
                        {isSelected && (
                          <span className="w-1.5 h-1.5 rounded-lg bg-zinc-300" />
                        )}

                        {/* Current Playing Indicator Pulse Pip (if not selected) */}
                        {!isSelected && hasActiveEp && (
                          <span className="relative flex h-2 w-2">
                            <span className=" absolute inline-flex h-full w-full rounded-lg bg-zinc-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-lg h-2 w-2 bg-zinc-500"></span>
                          </span>
                        )}

                        <span>
                          {cStart} – {cEnd}
                        </span>

                        {/* Chunk watched count mini pill */}
                        {chunkWatchedCount > 0 && (
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded-lg font-mono ${
                              isSelected
                                ? 'bg-zinc-700 text-zinc-100'
                                : 'bg-zinc-800 text-zinc-400 border border-zinc-800'
                            }`}
                          >
                            {chunkWatchedCount}/{cEnd - cStart + 1}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Right Scroll Button */}
              <button
                type="button"
                onClick={() => scrollChunks('right')}
                className="p-1 rounded-lg bg-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors cursor-pointer shrink-0 hidden sm:flex items-center justify-center"
                aria-label="Вперед"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Episodes Modern Cyber Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-2 sm:gap-2.5">
        {episodesInCurrentChunk.map((epNum) => {
          const isCurrent = epNum === activeEpisode;
          const prog = progressMap[epNum];
          const isCompleted =
            prog?.isCompleted || (prog?.progressPercentage ?? 0) >= 85;
          const inProgressPercentage =
            !isCompleted && prog?.progressPercentage && prog.progressPercentage > 5
              ? Math.round(prog.progressPercentage)
              : null;

          return (
            <motion.a
              key={epNum}
              href={`/watch/${animeId}/${epNum}`}
              whileHover={{ scale: 1.05 }}
              onClick={(e) => {
                e.preventDefault();
                router.push(`/watch/${animeId}/${epNum}`);
              }}
              className={`group relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-lg border transition-colors duration-200 cursor-pointer overflow-hidden ${
                isCurrent
                  ? 'bg-zinc-800 border-zinc-700 text-zinc-100'
                  : isCompleted
                  ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-700 text-zinc-200 hover:text-zinc-100'
                  : 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-zinc-100'
              }`}
            >
              {isCurrent && (
                <motion.div
                  layoutId="activeEpIndicator"
                  className="absolute inset-0 border-2 border-zinc-600 rounded-lg pointer-events-none"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}

              {/* Status Header: Playing Pulse / Completed Check / Progress Pill */}
              <div className="w-full flex items-center justify-between min-h-[14px] mb-1 z-10 relative">
                {isCurrent ? (
                  <span className="flex items-center gap-1 text-[9px] font-mono font-bold text-zinc-100 uppercase tracking-tight">
                    <span>LIVE</span>
                  </span>
                ) : isCompleted ? (
                  <span
                    className="flex items-center justify-center w-4 h-4 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400"
                    title="Просмотрено"
                  >
                    <Check className="w-2.5 h-2.5" />
                  </span>
                ) : inProgressPercentage ? (
                  <span className="text-[9px] font-mono text-zinc-400 font-medium">
                    {inProgressPercentage}%
                  </span>
                ) : (
                  <span />
                )}

                {/* Hover Play Icon reveal in top right */}
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-200 transform scale-75 group-hover:scale-100">
                  <Play className="w-3 h-3 text-zinc-300" />
                </div>
              </div>

              {/* Central Episode Number with Minimal Typography */}
              <div className="flex flex-col items-center justify-center my-0.5 z-10 relative">
                <span
                  className={`text-base sm:text-lg font-mono font-black tracking-tight transition-colors ${
                    isCurrent
                      ? 'text-zinc-100'
                      : isCompleted
                      ? 'text-zinc-200 group-hover:text-zinc-100'
                      : 'text-zinc-300 group-hover:text-zinc-200'
                  }`}
                >
                  {epNum}
                </span>
                <span
                  className={`text-[9px] uppercase tracking-wider font-mono font-semibold transition-colors ${
                    isCurrent
                      ? 'text-zinc-300'
                      : isCompleted
                      ? 'text-zinc-500 group-hover:text-zinc-400'
                      : 'text-zinc-500 group-hover:text-zinc-400'
                  }`}
                >
                  Серия
                </span>
              </div>

              {/* Bottom In-Progress Mini Bar Indicator */}
              {inProgressPercentage && (
                <div className="w-full mt-1.5 h-1 bg-zinc-800 rounded-lg overflow-hidden z-10 relative">
                  <div
                    className="h-full bg-zinc-400 rounded-lg"
                    style={{ width: `${inProgressPercentage}%` }}
                  />
                </div>
              )}
            </motion.a>
          );
        })}
      </div>
    </div>
  );
};

