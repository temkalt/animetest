'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { GenreRadarChart } from '@/components/profile/GenreRadarChart';
import { syncManager } from '@/lib/dexie/sync';
import { LocalWatchProgress, LocalBookmarkItem } from '@/lib/dexie/db';
import { authStore, UserProfile, DEFAULT_AVATARS, UserCollection } from '@/lib/auth/user-store';
import { AuthModal } from '@/components/auth/AuthModal';
import { AvatarSelector } from '@/components/auth/AvatarSelector';
import { CreateCollectionModal } from '@/components/collections/CreateCollectionModal';
import { UserCollectionModal } from '@/components/collections/UserCollectionModal';
import { BatchAnimeItem } from '@/app/api/anime/batch/route';
import { userActivity } from '@/lib/auth/user-activity';
import {
  User,
  Clock,
  Film,
  Flame,
  Star,
  Play,
  Edit3,
  LogIn,
  Sparkles,
  Check,
  Bookmark,
  Zap,
  Layers,
  Trash2,
  FolderPlus,
  Plus,
  Globe,
  Lock,
  RotateCcw,
  Heart,
  ChevronRight,
  Eye,
  CheckCircle2,
  PauseCircle,
  XCircle,
  ArrowLeft,
  Calendar,
} from 'lucide-react';

const ACHIEVEMENTS = [
  { id: 'first-step', title: 'Первый Шаг', desc: 'Начато первое аниме', icon: Play, unlocked: true },
  { id: 'marathon', title: 'Ночной Марафон', desc: '10+ серий за день', icon: Flame, unlocked: true },
  { id: 'collector', title: 'Хранитель Знаний', desc: '20+ закладок в архиве', icon: Bookmark, unlocked: false },
  { id: 'connoisseur', title: 'Ценитель 1080p', desc: '50+ часов просмотра', icon: Zap, unlocked: false },
];

