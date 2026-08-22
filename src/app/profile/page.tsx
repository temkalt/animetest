'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { GenreRadarChart } from '@/components/profile/GenreRadarChart';
import { syncManager } from '@/lib/dexie/sync';
import { LocalWatchProgress, LocalBookmarkItem } from '@/lib/dexie/db';
import { authStore, UserProfile, DEFAULT_AVATARS } from '@/lib/auth/user-store';
import { AuthModal } from '@/components/auth/AuthModal';
import {
  User,
  Shield,
  Clock,
  Film,
  Flame,
  Award,
  Heart,
  Play,
  Edit3,
  LogIn,
  Sparkles,
  Check,
  Bookmark,
  Zap,
} from 'lucide-react';

const ACHIEVEMENTS = [
  { id: 'first-step', title: 'Первый Шаг', desc: 'Начато первое аниме', icon: Play, unlocked: true },
  { id: 'marathon', title: 'Ночной Марафон', desc: '10+ серий за день', icon: Flame, unlocked: true },
  { id: 'collector', title: 'Хранитель Знаний', desc: '20+ закладок в архиве', icon: Bookmark, unlocked: false },
  { id: 'connoisseur', title: 'Ценитель 1080p', desc: '50+ часов просмотра', icon: Zap, unlocked: false },
];

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
    syncManager.getRecentHistory(16).then(setHistory);
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
  const xpProgress = Math.round(((totalSeconds % 1800) / 1800) * 100);

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
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* 1. Holographic Otaku Gamer Passport */}
      <div className="relative rounded-lg bg-zinc-900 border border-zinc-800 p-6 sm:p-10 overflow-hidden group">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          {/* Avatar & User Details */}
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-lg overflow-hidden border-2 border-zinc-700 shrink-0">
              <div className="relative w-full h-full bg-[#070910]">
                {user ? (
                  <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#070910] flex items-center justify-center font-display font-black text-3xl text-white">
                    KN
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight">
                  {user ? user.name : 'Гость Отаку'}
                </h1>
                <span className="px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-mono font-bold tracking-wider">
                  {rank}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                <span>@{user ? user.username : 'guest'}</span>
                <span>•</span>
                <span className="text-zinc-100 font-bold">Уровень {level}</span>
              </div>

              {/* XP Progress Bar */}
              <div className="space-y-1 pt-1 max-w-xs">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>XP Прогресс</span>
                  <span className="text-zinc-100 font-bold">{xpProgress}% до след. уровня</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-400 rounded-full transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>

              {user?.bio && <p className="text-xs text-zinc-300 font-sans pt-1 max-w-md">{user.bio}</p>}
            </div>
          </div>

          {/* Stats Metrics & Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full md:w-auto justify-between md:justify-end">
            <div className="grid grid-cols-3 gap-6 sm:gap-8 border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-8 text-center w-full sm:w-auto">
              <div className="space-y-0.5">
                <div className="text-xl sm:text-2xl font-black font-mono text-zinc-100">{totalHours}ч</div>
                <div className="text-[11px] text-zinc-400 font-sans">Просмотрено</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-xl sm:text-2xl font-black font-mono text-zinc-100">{history.length}</div>
                <div className="text-[11px] text-zinc-400 font-sans">Серий начато</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-xl sm:text-2xl font-black font-mono text-zinc-100">{completedEpisodes}</div>
                <div className="text-[11px] text-zinc-400 font-sans">Завершено</div>
              </div>
            </div>

            <div className="shrink-0">
              {user ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-all cursor-pointer shadow-sm hover:scale-105"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Редактировать</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white text-zinc-900 hover:bg-zinc-200 text-xs font-semibold transition-all cursor-pointer hover:scale-105"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Войти в аккаунт</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Edit Form Drawer */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mt-8 pt-8 border-t border-zinc-800 space-y-5 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Имя / Никнейм</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-600"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">О себе</label>
                <input
                  type="text"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Ваш любимый жанр или тайтл..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-zinc-600"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Выберите аватар отаку</label>
              <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                {DEFAULT_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setEditAvatar(av)}
                    className={`relative w-14 h-14 rounded-lg overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      editAvatar === av
                        ? 'border-zinc-400 scale-105'
                        : 'border-zinc-700 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image src={av} alt="Avatar" fill className="object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                className="px-5 py-2 rounded-lg bg-white text-zinc-900 hover:bg-zinc-200 text-xs font-semibold transition-all cursor-pointer"
              >
                Сохранить изменения
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white text-xs transition-all cursor-pointer"
              >
                Отмена
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. Otaku Achievements Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {ACHIEVEMENTS.map((ach) => {
          const Icon = ach.icon;
          return (
            <div
              key={ach.id}
              className={`p-4 rounded-lg border transition-all flex items-center gap-3.5 ${
                ach.unlocked
                  ? 'bg-zinc-900 border-zinc-700 shadow-sm'
                  : 'bg-zinc-950 border-zinc-800 opacity-40'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  ach.unlocked
                    ? 'bg-zinc-800 text-zinc-300 border border-zinc-700'
                    : 'bg-zinc-900 text-zinc-300'
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-white truncate">{ach.title}</h4>
                <p className="text-[10px] text-zinc-400 truncate">{ach.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Genre Radar & Watch History / Bookmarks Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Matrix Card */}
        <GenreRadarChart className="h-full" />

        {/* History / Bookmarks Panel */}
        <div className="lg:col-span-2 p-6 sm:p-8 rounded-lg bg-zinc-900 border border-zinc-800 space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'history'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>История ({history.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('bookmarks')}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'bookmarks'
                    ? 'bg-zinc-800 text-white'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Закладки ({bookmarks.length})</span>
              </button>
            </div>
          </div>

          {activeTab === 'history' ? (
            history.length === 0 ? (
              <div className="py-16 text-center text-xs text-zinc-500 font-mono space-y-3">
                <Clock className="w-8 h-8 text-zinc-600 mx-auto" />
                <p>История просмотров пуста</p>
                <Link
                  href="/catalog"
                  className="inline-block px-4 py-2 rounded-lg bg-zinc-800 text-white text-xs font-semibold shadow-sm hover:bg-zinc-700"
                >
                  Перейти в каталог →
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
                {history.map((h) => (
                  <Link
                    key={`${h.animeId}-${h.episodeNumber}`}
                    href={`/watch/${h.animeId}/${h.episodeNumber}`}
                    className="flex items-center justify-between p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center font-mono font-bold text-xs">
                        #{h.episodeNumber}
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs sm:text-sm font-bold text-zinc-100 group-hover:text-white transition-colors">
                          Аниме тайтл #{h.animeId}
                        </h4>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          Прогресс: {Math.round(h.progressPercentage || 0)}% • {Math.floor((h.currentTimeSeconds || 0) / 60)} мин
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {h.isCompleted && (
                        <span className="px-2.5 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 text-[10px] font-mono border border-zinc-700">
                          Завершено
                        </span>
                      )}
                      <Play className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )
          ) : bookmarks.length === 0 ? (
            <div className="py-16 text-center text-xs text-zinc-500 font-mono space-y-3">
              <Bookmark className="w-8 h-8 text-zinc-600 mx-auto" />
              <p>У вас пока нет сохраненных закладок</p>
              <Link
                href="/catalog"
                className="inline-block px-4 py-2 rounded-lg bg-zinc-800 text-white text-xs font-semibold shadow-sm hover:bg-zinc-700"
              >
                Выбрать в каталоге →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[420px] overflow-y-auto pr-1 scrollbar-thin">
              {bookmarks.map((b) => (
                <Link
                  key={b.animeId}
                  href={`/anime/${b.animeId}`}
                  className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center gap-3.5 group"
                >
                  <div className="w-11 h-11 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center font-mono font-bold text-xs shrink-0">
                    #{b.animeId}
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-100 group-hover:text-white transition-colors truncate">
                      Аниме тайтл #{b.animeId}
                    </h4>
                    <span className="text-[10px] text-zinc-400 font-mono block">
                      Статус: {b.status} {b.score ? `• Оценка: ${b.score}/10` : ''}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  );
}
