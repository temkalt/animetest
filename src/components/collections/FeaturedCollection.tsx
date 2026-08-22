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
      className="relative w-full rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 transition-all duration-200"
    >
      {/* Cinematic Banner Layer */}
      <div className="absolute inset-0 z-0">
        <Image
          src={collection.banner}
          alt={collection.title}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-40 group-hover:opacity-50 transition-all duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
      </div>

      {/* Main Content Layout (Grid on desktop, stacked on mobile) */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 min-h-[460px]">
        {/* Left Editorial Text Column */}
        <div className="flex-1 space-y-6 max-w-2xl">
          {/* Top Issue & Curator Badge */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-800 text-zinc-100 border border-zinc-700 text-[11px] font-mono font-bold tracking-wider">
              <Flame className="w-3.5 h-3.5 text-zinc-400" />
              <span>ВЫБОР ГЛАВНОГО РЕДАКТОРА</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 text-[11px] font-mono">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              <span>{collection.issueNumber}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 text-[11px] font-mono">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>~{collection.estimatedHours} часов просмотра</span>
            </div>
          </div>

          {/* Japanese Subtitle & Editorial Title */}
          <div className="space-y-2">
            <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase block">
              {collection.subtitleJp}
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-sans text-zinc-100 tracking-tight leading-[1.1]">
              {collection.title}
            </h2>
          </div>

          {/* Spotlight Quote */}
          {collection.spotlightQuote && (
            <div className="p-3.5 rounded-lg bg-zinc-800/50 border-l-2 border-zinc-500">
              <p className="text-xs sm:text-sm text-zinc-300 italic font-serif leading-relaxed">
                {collection.spotlightQuote}
              </p>
            </div>
          )}

          {/* Editorial Note Description */}
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl font-sans">
            {collection.editorialNote}
          </p>

          {/* Curator Profile Strip & Metrics */}
          <div className="flex items-center justify-between gap-4 pt-2 border-t border-zinc-800 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-700 shrink-0 bg-zinc-800">
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
                  <span className="text-xs sm:text-sm font-bold text-zinc-100">
                    {collection.curator.name}
                  </span>
                  <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                </div>
                <p className="text-[11px] text-zinc-500 font-mono">
                  {collection.curator.role}
                </p>
              </div>
            </div>

            {/* Like Counter */}
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-mono font-bold transition-all cursor-pointer ${
                isLiked
                  ? 'bg-zinc-800 text-white border border-zinc-700'
                  : 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-colors ${
                  isLiked ? 'fill-white text-white' : 'text-zinc-400'
                }`}
              />
              <span>{likesCount} сохранений</span>
            </button>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 pt-2">
            <Link
              href={collection.href}
              className="flex items-center gap-2 px-6 py-3 rounded-md bg-white hover:bg-zinc-200 text-zinc-900 font-bold text-xs sm:text-sm transition-all"
            >
              <Play className="w-4 h-4 fill-zinc-900" />
              <span>Смотреть антологию</span>
            </Link>

            <button
              type="button"
              onClick={() => onQuickView(collection)}
              className="flex items-center gap-2 px-5 py-3 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
            >
              <Eye className="w-4 h-4 text-zinc-400" />
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
                  className="absolute w-32 sm:w-40 aspect-[3/4] rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950"
                  style={{ zIndex: config.zIndex }}
                >
                  <Image
                    src={posterUrl}
                    alt="Anime Poster"
                    fill
                    sizes="160px"
                    className="object-cover opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 via-transparent to-transparent" />

                  {idx === 2 && (
                    <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2 py-1 rounded-md bg-zinc-900/90 border border-zinc-800">
                      <span className="text-[10px] font-mono font-bold text-zinc-200 flex items-center gap-1">
                        <Star className="w-3 h-3 text-zinc-400" />
                        8.9
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400">1080P</span>
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
