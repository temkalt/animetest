'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Play, RotateCcw, Share2, Check, Sparkles } from 'lucide-react';
import { BookmarkQuickSelector } from './BookmarkQuickSelector';
import { syncManager } from '@/lib/dexie/sync';
import { LocalWatchProgress } from '@/lib/dexie/db';

interface AnimeHeroActionsProps {
  animeId: number;
  totalEpisodes: number;
  animeTitle: string;
}

export const AnimeHeroActions: React.FC<AnimeHeroActionsProps> = ({
  animeId,
  totalEpisodes,
  animeTitle,
}) => {
  const [lastProgress, setLastProgress] = useState<LocalWatchProgress | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isMounted = true;
    syncManager.getAllAnimeProgress(animeId).then((progressList) => {
      if (isMounted && progressList && progressList.length > 0) {
        // Sort by updatedAt descending to find the most recently watched episode
        const sorted = [...progressList].sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setLastProgress(sorted[0]);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [animeId]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: animeTitle,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback copy
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        // Ignore copy errors
      }
    }
  };

  const resumeEp = lastProgress?.episodeNumber || 1;
  const isResuming = Boolean(lastProgress && resumeEp > 1);

  return (
    <div className="flex flex-wrap items-center gap-3 pt-2">
      {/* Primary Watch Action Button */}
      <Link
        href={`/watch/${animeId}/${resumeEp}`}
        className="flex items-center gap-2.5 px-6 py-3.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-900 font-sans font-bold text-xs transition-all duration-200 border border-zinc-800"
      >
        <Play className="w-4 h-4 fill-white" />
        <span>
          {isResuming ? `Продолжить: ${resumeEp} серия` : 'Смотреть онлайн'}
        </span>
      </Link>

      {/* Restart from episode 1 button if resuming */}
      {isResuming && (
        <Link
          href={`/watch/${animeId}/1`}
          title="Смотреть с 1 серии"
          className="flex items-center gap-1.5 px-3.5 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border border-zinc-800 text-xs font-mono transition-all "
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">С 1 серии</span>
        </Link>
      )}

      {/* Quick Bookmark Status Selector (with Favorite Heart) */}
      <BookmarkQuickSelector animeId={animeId} />

      {/* Share / Copy Link Button */}
      <div className="relative">
        <button
          type="button"
          onClick={handleShare}
          title="Поделиться аниме"
          className={`p-3 rounded-lg border text-xs font-medium transition-all duration-200 cursor-pointer  ${
            copied
              ? 'bg-zinc-800 text-zinc-300 border-zinc-800'
              : 'bg-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 border-zinc-800'
          }`}
          aria-label="Поделиться"
        >
          {copied ? <Check className="w-4 h-4 text-zinc-400" /> : <Share2 className="w-4 h-4" />}
        </button>

        {copied && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-100 text-[10px] font-mono whitespace-nowrap shadow-sm animate-in fade-in zoom-in-95">
            Ссылка скопирована!
          </div>
        )}
      </div>
    </div>
  );
};