const BOOKMARK_STATUS_LABELS: Record<string, { label: string; dot: string }> = {
  watching: { label: 'Смотрю', dot: 'bg-emerald-400' },
  planned: { label: 'В планах', dot: 'bg-indigo-400' },
  completed: { label: 'Просмотрено', dot: 'bg-cyan-400' },
  on_hold: { label: 'Отложено', dot: 'bg-amber-400' },
  dropped: { label: 'Брошено', dot: 'bg-rose-400' },
};

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = React.use(params);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [profileView, setProfileView] = useState<Omit<UserProfile, 'email'> | null>(null);
  const [publicCollections, setPublicCollections] = useState<UserCollection[]>([]);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editAvatar, setEditAvatar] = useState('');

  const [history, setHistory] = useState<LocalWatchProgress[]>([]);
  const [bookmarks, setBookmarks] = useState<LocalBookmarkItem[]>([]);
  const [userCollections, setUserCollections] = useState<UserCollection[]>([]);

  const [activeTab, setActiveTab] = useState<'history' | 'bookmarks' | 'collections'>('history');
  const [bookmarkFilter, setBookmarkFilter] = useState<string>('all');

  // Collection modals
  const [isCreateCollectionOpen, setIsCreateCollectionOpen] = useState(false);
  const [selectedUserCollection, setSelectedUserCollection] = useState<UserCollection | null>(null);

  // Batch fetched metadata cache
  const [animeMap, setAnimeMap] = useState<Record<number, BatchAnimeItem>>({});
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(false);

  const loadData = () => {
    const rawUser = decodeURIComponent(username || '');
    const currentUser = authStore.getUser();
    
    if (currentUser?.username === rawUser) {
      setIsOwner(true);
      syncManager.getRecentHistory(40).then(setHistory);
      syncManager.getAllBookmarks().then(setBookmarks);
      setUserCollections(authStore.getUserCollections(currentUser.id));
    } else {
      setIsOwner(false);
      const pub = authStore.getPublicProfile(rawUser);
      setProfileView(pub);
      const cols = authStore.getUserCollections(rawUser);
      setPublicCollections(cols.filter((c) => c.isPublic));
    }
  };

  useEffect(() => {
    loadData();

    const unsubscribeAuth = authStore.subscribe((u) => {
      setUser(u);
      const rawUser = decodeURIComponent(username || '');
      if (u && u.username === rawUser) {
        setIsOwner(true);
        setEditName(u.name);
        setEditBio(u.bio || '');
        setEditAvatar(u.avatar);
        setUserCollections(authStore.getUserCollections(u.id));
      } else {
        setIsOwner(false);
      }
    });

    const unsubscribeCols = authStore.subscribeCollections((cols) => {
      const u = authStore.getUser();
      const rawUser = decodeURIComponent(username || '');
      
      if (u && u.username === rawUser) {
        setUserCollections(cols.filter((c) => c.userId === u.id));
      } else {
        setPublicCollections(cols.filter((c) => c.isPublic && (c.username === rawUser || c.userId === rawUser)));
      }
      
      setSelectedUserCollection((prev) => {
        if (!prev) return null;
        return cols.find((c) => c.id === prev.id) || null;
      });
    });

    return () => {
      unsubscribeAuth();
      unsubscribeCols();
    };
  }, [username]);

  // Collect all unique anime IDs that need metadata resolution
  const allAnimeIds = useMemo(() => {
    const ids = new Set<number>();
    history.forEach((h) => ids.add(h.animeId));
    bookmarks.forEach((b) => ids.add(b.animeId));
    userCollections.forEach((c) => c.animeIds.forEach((id) => ids.add(id)));
    return Array.from(ids);
  }, [history, bookmarks, userCollections]);

  // Fetch metadata in batch for all missing IDs
  useEffect(() => {
    const missingIds = allAnimeIds.filter((id) => !animeMap[id]);
    if (missingIds.length === 0) return;

    let isMounted = true;
    setIsLoadingMetadata(true);

    fetch('/api/anime/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ids: missingIds }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.items) {
          setAnimeMap((prev) => ({ ...prev, ...data.items }));
        }
      })
      .catch((err) => console.error('Error batch fetching anime metadata:', err))
      .finally(() => {
        if (isMounted) setIsLoadingMetadata(false);
      });

    return () => {
      isMounted = false;
    };
  }, [allAnimeIds, animeMap]);

  // Deduplicate / group history by anime (show latest watched episode per anime)
  const groupedHistory = useMemo(() => {
    const map = new Map<number, LocalWatchProgress>();
    // Sort descending by updatedAt
    const sorted = [...history].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    sorted.forEach((item) => {
      if (!map.has(item.animeId)) {
        map.set(item.animeId, item);
      }
    });
    return Array.from(map.values());
  }, [history]);

  // Filter bookmarks
  const filteredBookmarks = useMemo(() => {
    if (bookmarkFilter === 'all') return bookmarks;
    if (bookmarkFilter === 'favorites') return bookmarks.filter((b) => b.isFavorite);
    return bookmarks.filter((b) => b.status === bookmarkFilter);
  }, [bookmarks, bookmarkFilter]);

  const totalSeconds = history.reduce((acc, curr) => acc + (curr.currentTimeSeconds || 0), 0);
  const totalHours = (totalSeconds / 3600).toFixed(1);
  const completedEpisodes = history.filter((h) => h.isCompleted).length;
  const rank =
    parseFloat(totalHours) >= 50
      ? 'S-TIER ARCHIVIST'
      : parseFloat(totalHours) >= 10
      ? 'A-TIER EXPLORER'
      : 'NOVICE OTAKU';
  const level = Math.max(1, Math.floor(totalSeconds / 1800) + (user?.level || 1) - 1);
  const xpProgress = Math.round(((totalSeconds % 1800) / 1800) * 100);

  const averageScore = useMemo(() => {
    const scores = Object.values(animeMap).map(m => m.score).filter(Boolean) as number[];
    if (!scores.length) return 0;
    return scores.reduce((a, b) => a + b, 0) / scores.length;
  }, [animeMap]);

  const genreStats = useMemo(() => {
    const counts: Record<string, number> = {};
    let total = 0;
    
    // Calculate from history
    history.forEach(h => {
      const meta = animeMap[h.animeId];
      if (meta?.genres) {
        meta.genres.forEach(g => {
          counts[g] = (counts[g] || 0) + (h.isCompleted ? 3 : 1);
          total += (h.isCompleted ? 3 : 1);
        });
      }
    });

    // Calculate from bookmarks
    bookmarks.forEach(b => {
      const meta = animeMap[b.animeId];
      if (meta?.genres) {
        meta.genres.forEach(g => {
          counts[g] = (counts[g] || 0) + (b.isFavorite ? 2 : 1);
          total += (b.isFavorite ? 2 : 1);
        });
      }
    });

    // Calculate from userActivity
    const viewStats = userActivity.getAllViewStats();
    viewStats.forEach(v => {
      const meta = animeMap[v.id];
      if (meta?.genres) {
        meta.genres.forEach(g => {
          counts[g] = (counts[g] || 0) + v.viewsCount;
          total += v.viewsCount;
        });
      }
    });

    if (total === 0) return [];

    return Object.entries(counts)
      .map(([genre, count]) => ({
        genre,
        count,
        value: Math.min(100, Math.round((count / total) * 100))
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);
  }, [history, bookmarks, animeMap]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    authStore.updateProfile({
      name: editName,
      bio: editBio,
      avatar: editAvatar,
    });
    setIsEditing(false);
  };

  const handleRemoveBookmark = async (e: React.MouseEvent, animeId: number) => {
    e.preventDefault();
    e.stopPropagation();
    await syncManager.removeBookmark(animeId);
    setBookmarks((prev) => prev.filter((b) => b.animeId !== animeId));
  };

  if (!isOwner) {
    if (!profileView) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
          <p className="text-zinc-400">Пользователь не найден</p>
          <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
            На главную
          </Link>
        </div>
      );
    }
    
    return (
      <div className="max-w-2xl mx-auto space-y-8 pb-16 pt-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Назад
        </Link>

        {/* Profile header */}
        <div className="flex items-start gap-5 p-6 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm">
          <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
            <Image
              src={profileView.avatar}
              alt={profileView.name}
              fill
              sizes="80px"
              className="object-cover w-full h-full"
            />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl font-bold text-zinc-100">{profileView.name}</h1>
            <p className="text-sm text-zinc-400 font-mono">@{profileView.username}</p>
            {profileView.bio && <p className="text-sm text-zinc-300 mt-2 font-sans">{profileView.bio}</p>}
            <div className="flex items-center gap-3 pt-2 text-xs text-zinc-500 font-mono">
              <span className="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300">
                {profileView.role}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {profileView.joinedAt}
              </span>
            </div>
          </div>
        </div>

        {/* User collections */}
        {publicCollections.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-zinc-400" />
              <h2 className="text-lg font-semibold text-zinc-100">Коллекции пользователя</h2>
              <span className="text-sm text-zinc-500 font-mono">({publicCollections.length})</span>
            </div>
            <div className="space-y-2.5">
              {publicCollections.map((col) => (
                <div
                  key={col.id}
                  className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5 hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-sm font-semibold text-zinc-100">{col.title}</h3>
                  {col.description && <p className="text-xs text-zinc-400">{col.description}</p>}
                  <div className="flex items-center gap-3 pt-1 text-xs text-zinc-500 font-mono">
                    <span>{col.animeIds.length} тайтлов</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* 1. Holographic Otaku Gamer Passport */}
      <div className="relative rounded-xl bg-zinc-900/80 border border-zinc-800 p-6 sm:p-8 overflow-hidden shadow-sm backdrop-blur-md">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          {/* Avatar & User Details */}
          <div className="flex items-center gap-5">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border border-zinc-700 shrink-0 bg-zinc-950">
              {user ? (
                <Image src={user.avatar} alt={user.name} fill className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-display font-black text-2xl text-zinc-300">
                  KN
                </div>
              )}
            </div>

            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-zinc-100 tracking-tight">
                  {user ? user.name : 'Гость Отаку'}
                </h1>
                <span className="px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 text-[11px] font-mono font-bold">
                  {rank}
                </span>
              </div>

              <div className="flex items-center gap-2.5 text-xs font-mono text-zinc-400">
                <span>@{user ? user.username : 'guest'}</span>
                <span>•</span>
                <span className="text-zinc-200 font-semibold">Уровень {level}</span>
              </div>

              {/* XP Progress Bar */}
              <div className="space-y-1 pt-1 max-w-xs">
                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                  <span>XP Прогресс</span>
                  <span className="text-zinc-200 font-bold">{xpProgress}% до след. уровня</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-zinc-300 rounded-full transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
              </div>

              {user?.bio && <p className="text-xs text-zinc-400 pt-0.5 max-w-md">{user.bio}</p>}
            </div>
          </div>

          {/* Stats Metrics & Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-5 w-full md:w-auto justify-between md:justify-end">
            <div className="grid grid-cols-3 gap-4 sm:gap-6 border-t md:border-t-0 md:border-l border-zinc-800 pt-4 md:pt-0 md:pl-6 text-center w-full sm:w-auto">
              <div className="space-y-0.5">
                <div className="text-lg sm:text-xl font-bold font-mono text-zinc-100">{totalHours}ч</div>
                <div className="text-[11px] text-zinc-400">Просмотрено</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-lg sm:text-xl font-bold font-mono text-zinc-100">{groupedHistory.length}</div>
                <div className="text-[11px] text-zinc-400">Тайтлов</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-lg sm:text-xl font-bold font-mono text-zinc-100">{completedEpisodes}</div>
                <div className="text-[11px] text-zinc-400">Серий сдано</div>
              </div>
            </div>

            <div className="shrink-0">
              {user ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Редактировать</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-zinc-900 hover:bg-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Войти</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Edit Drawer */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-zinc-800 space-y-4 animate-in fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-400 uppercase">Имя / Никнейм</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-zinc-600"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-mono text-zinc-400 uppercase">О себе</label>
                <input
                  type="text"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="Ваш любимый жанр или тайтл..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-xs text-white focus:outline-none focus:border-zinc-600"
                />
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <AvatarSelector
                selectedAvatar={editAvatar}
                onSelect={(url) => setEditAvatar(url)}
                nickname={editName}
              />
            </div>

            <div className="flex items-center gap-2.5 pt-1">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Сохранить
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white text-xs transition-colors cursor-pointer"
              >
                Отмена
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. Otaku Achievements */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ACHIEVEMENTS.map((ach) => {
          const Icon = ach.icon;
          return (
            <div
              key={ach.id}
              className={`p-3.5 rounded-xl border transition-all flex items-center gap-3 ${
                ach.unlocked
                  ? 'bg-zinc-900/80 border-zinc-800 shadow-sm'
                  : 'bg-zinc-950/60 border-zinc-800/80 opacity-40'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  ach.unlocked ? 'bg-zinc-800 text-zinc-200 border border-zinc-700' : 'bg-zinc-900 text-zinc-500'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-zinc-100 truncate">{ach.title}</h4>
                <p className="text-[10px] text-zinc-400 truncate">{ach.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Main Profile Content Tabs: History, Bookmarks, Collections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Real-time Taste Profile Card */}
        <GenreRadarChart 
          className="h-full" 
          history={history}
          bookmarks={bookmarks}
          animeMap={animeMap}
        />

        {/* History / Bookmarks / Collections Tab Panel */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-xl bg-zinc-900/80 border border-zinc-800 space-y-5">
          {/* Top Tabs Switcher */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'history'
                    ? 'text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {activeTab === 'history' && (
                  <motion.div
                    layoutId="activeProfileTab"
                    className="absolute inset-0 bg-zinc-100 rounded-lg shadow-sm -z-0"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>История ({groupedHistory.length})</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('bookmarks')}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'bookmarks'
                    ? 'text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {activeTab === 'bookmarks' && (
                  <motion.div
                    layoutId="activeProfileTab"
                    className="absolute inset-0 bg-zinc-100 rounded-lg shadow-sm -z-0"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Закладки ({bookmarks.length})</span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('collections')}
                className={`relative px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'collections'
                    ? 'text-zinc-950 font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                }`}
              >
                {activeTab === 'collections' && (
                  <motion.div
                    layoutId="activeProfileTab"
                    className="absolute inset-0 bg-zinc-100 rounded-lg shadow-sm -z-0"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Коллекции ({userCollections.length})</span>
                </span>
              </button>
            </div>

            {activeTab === 'collections' && (
              <button
                type="button"
                onClick={() => setIsCreateCollectionOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-zinc-700 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Создать коллекцию</span>
              </button>
            )}
          </div>

          {/* TAB 1: HISTORY (WITH COVERS, REAL TITLES, EPISODE PROGRESS & WATCH BUTTON) */}
          {activeTab === 'history' && (
            groupedHistory.length === 0 ? (
              <div className="py-16 text-center text-xs text-zinc-500 font-mono space-y-3">
                <Clock className="w-8 h-8 text-zinc-600 mx-auto" />
                <p>История просмотров пуста</p>
                <Link
                  href="/catalog"
                  className="inline-block px-4 py-2 rounded-lg bg-zinc-100 text-zinc-950 text-xs font-semibold hover:bg-white transition-colors"
                >
                  Перейти в каталог →
                </Link>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {groupedHistory.map((h) => {
                  const meta = animeMap[h.animeId];
                  const title =
                    h.animeTitle ||
                    meta?.title?.russian ||
                    meta?.title?.romaji ||
                    meta?.title?.english ||
                    `Аниме #${h.animeId}`;
                  const cover = h.animeCover || meta?.coverImage?.original || meta?.coverImage?.medium;
                  const totalEps = h.animeTotalEpisodes || meta?.episodesTotal;
                  const progressPct = Math.round(h.progressPercentage || 0);
                  const currentMins = Math.floor((h.currentTimeSeconds || 0) / 60);

                  return (
                    <div
                      key={`${h.animeId}-${h.episodeNumber}`}
                      className="group relative rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 transition-all hover:bg-zinc-950/80"
                    >
                      {/* Left: Poster + Info */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        <Link
                          href={`/watch/${h.animeId}/${h.episodeNumber}`}
                          className="relative w-16 h-22 sm:w-18 sm:h-24 rounded-lg overflow-hidden shrink-0 bg-zinc-900 border border-zinc-800"
                        >
                          {cover ? (
                            <Image
                              src={cover}
                              alt={title}
                              fill
                              sizes="72px"
                              className="object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-mono text-xs text-zinc-500">
                              #{h.animeId}
                            </div>
                          )}
                          <div className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-black/80 text-[10px] font-mono font-bold text-zinc-200">
                            Эп. {h.episodeNumber}
                          </div>
                        </Link>

                        <div className="min-w-0 space-y-1.5 flex-1">
                          <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400 flex-wrap">
                            <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 font-semibold border border-zinc-700">
                              {h.animeFormat || meta?.format || 'TV'}
                            </span>
                            <span className="text-zinc-200 font-semibold">
                              Серия {h.episodeNumber} {totalEps ? `из ${totalEps}` : ''}
                            </span>
                            {h.isCompleted && (
                              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                <Check className="w-3 h-3" />
                                <span>Просмотрено</span>
                              </span>
                            )}
                          </div>

                          <Link
                            href={`/anime/${h.animeId}`}
                            className="text-xs sm:text-sm font-bold text-zinc-100 group-hover:text-white transition-colors line-clamp-1 block"
                          >
                            {title}
                          </Link>

                          {/* Progress Bar & Time */}
                          <div className="space-y-1 pt-0.5 max-w-sm">
                            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                              <span>Прогресс: {progressPct}%</span>
                              <span>{currentMins} мин</span>
                            </div>
                            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-300 ${
                                  h.isCompleted ? 'bg-emerald-400' : 'bg-zinc-300'
                                }`}
                                style={{ width: `${Math.min(100, Math.max(5, progressPct))}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right: Continue Watch CTA */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <Link
                          href={`/watch/${h.animeId}/${h.episodeNumber}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 text-xs font-semibold border border-zinc-700 transition-colors shadow-sm cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Продолжить</span>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* TAB 2: BOOKMARKS (WITH SUB-STATUS FILTER PILLS, COVERS, FORMAT, RATINGS) */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-4">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 flex-wrap">
                {[
                  { id: 'all', label: 'Все', count: bookmarks.length },
                  { id: 'watching', label: 'Смотрю', count: bookmarks.filter((b) => b.status === 'watching').length },
                  { id: 'planned', label: 'В планах', count: bookmarks.filter((b) => b.status === 'planned').length },
                  { id: 'completed', label: 'Просмотрено', count: bookmarks.filter((b) => b.status === 'completed').length },
                  { id: 'on_hold', label: 'Отложено', count: bookmarks.filter((b) => b.status === 'on_hold').length },
                  { id: 'dropped', label: 'Брошено', count: bookmarks.filter((b) => b.status === 'dropped').length },
                  { id: 'favorites', label: '❤️ Избранное', count: bookmarks.filter((b) => b.isFavorite).length },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setBookmarkFilter(tab.id)}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors cursor-pointer border ${
                      bookmarkFilter === tab.id
                        ? 'bg-zinc-800 text-zinc-100 border-zinc-600 font-bold'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-200 hover:border-zinc-700'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="text-[10px] text-zinc-500 font-bold">({tab.count})</span>
                  </button>
                ))}
              </div>

              {filteredBookmarks.length === 0 ? (
                <div className="py-16 text-center text-xs text-zinc-500 font-mono space-y-3">
                  <Bookmark className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p>В этом списке закладок пока ничего нет</p>
                  <Link
                    href="/catalog"
                    className="inline-block px-4 py-2 rounded-lg bg-zinc-100 text-zinc-950 text-xs font-semibold hover:bg-white transition-colors"
                  >
                    Выбрать в каталоге →
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                  {filteredBookmarks.map((b) => {
                    const meta = animeMap[b.animeId];
                    const title =
                      b.animeTitle ||
                      meta?.title?.russian ||
                      meta?.title?.romaji ||
                      meta?.title?.english ||
                      `Аниме #${b.animeId}`;
                    const cover = b.animeCover || meta?.coverImage?.original || meta?.coverImage?.medium;
                    const statusCfg = BOOKMARK_STATUS_LABELS[b.status] || {
                      label: b.status,
                      dot: 'bg-zinc-400',
                    };

                    return (
                      <div
                        key={b.animeId}
                        className="group relative rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 p-3 flex gap-3 transition-all hover:bg-zinc-950/80"
                      >
                        {/* Poster */}
                        <Link
                          href={`/anime/${b.animeId}`}
                          className="relative w-18 sm:w-20 aspect-[3/4] rounded-lg overflow-hidden shrink-0 bg-zinc-900 border border-zinc-800"
                        >
                          {cover ? (
                            <Image
                              src={cover}
                              alt={title}
                              fill
                              sizes="80px"
                              className="object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-mono text-xs text-zinc-500">
                              #{b.animeId}
                            </div>
                          )}
                          {meta?.score && (
                            <div className="absolute top-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[9px] font-mono font-bold text-zinc-200 flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-zinc-200 text-zinc-200" />
                              <span>{meta.score.toFixed(1)}</span>
                            </div>
                          )}
                        </Link>

                        {/* Content */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between space-y-1.5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                <span>{statusCfg.label}</span>
                              </span>
                              {b.isFavorite && <span title="В избранном">❤️</span>}
                            </div>

                            <Link
                              href={`/anime/${b.animeId}`}
                              className="text-xs sm:text-sm font-bold text-zinc-100 group-hover:text-white transition-colors line-clamp-2"
                            >
                              {title}
                            </Link>

                            <div className="text-[10px] font-mono text-zinc-500">
                              {b.animeFormat || meta?.format || 'TV'}{' '}
                              {meta?.seasonYear ? `• ${meta.seasonYear} г.` : ''}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center justify-between gap-2 pt-1 border-t border-zinc-800/60">
                            <Link
                              href={`/watch/${b.animeId}/1`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors"
                            >
                              <Play className="w-3 h-3 fill-current" />
                              <span>Смотреть</span>
                            </Link>

                            <button
                              type="button"
                              onClick={(e) => handleRemoveBookmark(e, b.animeId)}
                              className="p-1 rounded-md text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                              title="Удалить из закладок"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: USER COLLECTIONS (VIEW, OPEN MODAL, ADD/REMOVE ANIME) */}
          {activeTab === 'collections' && (
            userCollections.length === 0 ? (
              <div className="py-16 text-center text-xs text-zinc-500 font-mono space-y-3">
                <Layers className="w-8 h-8 text-zinc-600 mx-auto" />
                <p>У вас пока нет созданных коллекций</p>
                <button
                  type="button"
                  onClick={() => setIsCreateCollectionOpen(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-zinc-100 text-zinc-950 text-xs font-semibold hover:bg-white transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Создать первую коллекцию</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 max-h-[500px] overflow-y-auto pr-1">
                {userCollections.map((col) => (
                  <div
                    key={col.id}
                    onClick={() => setSelectedUserCollection(col)}
                    className="group relative rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 p-4 space-y-3 transition-all hover:bg-zinc-950/80 cursor-pointer flex flex-col justify-between"
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

                      <h3 className="text-sm font-bold text-zinc-100 group-hover:text-white transition-colors truncate">
                        {col.title}
                      </h3>

                      <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                        {col.description || 'Без описания'}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400 font-mono">
                      <span>Управление коллекцией</span>
                      <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      <CreateCollectionModal
        isOpen={isCreateCollectionOpen}
        onClose={() => setIsCreateCollectionOpen(false)}
      />
      <UserCollectionModal
        collection={selectedUserCollection}
        onClose={() => setSelectedUserCollection(null)}
        onDeleted={() => {
          setSelectedUserCollection(null);
          loadData();
        }}
      />
    </div>
  );
}
