'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Info, Star, ArrowRight } from 'lucide-react';
import { EditorialCollection } from '@/data/collections';
import { modalVariants } from '@/lib/motion-presets';

interface CollectionModalProps {
  collection: EditorialCollection | null;
  onClose: () => void;
}

export const CollectionModal: React.FC<CollectionModalProps> = ({
  collection,
  onClose,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (collection) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [collection, onClose]);

  if (!collection) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-xl transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          variants={modalVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-4xl rounded-3xl bg-[#0A0D14] border border-white/[0.12] shadow-2xl overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col"
        >
          {/* Header with Banner Image */}
          <div className="relative h-44 sm:h-52 shrink-0 overflow-hidden">
            <Image
              src={collection.banner}
              alt={collection.title}
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              className="object-cover brightness-[0.5] filter saturate-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-[#0A0D14]/60 to-black/30" />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header Content */}
            <div className="absolute bottom-4 inset-x-6 z-10 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-white/10 text-white border border-white/15 backdrop-blur-md">
                  {collection.issueNumber}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 backdrop-blur-md">
                  {collection.categoryLabel}
                </span>
                <span className="text-[11px] font-mono text-zinc-400">
                  {collection.animeList.length} тайтлов в подборке
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black font-display text-white tracking-tight leading-tight">
                {collection.title}
              </h2>
            </div>
          </div>

          {/* Modal Body / Scrollable Anime List */}
          <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
            <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed border-b border-white/[0.06] pb-4">
              {collection.editorialNote}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {collection.animeList.map((anime) => (
                <div
                  key={anime.id}
                  className="group relative rounded-2xl overflow-hidden bg-[#0F131D] border border-white/[0.08] hover:border-indigo-500/40 p-3.5 flex gap-3.5 transition-all hover:bg-[#151A28]"
                >
                  {/* Poster Thumbnail */}
                  <div className="relative w-20 sm:w-24 aspect-[3/4] rounded-xl overflow-hidden shrink-0 border border-white/10">
                    <Image
                      src={anime.cover}
                      alt={anime.title}
                      fill
                      sizes="96px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[9px] font-mono font-bold text-amber-400 flex items-center gap-0.5">
                      <Star className="w-2.5 h-2.5 fill-amber-400" />
                      {anime.score.toFixed(1)}
                    </div>
                  </div>

                  {/* Anime Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between space-y-1.5">
                    <div>
                      <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                        <span className="text-indigo-400 font-semibold">{anime.format}</span>
                        <span>•</span>
                        <span>{anime.year}</span>
                        {anime.episodes && (
                          <>
                            <span>•</span>
                            <span>{anime.episodes} эп.</span>
                          </>
                        )}
                      </div>

                      <h4 className="text-xs sm:text-sm font-bold font-display text-white line-clamp-1 group-hover:text-indigo-300 transition-colors">
                        {anime.title}
                      </h4>

                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed font-sans pt-0.5">
                        {anime.synopsis}
                      </p>
                    </div>

                    {/* Genres & Actions */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        {anime.genres.slice(0, 2).map((g) => (
                          <span
                            key={g}
                            className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-white/[0.05] text-zinc-400"
                          >
                            {g}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <Link
                          href={`/watch/${anime.id}/1`}
                          onClick={onClose}
                          className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm transition-all"
                          title="Смотреть 1 серию"
                        >
                          <Play className="w-3.5 h-3.5 fill-white" />
                        </Link>
                        <Link
                          href={`/anime/${anime.id}`}
                          onClick={onClose}
                          className="p-1.5 rounded-lg bg-white/[0.08] hover:bg-white/20 text-zinc-300 transition-all"
                          title="О тайтле"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Bar */}
          <div className="p-4 bg-[#08090D] border-t border-white/[0.08] flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="relative w-6 h-6 rounded-full overflow-hidden border border-white/20">
                <Image
                  src={collection.curator.avatar}
                  alt={collection.curator.name}
                  fill
                  sizes="24px"
                  className="object-cover"
                />
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                Куратор: <strong className="text-white">{collection.curator.name}</strong>
              </span>
            </div>

            <Link
              href={collection.href}
              onClick={onClose}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>Смотреть все в каталоге</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
