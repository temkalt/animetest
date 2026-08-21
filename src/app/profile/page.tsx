'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { GenreRadarChart } from '@/components/profile/GenreRadarChart';
import { syncManager } from '@/lib/dexie/sync';
import { LocalWatchProgress, LocalBookmarkItem } from '@/lib/dexie/db';
import { User, Shield, Clock, Film, Flame, Award, Heart, Play } from 'lucide-react';

export default function ProfilePage() {
  const [history, setHistory] = useState<LocalWatchProgress[]>([]);
  const [bookmarks, setBookmarks] = useState<LocalBookmarkItem[]>([]);

  useEffect(() => {
    syncManager.getRecentHistory(8).then(setHistory);
    syncManager.getAllBookmarks().then(setBookmarks);
  }, []);

  const totalSeconds = history.reduce((acc, curr) => acc + (curr.currentTimeSeconds || 0), 0);
  const totalHours = (totalSeconds / 3600).toFixed(1);
  const completedEpisodes = history.filter((h) => h.isCompleted).length;
  const rank = totalHours >= '50' ? 'S-TIER ARCHIVIST' : totalHours >= '10' ? 'A-TIER EXPLORER' : 'NOVICE OTAKU';
  const level = Math.max(1, Math.floor(totalSeconds / 1800));

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* 1. Otaku Passport Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0E1017] via-[#141722] to-[#0E1017] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-violet-600 via-cyan-500 to-rose-500 p-0.5 shadow-[0_0_25px_rgba(139,92,246,0.4)]">
              <div className="w-full h-full bg-[#07080B] rounded-2xl flex items-center justify-center font-display font-extrabold text-2xl text-white">
                KN
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold font-display text-white">KuroNami Explorer</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[10px] font-mono font-bold">
                  {rank}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">ID: #KN-2026-9840 • Уровень {level}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-8 text-center">
            <div>
              <div className="text-lg font-bold font-mono text-cyan-400">{totalHours}ч</div>
              <div className="text-[10px] text-slate-400 font-sans">Просмотрено</div>
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-violet-400">{history.length}</div>
              <div className="text-[10px] text-slate-400 font-sans">Серий начато</div>
            </div>
            <div>
              <div className="text-lg font-bold font-mono text-rose-400 flex items-center justify-center gap-0.5">
                <Flame className="w-4 h-4 fill-rose-400" />
                <span>{completedEpisodes}</span>
              </div>
              <div className="text-[10px] text-slate-400 font-sans">Завершено</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Passport Matrix & Continue Watching Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Radar Matrix Chart */}
        <div className="lg:col-span-1">
          <GenreRadarChart />
        </div>

        {/* Continue Watching Shelf */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold font-display text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-violet-400" />
              <span>Продолжить просмотр (Local-First)</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">{history.length} тайтлов</span>
          </div>

          {history.length === 0 ? (
            <div className="p-8 rounded-3xl bg-[#0E1017] border border-white/5 text-center space-y-2 text-slate-400 text-xs font-mono">
              <Film className="w-8 h-8 mx-auto text-slate-600 mb-2" />
              <div>Вы еще не начали просмотр тайтлов.</div>
              <Link href="/catalog" className="text-violet-400 hover:underline">
                Перейти в каталог →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {history.map((h) => (
                <Link
                  key={h.id}
                  href={`/watch/${h.animeId}/${h.episodeNumber}`}
                  className="p-4 rounded-2xl bg-[#0E1017] hover:bg-[#141722] border border-white/5 hover:border-violet-500/40 transition-all space-y-3 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white group-hover:text-violet-300">
                      Аниме #{h.animeId}
                    </span>
                    <span className="text-[10px] font-mono text-cyan-400">Серия {h.episodeNumber}</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full"
                        style={{ width: `${Math.min(100, h.progressPercentage)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-mono text-slate-500">
                      <span>{Math.floor(h.currentTimeSeconds / 60)} мин</span>
                      <span>{h.isCompleted ? 'Просмотрено' : `${Math.floor(h.progressPercentage)}%`}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
