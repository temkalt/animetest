'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Heart,
  CheckCircle2,
  Play,
  Flame,
  Star,
  Clock,
  Eye,
} from 'lucide-react';
import { EditorialCollection } from '@/data/collections';
import { SPRINGS } from '@/lib/motion-presets';

interface FeaturedCollectionProps {
  collection: EditorialCollection;
  onQuickView: (collection: EditorialCollection) => void;
}

export const FeaturedCollection: React.FC<FeaturedCollectionProps> = ({
  collection,
  onQuickView,
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

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full rounded-3xl overflow-hidden bg-[#0A0D14] border border-white/[0.12] shadow-2xl group transition-all duration-500"
    >
      {/* Ambient background glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-rose-500/20 via-indigo-500/15 to-cyan-500/20 opacity-60 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-2xl" />

      {/* Cinematic Banner Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src={collection.banner}
          alt={collection.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center filter saturate-[1.15] brightness-[0.4] group-hover:scale-105 group-hover:brightness-[0.45] transition-all duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#06070A] via-[#06070A]/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#06070A] via-[#06070A]/40 to-transparent" />
        <div className="absolute inset-0 bg-noise opacity-40" />
      </div>

      {/* Main Content Layout (Grid on desktop, stacked on mobile) */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 min-h-[460px]">
        {/* Left Editorial Text Column */}
        <div className="flex-1 space-y-6 max-w-2xl">
          {/* Top Issue & Curator Badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 backdrop-blur-md text-[11px] font-mono font-bold tracking-wider">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>ВЫБОР ГЛАВНОГО РЕДАКТОРА</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.08] text-zinc-300 border border-white/10 backdrop-blur-md text-[11px] font-mono">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>{collection.issueNumber}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 backdrop-blur-md text-[11px] font-mono">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>~{collection.estimatedHours} часов просмотра</span>
            </div>
          </div>

          {/* Japanese Subtitle & Editorial Title */}
          <div className="space-y-2">
            <span className="text-xs font-mono tracking-widest text-zinc-400 uppercase block">
              {collection.subtitleJp}
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight leading-[1.1] text-gradient-primary">
              {collection.title}
            </h2>
          </div>

          {/* Spotlight Quote */}
          {collection.spotlightQuote && (
            <div className="p-3.5 rounded-2xl bg-white/[0.04] border-l-2 border-rose-500 backdrop-blur-md">
              <p className="text-xs sm:text-sm text-zinc-300 italic font-serif leading-relaxed">
                {collection.spotlightQuote}
              </p>
            </div>
          )}

          {/* Editorial Note Description */}
          <p className="text-xs sm:text-sm text-zinc-300/90 leading-relaxed max-w-xl font-sans">
            {collection.editorialNote}
          </p>

          {/* Curator Profile Strip & Metrics */}
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-white/10 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-indigo-500/40 shadow-lg shrink-0">
                <Image
                  src={collection.curator.avatar}
                  alt={collection.curator.name}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs sm:text-sm font-bold text-white font-display">
                    {collection.curator.name}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-indigo-400 fill-indigo-500/20" />
                </div>
                <p className="text-[11px] text-zinc-400 font-mono">
                  {collection.curator.role}
                </p>
              </div>
            </div>

            {/* Like Counter with micro-animation */}
            <motion.button
              type="button"
              onClick={handleLike}
              whileTap={{ scale: 0.85 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-mono font-bold backdrop-blur-md transition-all shadow-xl cursor-pointer ${
                isLiked
                  ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 shadow-rose-500/25'
                  : 'bg-white/[0.06] text-zinc-300 border border-white/10 hover:text-white hover:bg-white/[0.12]'
              }`}
            >
              <motion.div
                animate={
                  isLiked
                    ? { scale: [1, 1.5, 0.9, 1.2, 1], rotate: [0, -15, 15, -5, 0] }
                    : { scale: 1 }
                }
                transition={{ duration: 0.4 }}
              >
                <Heart
                  className={`w-4 h-4 transition-colors ${
                    isLiked ? 'fill-rose-500 text-rose-500' : 'text-zinc-400'
                  }`}
                />
              </motion.div>
              <span>{likesCount} сохранений</span>
            </motion.button>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 pt-2">
            <Link
              href={collection.href}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-display font-bold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Смотреть антологию</span>
            </Link>

            <button
              type="button"
              onClick={() => onQuickView(collection)}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/[0.08] hover:bg-white/[0.16] text-zinc-200 border border-white/10 font-display font-semibold text-xs sm:text-sm backdrop-blur-md transition-all hover:scale-105 cursor-pointer active:scale-95"
            >
              <Eye className="w-4 h-4 text-indigo-300" />
              <span>Тайтлы коллекции ({collection.animeList.length})</span>
            </button>
          </div>
        </div>

        {/* Right Layered Fanout Poster Collage */}
        <div className="relative shrink-0 w-full max-w-[320px] sm:max-w-[380px] h-[280px] sm:h-[340px] flex items-center justify-center">
          <div className="relative w-full h-full flex items-center justify-center">
            {collection.posters.map((posterUrl, idx) => {
              const offsets = [
                { rotate: -16, x: -60, y: 15, scale: 0.88, zIndex: 1 },
                { rotate: -6, x: -20, y: 0, scale: 0.94, zIndex: 2 },
                { rotate: 8, x: 25, y: -10, scale: 1.0, zIndex: 3 },
                { rotate: 18, x: 65, y: 10, scale: 0.92, zIndex: 2 },
              ];
              const config = offsets[idx] || { rotate: 0, x: 0, y: 0, scale: 1, zIndex: 1 };

              return (
                <motion.div
                  key={idx}
                  animate={
                    isHovered
                      ? {
                          rotate: config.rotate * 1.3,
                          x: config.x * 1.35,
                          y: config.y - 12,
                          scale: config.scale * 1.05,
                        }
                      : {
                          rotate: config.rotate,
                          x: config.x,
                          y: config.y,
                          scale: config.scale,
                        }
                  }
                  transition={SPRINGS.snappy}
                  className="absolute w-32 sm:w-40 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl shadow-black/90 bg-[#121622]"
                  style={{ zIndex: config.zIndex }}
                >
                  <Image
                    src={posterUrl}
                    alt="Anime Poster"
                    fill
                    sizes="160px"
                    className="object-cover filter contrast-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-white/10" />

                  {idx === 2 && (
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/15">
                      <span className="text-[10px] font-mono font-bold text-amber-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-400" />
                        8.9
                      </span>
                      <span className="text-[9px] font-mono text-zinc-300">1080P</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
