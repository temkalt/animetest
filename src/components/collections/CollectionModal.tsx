'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { X, Play, Info, Star, ArrowRight } from 'lucide-react';
import type { EditorialCollection } from '@/data/collections';
import { getRussianGenre } from '@/components/catalog/catalog-data';

interface CollectionModalProps {
  collection: EditorialCollection | null;
  onClose: () => void;
}

export const CollectionModal: React.FC<CollectionModalProps> = ({
  collection,
  onClose,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) return null;

  const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.04, delayChildren: 0.1 }
    }
  };

  const staggerItem: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 400, damping: 30 } }
  };

  return createPortal(
    <AnimatePresence>
      {collection && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 16 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="relative w-full max-w-4xl rounded-2xl bg-[#0A0D14] border border-zinc-800 shadow-2xl overflow-hidden z-10 my-auto max-h-[85vh] flex flex-col"
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
                className="absolute top-4 right-4 z-20 w-9 h-9 rounded-lg bg-black/60 hover:bg-white/20 border border-white/10 text-zinc-100 flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header Content */}
              <div className="absolute bottom-4 inset-x-6 z-10 space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-white/10 text-zinc-100 border border-white/15 ">
                    {collection.issueNumber}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold bg-zinc-800 text-zinc-300 border border-zinc-800 ">
                    {collection.categoryLabel}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {collection.animeList.length} тайтлов в подборке
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black font-sans text-zinc-100 tracking-tight leading-tight">
                  {collection.title}
                </h2>
              </div>
            </div>

            {/* Modal Body / Scrollable Anime List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
              <p className="text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed border-b border-zinc-800 pb-4">
                {collection.editorialNote}
              </p>

              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {collection.animeList.map((anime) => (
                  <motion.div
                    key={anime.id}
                    variants={staggerItem}
                    className="group relative rounded-lg overflow-hidden bg-[#0F131D] border border-zinc-800 hover:border-zinc-700 p-3.5 flex gap-3.5 transition-all hover:bg-[#151A28]"
                  >
                    {/* Poster Thumbnail */}
                    <div className="relative w-20 sm:w-24 aspect-[3/4] rounded-lg overflow-hidden shrink-0 border border-white/10 bg-zinc-900">
                      <Image
                        src={anime.cover || 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg'}
                        alt={anime.title}
                        fill
                        sizes="96px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-LHBAeoZDIsnF.jpg';
                        }}
                      />
                      <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono font-bold text-zinc-300 flex items-center gap-0.5">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        {anime.score.toFixed(1)}
                      </div>
                    </div>

                    {/* Anime Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between space-y-1.5">
                      <div>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-zinc-400">
                          <span className="text-zinc-400 font-semibold">{anime.format}</span>
                          <span>•</span>
                          <span>{anime.year}</span>
                          {anime.episodes && (
                            <>
                              <span>•</span>
                              <span>{anime.episodes} эп.</span>
                            </>
                          )}
                        </div>

                        <h4 className="text-xs sm:text-sm font-bold font-sans text-zinc-100 line-clamp-1 group-hover:text-zinc-300 transition-colors">
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
                              className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-zinc-800 text-zinc-400"
                            >
                              {getRussianGenre(g)}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Link
                            href={`/watch/${anime.id}/1`}
                            onClick={onClose}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 shadow-sm transition-all"
                            title="Смотреть 1 серию"
                          >
                            <Play className="w-3.5 h-3.5 fill-white" />
                          </Link>
                          <Link
                            href={`/anime/${anime.id}`}
                            onClick={onClose}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all"
                            title="О тайтле"
                          >
                            <Info className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* Footer Bar */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-display font-black text-xs text-white">
                  KN
                </div>
                <span className="text-xs text-zinc-300 font-sans font-semibold">
                  Официальная коллекция KuroNami
                </span>
              </div>

              <Link
                href={collection.href}
                onClick={onClose}
                className="flex items-center gap-2 px-5 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-900 text-xs font-semibold shadow-sm transition-all"
              >
                <span>Смотреть все в каталоге</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
