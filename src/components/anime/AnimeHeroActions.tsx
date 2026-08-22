'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Share2, Check, FolderPlus } from 'lucide-react';
import { BookmarkQuickSelector } from './BookmarkQuickSelector';
import { AddToCollectionModal } from '@/components/collections/AddToCollectionModal';
import { syncManager } from '@/lib/dexie/sync';
import { LocalWatchProgress } from '@/lib/dexie/db';

interface AnimeHeroActionsProps {
  animeId: number;
  totalEpisodes: number;
  animeTitle: string;
  animeCover?: string;
  animeFormat?: string;
  animeScore?: number;
}

export const AnimeHeroActions: React.FC<AnimeHeroActionsProps> = ({
  animeId,
  totalEpisodes,
  animeTitle,
  animeCover = '',
  animeFormat = 'TV',
  animeScore,
}) => {
  const [lastProgress, setLastProgress] = useState<LocalWatchProgress | null>(null);
  const [copied, setCopied] = useState(false);
  const [isAddToCollectionOpen, setIsAddToCollectionOpen] = useState(false);

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
    <div className="flex flex-wrap items-center gap-2.5 pt-2 relative z-30">
      {/* Primary Watch Action Button */}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Link
          href={`/watch/${animeId}/${resumeEp}`}
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-950 font-sans font-bold text-xs transition-colors duration-200 border border-zinc-800 shadow-sm"
        >
          <Play className="w-4 h-4 fill-zinc-950" />
          <span>
            {isResuming ? `Продолжить: ${resumeEp} серия` : 'Смотреть онлайн'}
          </span>
        </Link>
      </motion.div>

      {/* Restart from episode 1 button if resuming */}
      {isResuming && (
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Link
            href={`/watch/${animeId}/1`}
            title="Смотреть с 1 серии"
            className="flex items-center gap-1.5 px-3 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 border border-zinc-700 text-xs font-mono transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">С 1 серии</span>
          </Link>
        </motion.div>
      )}

      {/* Quick Bookmark Status Selector (with Favorite Heart) */}
      <BookmarkQuickSelector
        animeId={animeId}
        animeTitle={animeTitle}
        animeCover={animeCover}
        animeFormat={animeFormat}
        animeScore={animeScore}
        animeTotalEpisodes={totalEpisodes}
      />

      {/* Add To Collection Button */}
      <button
        type="button"
        onClick={() => setIsAddToCollectionOpen(true)}
        className="flex items-center gap-1.5 px-3.5 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 text-xs font-semibold font-sans transition-all cursor-pointer"
        title="Добавить в коллекцию"
      >
        <FolderPlus className="w-4 h-4 text-zinc-300" />
        <span className="hidden sm:inline">В коллекцию</span>
      </button>

      {/* Share / Copy Link Button */}
      <div className="relative">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleShare}
          title="Поделиться аниме"
          className={`p-3 rounded-lg border text-xs font-medium transition-colors duration-200 cursor-pointer ${
            copied
              ? 'bg-zinc-800 text-zinc-200 border-zinc-600'
              : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-zinc-100 border-zinc-700'
          }`}
          aria-label="Поделиться"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
        </motion.button>

        {copied && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-100 text-[10px] font-mono whitespace-nowrap shadow-md border border-zinc-700 animate-in fade-in zoom-in-95">
            Ссылка скопирована!
          </div>
        )}
      </div>

      {/* Add To Collection Modal */}
      <AddToCollectionModal
        isOpen={isAddToCollectionOpen}
        onClose={() => setIsAddToCollectionOpen(false)}
        animeId={animeId}
        animeTitle={animeTitle}
        animeCover={animeCover}
      />
    </div>
  );
};
