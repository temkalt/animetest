'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GenreRadarChart } from '@/components/profile/GenreRadarChart';
import { syncManager } from '@/lib/dexie/sync';
import { LocalWatchProgress, LocalBookmarkItem } from '@/lib/dexie/db';
import { authStore, UserProfile, DEFAULT_AVATARS } from '@/lib/auth/user-store';
import { AuthModal } from '@/components/auth/AuthModal';
import { User, Shield, Clock, Film, Flame, Award, Heart, Play, Edit3, LogIn, Sparkles, Check, Bookmark } from 'lucide-react';

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  const [history, setHistory] = useState<LocalWatchProgress[]>([]);
  const [bookmarks, setBookmarks] = useState<LocalBookmarkItem[]>([]);
  const [activeTab, setActiveTab] = useState<'history' | 'bookmarks'>('history');

  useEffect(() => {
    syncManager.getRecentHistory(12).then(setHistory);
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
      {/* 1. Otaku Passport Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#0E1118] border border-white/[0.08] shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-lg shadow-indigo-500/30 flex-shrink-0 bg-zinc-900">
              {user ? (
                <Image src={user.avatar} alt={user.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full bg-[#08090D] flex items-center justify-center font-display font-extrabold text-2xl text-white">
                  KN
                </div>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
                  {user ? user.name : 'Гость Отаку'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono font-bold">
                  {rank}
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono">
                {user ? user.email : 'guest@kuronami.io'} • Уровень {level}
              </p>
              {user?.bio && <p className="text-xs text-zinc-300 font-sans pt-1">{user.bio}</p>}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="grid grid-cols-3 gap-6 border-t md:border-t-0 md:border-l border-white/[0.08] pt-4 md:pt-0 md:pl-8 text-center">
              <div>
                <div className="text-lg font-bold font-mono text-cyan-400">{totalHours}ч</div>
                <div className="text-[10px] text-zinc-400 font-sans">Просмотрено</div>
              </div>
              <div>
                <div className="text-lg font-bold font-mono text-indigo-400">{history.length}</div>
                <div className="text-[10px] text-zinc-400 font-sans">Серий начато</div>
              </div>
              <div>
                <div className="text-lg font-bold font-mono text-emerald-400">{completedEpisodes}</div>
                <div className="text-[10px] text-zinc-400 font-sans">Завершено</div>
              </div>
            </div>

            {user ? (
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 text-xs font-semibold border border-white/[0.08] transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Редактировать</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Войти в аккаунт</span>
              </button>
            )}
          </div>
        </div>

        {/* Profile Edit Form Drawer */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-white/[0.08] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">Имя</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-[#08090D] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">О себе</label>
                <input
                  type="text"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Ваш любимый жанр или тайтл..."
                  className="w-full bg-[#08090D] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500/60"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-2">Выберите аватар</label>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {DEFAULT_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setEditAvatar(av)}
                    className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                      editAvatar === av ? 'border-indigo-500 scale-105 shadow-md shadow-indigo-500/40' : 'border-white/10 opacity-60 hover:opacity-100'
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
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all"
              >
                Сохранить профиль
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-white/[0.06] text-zinc-400 hover:text-white text-xs transition-all"
              >
                Отмена
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. Genre Radar & Watch History Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart Component */}
        <div className="p-6 rounded-3xl bg-[#0E1118] border border-white/[0.08] space-y-4 shadow-xl flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-bold font-display text-white">Вкусовые предпочтения</h3>
            <p className="text-xs text-zinc-400 font-sans">
              Радар любимых жанров формируется на основе вашей истории просмотров.
            </p>
          </div>
          <div className="flex items-center justify-center py-4">
            <GenreRadarChart />
          </div>
        </div>

        {/* History / Bookmarks List */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-[#0E1118] border border-white/[0.08] space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                История ({history.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bookmarks')}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === 'bookmarks'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Закладки ({bookmarks.length})
              </button>
            </div>
          </div>

          {activeTab === 'history' ? (
            history.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500 font-mono space-y-2">
                <Clock className="w-8 h-8 text-zinc-600 mx-auto" />
                <p>История просмотров пуста</p>
                <Link href="/catalog" className="text-indigo-400 hover:underline">
                  Перейти в каталог →
                </Link>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
                {history.map((h) => (
                  <Link
                    key={`${h.animeId}-${h.episodeNumber}`}
                    href={`/watch/${h.animeId}/${h.episodeNumber}`}
                    className="flex items-center justify-between p-3 rounded-2xl bg-[#131722] border border-white/[0.05] hover:border-indigo-500/40 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-mono font-bold text-xs">
                        #{h.episodeNumber}
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors">
                          Аниме тайтл #{h.animeId}
                        </h4>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          Прогресс: {h.progressPercentage.toFixed(0)}% • {Math.floor(h.currentTimeSeconds / 60)} мин
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {h.isCompleted && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                          Завершено
                        </span>
                      )}
                      <Play className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : (
            bookmarks.length === 0 ? (
              <div className="py-12 text-center text-xs text-zinc-500 font-mono space-y-2">
                <Bookmark className="w-8 h-8 text-zinc-600 mx-auto" />
                <p>У вас пока нет закладок</p>
                <Link href="/catalog" className="text-indigo-400 hover:underline">
                  Выбрать аниме в каталоге →
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1 scrollbar-thin">
                {bookmarks.map((b) => (
                  <Link
                    key={b.animeId}
                    href={`/anime/${b.animeId}`}
                    className="p-3 rounded-2xl bg-[#131722] border border-white/[0.05] hover:border-indigo-500/40 transition-all flex items-center gap-3 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0">
                      #{b.animeId}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                        Аниме тайтл #{b.animeId}
                      </h4>
                      <span className="text-[10px] text-zinc-400 font-mono block mt-0.5">
                        Статус: {b.status} {b.score ? `• Оценка: ${b.score}/10` : ''}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
