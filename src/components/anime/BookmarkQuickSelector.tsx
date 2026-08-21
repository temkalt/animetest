'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bookmark, Heart, Check, ChevronDown, Trash2, Eye, Clock, CheckCircle2, PauseCircle, XCircle, Sparkles } from 'lucide-react';
import { syncManager } from '@/lib/dexie/sync';
import { LocalBookmarkItem } from '@/lib/dexie/db';

type BookmarkStatus = 'watching' | 'planned' | 'completed' | 'on_hold' | 'dropped';

interface BookmarkStatusConfig {
  id: BookmarkStatus;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
  badgeClass: string;
  activeClass: string;
}

const STATUS_CONFIGS: BookmarkStatusConfig[] = [
  {
    id: 'watching',
    label: 'Смотрю сейчас',
    shortLabel: 'Смотрю',
    icon: Eye,
    badgeClass: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    activeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/10',
  },
  {
    id: 'planned',
    label: 'В планах посмотреть',
    shortLabel: 'В планах',
    icon: Clock,
    badgeClass: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    activeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-sm shadow-indigo-500/10',
  },
  {
    id: 'completed',
    label: 'Просмотрено полностью',
    shortLabel: 'Просмотрено',
    icon: CheckCircle2,
    badgeClass: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    activeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm shadow-cyan-500/10',
  },
  {
    id: 'on_hold',
    label: 'Отложено на потом',
    shortLabel: 'Отложено',
    icon: PauseCircle,
    badgeClass: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    activeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm shadow-amber-500/10',
  },
  {
    id: 'dropped',
    label: 'Брошено смотреть',
    shortLabel: 'Брошено',
    icon: XCircle,
    badgeClass: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    activeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm shadow-rose-500/10',
  },
];

interface BookmarkQuickSelectorProps {
  animeId: number;
}

export const BookmarkQuickSelector: React.FC<BookmarkQuickSelectorProps> = ({ animeId }) => {
  const [bookmark, setBookmark] = useState<LocalBookmarkItem | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    syncManager.getBookmark(animeId).then((data) => {
      if (isMounted) {
        setBookmark(data || null);
      }
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      isMounted = false;
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [animeId]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => {
      setNotification((prev) => (prev === msg ? null : prev));
    }, 2400);
  };

  const handleSelectStatus = async (status: BookmarkStatus) => {
    setIsUpdating(true);
    const newBookmark: LocalBookmarkItem = {
      animeId,
      status,
      isFavorite: bookmark?.isFavorite || false,
      score: bookmark?.score,
      updatedAt: new Date().toISOString(),
      synced: false,
    };

    setBookmark(newBookmark);
    setIsOpen(false);
    await syncManager.setBookmark(newBookmark);
    setIsUpdating(false);

    const cfg = STATUS_CONFIGS.find((c) => c.id === status);
    showToast(`Добавлено в «${cfg?.shortLabel || status}»`);
  };

  const handleToggleFavorite = async () => {
    setIsUpdating(true);
    const isFav = !bookmark?.isFavorite;
    const newBookmark: LocalBookmarkItem = {
      animeId,
      status: bookmark?.status || 'planned',
      isFavorite: isFav,
      score: bookmark?.score,
      updatedAt: new Date().toISOString(),
      synced: false,
    };

    setBookmark(newBookmark);
    await syncManager.setBookmark(newBookmark);
    setIsUpdating(false);

    showToast(isFav ? 'Добавлено в избранное ❤️' : 'Удалено из избранного');
  };

  const handleRemoveBookmark = async () => {
    setIsUpdating(true);
    setBookmark(null);
    setIsOpen(false);
    await syncManager.removeBookmark(animeId);
    setIsUpdating(false);
    showToast('Удалено из закладок');
  };

  const currentConfig = STATUS_CONFIGS.find((c) => c.id === bookmark?.status);
  const CurrentIcon = currentConfig?.icon || Bookmark;

  return (
    <div className="relative inline-flex items-center gap-2" ref={dropdownRef}>
      {/* Toast Notification Alert */}
      {notification && (
        <div className="absolute -top-10 left-0 sm:left-auto right-auto z-50 flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600/90 text-white text-[11px] font-mono shadow-xl backdrop-blur-md border border-indigo-400/30 animate-in fade-in slide-in-from-bottom-1 duration-200">
          <Sparkles className="w-3 h-3 text-cyan-300" />
          <span>{notification}</span>
        </div>
      )}

      {/* Main Status Selector Button */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl border text-xs font-semibold font-sans transition-all duration-200 cursor-pointer select-none backdrop-blur-xl ${
            currentConfig
              ? `${currentConfig.activeClass} hover:brightness-110`
              : 'bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border-white/[0.1] hover:border-white/[0.2]'
          }`}
          aria-label="Выбрать статус закладки"
        >
          <CurrentIcon className={`w-4 h-4 ${currentConfig ? '' : 'text-zinc-400'}`} />
          <span className="truncate">{currentConfig ? currentConfig.shortLabel : 'В закладки'}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-0 top-full mt-2 w-56 p-1.5 rounded-2xl bg-[#0F131D]/95 backdrop-blur-2xl border border-white/[0.12] shadow-2xl shadow-black/80 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-150">
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-zinc-400 border-b border-white/[0.06]">
              Списки просмотра
            </div>

            {STATUS_CONFIGS.map((config) => {
              const Icon = config.icon;
              const isSelected = bookmark?.status === config.id;
              return (
                <button
                  key={config.id}
                  type="button"
                  onClick={() => handleSelectStatus(config.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all text-left cursor-pointer ${
                    isSelected
                      ? config.activeClass
                      : 'text-zinc-300 hover:text-white hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>{config.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                </button>
              );
            })}

            {bookmark && (
              <>
                <div className="border-t border-white/[0.06] my-1" />
                <button
                  type="button"
                  onClick={handleRemoveBookmark}
                  className="w-full flex items-center gap-2.5 px-3 py-1.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors text-left cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Удалить из списка</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Favorite Heart Toggle Button */}
      <button
        type="button"
        onClick={handleToggleFavorite}
        title={bookmark?.isFavorite ? 'В избранном' : 'Добавить в избранное'}
        className={`p-3 rounded-2xl border transition-all duration-200 cursor-pointer backdrop-blur-xl ${
          bookmark?.isFavorite
            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40 shadow-lg shadow-rose-500/20 scale-105'
            : 'bg-white/[0.06] hover:bg-rose-500/15 text-zinc-400 hover:text-rose-400 border-white/[0.1] hover:border-rose-500/30'
        }`}
        aria-label="Добавить в избранное"
      >
        <Heart
          className={`w-4 h-4 transition-transform duration-200 ${
            bookmark?.isFavorite ? 'fill-rose-400 scale-110' : ''
          }`}
        />
      </button>
    </div>
  );
};
