'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Play,
  Flame,
  Star,
  Eye,
  Layers,
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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 transition-all duration-200 shadow-md"
    >
      {/* Cinematic Banner Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          animate={{ scale: isHovered ? 1.05 : 1, y: isHovered ? -10 : 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="absolute inset-0"
        >
          <Image
            src={collection.banner}
            alt={collection.title}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center opacity-40 transition-opacity duration-700"
            style={{ opacity: isHovered ? 0.5 : 0.4 }}
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/80 to-transparent" />
      </div>

      {/* Main Content Layout */}
      <div className="relative z-10 p-6 sm:p-10 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 min-h-[440px]">
        {/* Left Editorial Text Column */}
        <div className="flex-1 space-y-6 max-w-2xl">
          {/* Top Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-800 text-zinc-100 border border-zinc-700 text-[11px] font-mono font-bold tracking-wider">
              <Flame className="w-3.5 h-3.5 text-zinc-300" />
              <span>ГЛАВНАЯ ПОДБОРКА</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 text-[11px] font-mono">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              <span>{collection.issueNumber}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 text-[11px] font-mono">
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              <span>{collection.animeList.length} тайтлов</span>
            </div>
          </div>

          {/* Japanese Subtitle & Title */}
          <div className="space-y-2">
            <span className="text-xs font-mono tracking-widest text-zinc-500 uppercase block">
              {collection.subtitleJp}
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold font-sans text-zinc-100 tracking-tight leading-[1.1]">
              {collection.title}
            </h2>
          </div>

          {/* Description */}
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl font-sans">
            {collection.description}
          </p>

          {/* KuroNami Branding Strip */}
          <div className="flex items-center gap-3 pt-2 border-t border-zinc-800">
            <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center font-display font-black text-xs text-white">
              KN
            </div>
            <div>
              <div className="text-xs sm:text-sm font-bold text-zinc-100">
                Коллекция от KuroNami
              </div>
              <p className="text-[11px] text-zinc-500 font-mono">
                Официальный сборник портала
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <Link
              href={collection.href}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-white hover:bg-zinc-200 text-zinc-900 font-bold text-xs sm:text-sm transition-all"
            >
              <Play className="w-4 h-4 fill-zinc-900" />
              <span>Смотреть в каталоге</span>
            </Link>

            <button
              type="button"
              onClick={() => onQuickView(collection)}
              className="flex items-center gap-2 px-5 py-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
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
                  className="absolute w-32 sm:w-40 aspect-[3/4] rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950 shadow-xl"
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
                        <Star className="w-3 h-3 text-zinc-300" />
                        HD 1080p
                      </span>
                      <span className="text-[9px] font-mono text-zinc-400">KURO</span>
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
