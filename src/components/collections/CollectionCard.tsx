'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ArrowRight, CheckCircle2, Eye, Clock, Layers } from 'lucide-react';
import { EditorialCollection } from '@/data/collections';
import { SPRINGS } from '@/lib/motion-presets';

interface CollectionCardProps {
  collection: EditorialCollection;
  onQuickView: (collection: EditorialCollection) => void;
  index: number;
}

export const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  onQuickView,
  index,
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(collection.likes);
  const [isHovered, setIsHovered] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isLiked) {
      setIsLiked(false);
      setLikesCount((prev) => prev - 1);
    } else {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  const getAccentStyles = (color: EditorialCollection['accentColor']) => {
    switch (color) {
      case 'rose':
        return {
          glow: 'from-rose-500/20 via-rose-500/5 to-transparent',
          border: 'hover:border-rose-500/40',
          badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
          indicator: 'bg-rose-500',
          textHover: 'group-hover:text-rose-300',
          subtlePill: 'bg-rose-500/10 text-rose-300 border-rose-500/20',
        };
      case 'cyan':
        return {
          glow: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
          border: 'hover:border-cyan-500/40',
          badge: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30',
          indicator: 'bg-cyan-500',
          textHover: 'group-hover:text-cyan-300',
          subtlePill: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
        };
      case 'amber':
        return {
          glow: 'from-amber-500/20 via-amber-500/5 to-transparent',
          border: 'hover:border-amber-500/40',
          badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
          indicator: 'bg-amber-500',
          textHover: 'group-hover:text-amber-300',
          subtlePill: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
        };
      case 'emerald':
        return {
          glow: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
          border: 'hover:border-emerald-500/40',
          badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
          indicator: 'bg-emerald-500',
          textHover: 'group-hover:text-emerald-300',
          subtlePill: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
        };
      case 'indigo':
      default:
        return {
          glow: 'from-indigo-500/20 via-indigo-500/5 to-transparent',
          border: 'hover:border-indigo-500/40',
          badge: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30',
          indicator: 'bg-indigo-500',
          textHover: 'group-hover:text-indigo-300',
          subtlePill: 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20',
        };
    }
  };

  const accent = getAccentStyles(collection.accentColor);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ ...SPRINGS.snappy, delay: index * 0.06 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative rounded-3xl overflow-hidden bg-[#0A0D14] border border-white/[0.08] hover:border-white/[0.2] transition-all duration-500 shadow-2xl flex flex-col justify-between"
    >
      {/* Ambient background glow matching accent */}
      <div
        className={`absolute -inset-1 bg-gradient-to-br ${accent.glow} opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-xl`}
      />

      {/* Banner background layer */}
      <div className="relative w-full h-56 sm:h-64 overflow-hidden">
        {collection.banner ? (
          <Image
            src={collection.banner}
            alt={collection.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center filter saturate-[1.1] brightness-[0.75] group-hover:scale-105 group-hover:brightness-[0.85] transition-all duration-700 ease-out"
          />
        ) : (
          <div className="absolute inset-0 bg-[#121622]" />
        )}

        {/* Multi-layered cinematic gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D14] via-[#0A0D14]/75 to-black/30" />
        <div className="absolute inset-0 bg-radial-mesh opacity-60" />

        {/* Top Floating Badges Bar */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 gap-2">
          {/* Issue & Category Tag */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold tracking-widest uppercase bg-black/60 backdrop-blur-md text-white/90 border border-white/10 shadow-lg">
              {collection.issueNumber}
            </span>
            <span
              className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border shadow-lg ${accent.badge}`}
            >
              {collection.categoryLabel}
            </span>
          </div>

          {/* Interactive Heart Button with Micro-Animation */}
          <motion.button
            type="button"
            onClick={handleLike}
            whileTap={{ scale: 0.8 }}
            className={`relative flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold backdrop-blur-md transition-all shadow-lg cursor-pointer ${
              isLiked
                ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 shadow-rose-500/20'
                : 'bg-black/60 text-zinc-300 border border-white/10 hover:text-white hover:bg-black/80'
            }`}
          >
            <motion.div
              animate={
                isLiked
                  ? { scale: [1, 1.45, 0.9, 1.15, 1], rotate: [0, -12, 12, -4, 0] }
                  : { scale: 1 }
              }
              transition={{ duration: 0.4 }}
            >
              <Heart
                className={`w-3.5 h-3.5 transition-colors ${
                  isLiked ? 'fill-rose-500 text-rose-500' : 'text-zinc-400 group-hover:text-rose-400'
                }`}
              />
            </motion.div>
            <span>{likesCount}</span>

            {/* Micro heart explosion sparkles when liked */}
            <AnimatePresence>
              {isLiked && (
                <motion.div
                  initial={{ opacity: 1, scale: 0 }}
                  animate={{ opacity: 0, scale: 2 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0 rounded-full border-2 border-rose-400 pointer-events-none"
                />
              )}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Dynamic Layered Poster Collage in Upper Right / Foreground */}
        <div className="absolute right-4 bottom-3 z-10 hidden sm:flex items-end space-x-[-24px] pointer-events-none">
          {collection.posters.slice(0, 3).map((posterUrl, pIdx) => {
            const rotDegree = pIdx === 0 ? -8 : pIdx === 1 ? 0 : 8;
            const yOffset = pIdx === 1 ? -6 : 0;
            return (
              <motion.div
                key={pIdx}
                animate={
                  isHovered
                    ? {
                        rotate: (pIdx - 1) * 14,
                        x: (pIdx - 1) * 12,
                        y: yOffset - 8,
                        scale: 1.05,
                      }
                    : {
                        rotate: rotDegree,
                        x: 0,
                        y: yOffset,
                        scale: 1,
                      }
                }
                transition={SPRINGS.snappy}
                className="relative w-16 h-24 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl shadow-black/80 bg-zinc-900"
                style={{ zIndex: pIdx + 1 }}
              >
                <Image
                  src={posterUrl}
                  alt="Poster"
                  fill
                  sizes="80px"
                  className="object-cover filter contrast-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </motion.div>
            );
          })}
        </div>

        {/* Count Pill in lower left of header image */}
        <div className="absolute bottom-3 left-4 z-10 flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-zinc-200">
            <Layers className="w-3 h-3 text-indigo-400" />
            <span className="font-semibold text-white">{collection.count}</span>
            <span className="text-zinc-400">тайтлов</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 text-[11px] font-mono text-zinc-300">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>~{collection.estimatedHours} ч</span>
          </div>
        </div>
      </div>

      {/* Main Editorial Content Body */}
      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5 relative z-10">
        <div className="space-y-3">
          {/* Japanese Subtitle */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono tracking-widest text-zinc-500 uppercase">
              {collection.subtitleJp}
            </span>
          </div>

          {/* Main Title */}
          <Link href={collection.href} className="block group/title">
            <h3
              className={`text-xl sm:text-2xl font-black font-display text-white tracking-tight leading-snug transition-colors duration-300 ${accent.textHover}`}
            >
              {collection.title}
            </h3>
          </Link>

          {/* Editorial Note / Description */}
          <p className="text-xs sm:text-sm text-zinc-300/90 leading-relaxed line-clamp-2 font-sans font-normal">
            {collection.description}
          </p>

          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {collection.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-white/[0.04] text-zinc-400 border border-white/[0.06] hover:text-white hover:bg-white/[0.08] transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Section: Curator Badge & Actions */}
        <div className="pt-4 border-t border-white/[0.07] space-y-4">
          {/* Curator Profile Strip */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-white/20 shrink-0">
                <Image
                  src={collection.curator.avatar}
                  alt={collection.curator.name}
                  fill
                  sizes="32px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-white truncate font-display">
                    {collection.curator.name}
                  </span>
                  {collection.curator.verified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 fill-indigo-500/20" />
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 truncate font-mono">
                  {collection.curator.role}
                </p>
              </div>
            </div>

            {/* Studios Pill */}
            <div className="hidden sm:block text-right">
              <span className="text-[10px] font-mono text-zinc-500 block uppercase">Студии</span>
              <span className="text-[11px] font-mono text-zinc-300 font-medium truncate max-w-[120px] block">
                {collection.studios.slice(0, 2).join(', ')}
              </span>
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onQuickView(collection);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 border border-white/[0.08] text-xs font-medium backdrop-blur-md transition-all cursor-pointer hover:border-white/20 active:scale-[0.98]"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>Список тайтлов ({collection.animeList.length})</span>
            </button>

            <Link
              href={collection.href}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Смотреть</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
