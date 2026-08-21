'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GenreRadarChart } from '@/components/profile/GenreRadarChart';
import { syncManager } from '@/lib/dexie/sync';
import { LocalWatchProgress, LocalBookmarkItem } from '@/lib/dexie/db';
import { authStore, UserProfile, DEFAULT_AVATARS } from '@/lib/auth/user-store';
import { AuthModal } from '@/components/auth/AuthModal';
import { User, Shield, Clock, Film, Flame, Award, Heart, Play, Edit3, LogIn, Sparkles, Check } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  const [history, setHistory] = useState<LocalWatchProgress[]>([]);
  const [bookmarks, setBookmarks] = useState<LocalBookmarkItem[]>([]);

  useEffect(() => {
    syncManager.getRecentHistory(8).then(setHistory);
    syncManager.getAllBookmarks().then(setBookmarks);
    return authStore.subscribe((u) => {
      setUser(u);
      if (u) {
        setEditName(u.name);
        setEditBio(u.bio || '');
        setEditAvatar(u.avatar);
      }
    });
  }, []);

  const totalSeconds = history.reduce((acc, curr) => acc + (curr.currentTimeSeconds || 0), 0);
  const totalHours = (totalSeconds / 3600).toFixed(1);
  const completedEpisodes = history.filter((h) => h.isCompleted).length;
  const rank = totalHours >= '50' ? 'S-TIER ARCHIVIST' : totalHours >= '10' ? 'A-TIER EXPLORER' : 'NOVICE OTAKU';
  const level = Math.max(1, Math.floor(totalSeconds / 1800) + (user?.level || 1) - 1);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    authStore.updateProfile({
      name: editName,
      bio: editBio,
      avatar: editAvatar,
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      {/* 1. Otaku Passport Header */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-[#0E1017] via-[#141722] to-[#0E1017] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Glow orb */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full filter blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-violet-500 shadow-[0_0_25px_rgba(139,92,246,0.5)] flex-shrink-0 bg-slate-900">
              {user ? (
                <Image src={user.avatar} alt={user.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-[#07080B] flex items-center justify-center font-display font-extrabold text-2xl text-white">
                  KN
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold font-display text-white">
                  {user ? user.name : 'Гость Отаку'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[10px] font-mono font-bold">
                  {rank}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {user ? user.email : 'guest@kuronami.io'} • Уровень {level} • В клубе с {user?.joinedAt || '2026-08'}
              </p>
              {user?.bio && <p className="text-xs text-slate-300 font-sans pt-1">{user.bio}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
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

            <div className="flex items-center gap-2">
              {user ? (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Редактировать</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-display font-semibold text-xs shadow-[0_0_15px_rgba(139,92,246,0.4)] transition-all"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Создать профиль</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Edit Drawer */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-white/10 space-y-4 relative z-10">
            <h4 className="text-sm font-bold font-display text-white">Редактирование профиля:</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Никнейм:</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#07080B] border border-white/10 text-white text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-mono text-slate-300">Статус / Описание:</label>
                <input
                  type="text"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#07080B] border border-white/10 text-white text-xs"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300">Выбор аватара:</label>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                {DEFAULT_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setEditAvatar(av)}
                    className={`relative w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 transition-all ${
                      editAvatar === av ? 'ring-2 ring-violet-500 scale-105' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={av} alt="Avatar" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold font-mono transition-colors"
              >
                Сохранить изменения
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 text-xs font-mono"
              >
                Отмена
              </button>
            </div>
          </form>
        )}
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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
