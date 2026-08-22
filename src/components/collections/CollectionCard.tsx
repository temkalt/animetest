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
      className="group relative rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between"
    >
      {/* Banner background layer */}
      <div className="relative w-full h-56 sm:h-64 overflow-hidden">
        {collection.banner ? (
          <Image
            src={collection.banner}
            alt={collection.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center filter group-hover:scale-105 transition-all duration-300 ease-out opacity-80 group-hover:opacity-100"
          />
        ) : (
          <div className="absolute inset-0 bg-zinc-950" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />

        {/* Top Floating Badges Bar */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between z-20 gap-2">
          {/* Issue & Category Tag */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-widest uppercase bg-black/60 backdrop-blur-md text-zinc-200 border border-zinc-800">
              {collection.issueNumber}
            </span>
            <span className="px-2.5 py-1 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md bg-black/60 border border-zinc-800 text-zinc-200">
              {collection.categoryLabel}
            </span>
          </div>

          {/* Interactive Heart Button */}
          <button
            type="button"
            onClick={handleLike}
            className={`relative flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold backdrop-blur-md transition-all cursor-pointer ${
              isLiked
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'bg-black/60 text-zinc-300 border border-zinc-800 hover:text-white hover:bg-zinc-800'
            }`}
          >
            <Heart
              className={`w-3.5 h-3.5 transition-colors ${
                isLiked ? 'fill-white text-white' : 'text-zinc-400 group-hover:text-white'
              }`}
            />
            <span>{likesCount}</span>
          </button>
        </div>

        {/* Count Pill in lower left of header image */}
        <div className="absolute bottom-3 left-4 z-10 flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900/80 backdrop-blur-md border border-zinc-800 text-[11px] font-mono text-zinc-300">
            <Layers className="w-3 h-3 text-zinc-400" />
            <span className="font-semibold text-zinc-100">{collection.count}</span>
            <span>тайтлов</span>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-zinc-900/80 backdrop-blur-md border border-zinc-800 text-[11px] font-mono text-zinc-300">
            <Clock className="w-3 h-3 text-zinc-400" />
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
            <h3 className="text-xl sm:text-2xl font-bold font-sans text-zinc-100 tracking-tight leading-snug transition-colors duration-200 group-hover:text-white">
              {collection.title}
            </h3>
          </Link>

          {/* Editorial Note / Description */}
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-2 font-sans">
            {collection.description}
          </p>

          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {collection.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-zinc-800/50 text-zinc-400 border border-zinc-800 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Section: Curator Badge & Actions */}
        <div className="pt-4 border-t border-zinc-800 space-y-4">
          {/* Curator Profile Strip */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-zinc-800 shrink-0 bg-zinc-800">
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
                  <span className="text-xs font-semibold text-zinc-100 truncate">
                    {collection.curator.name}
                  </span>
                  {collection.curator.verified && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                  )}
                </div>
                <p className="text-[10px] text-zinc-500 truncate font-mono">
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
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-medium transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Список ({collection.animeList.length})</span>
            </button>

            <Link
              href={collection.href}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md bg-white hover:bg-zinc-200 text-zinc-900 text-xs font-medium transition-all"
            >
              <span>Смотреть</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
