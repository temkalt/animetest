'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Eye, Layers, Heart } from 'lucide-react';
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

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4, scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      transition={{ ...SPRINGS.snappy, delay: index * 0.05 }}
      className="group relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all duration-200 flex flex-col justify-between shadow-sm"
    >
      {/* Banner background layer */}
      <div className="relative w-full h-52 sm:h-60 overflow-hidden flex items-center justify-center bg-zinc-950">
        {collection.banner && (
          <Image
            src={collection.banner}
            alt={collection.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover object-center opacity-30 blur-sm group-hover:opacity-40 transition-all duration-300"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/50 to-transparent" />

        {/* Stacked Poster Fan-out */}
        <div className="relative z-10 w-full h-full flex items-center justify-center pt-8">
          {collection.posters.slice(0, 3).map((posterUrl, i) => {
            const offsets = [
              { rotate: -8, x: -30, y: 5 },
              { rotate: 0, x: 0, y: -5 },
              { rotate: 8, x: 30, y: 5 },
            ];
            const hoverOffsets = [
              { rotate: -15, x: -50, y: -5 },
              { rotate: 0, x: 0, y: -15 },
              { rotate: 15, x: 50, y: -5 },
            ];
            const config = offsets[i];
            const hoverConfig = hoverOffsets[i];

            return (
              <motion.div
                key={i}
                variants={{
                  rest: { rotate: config.rotate, x: config.x, y: config.y, scale: 1 },
                  hover: { rotate: hoverConfig.rotate, x: hoverConfig.x, y: hoverConfig.y, scale: 1.05 }
                }}
                initial="rest"
                animate="rest"
                whileHover="hover"
                transition={SPRINGS.snappy}
                className="absolute w-24 sm:w-28 aspect-[3/4] rounded-md overflow-hidden shadow-xl border border-zinc-700/50"
                style={{ zIndex: i === 1 ? 10 : 5 }}
              >
                <Image src={posterUrl} alt="Poster" fill sizes="120px" className="object-cover" />
              </motion.div>
            );
          })}
        </div>

        {/* Top Floating Badges Bar */}
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between z-20 gap-2 pointer-events-none">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-widest uppercase bg-black/70 backdrop-blur-md text-zinc-200 border border-zinc-750">
              {collection.issueNumber}
            </span>
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md bg-black/70 border border-zinc-750 text-zinc-300">
              {collection.categoryLabel}
            </span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-zinc-750 text-[11px] font-mono text-zinc-200">
              <Layers className="w-3 h-3 text-zinc-400" />
              <span className="font-bold">{collection.animeList.length}</span>
            </div>
            <motion.button
              whileTap={{ scale: 1.3 }}
              transition={{ type: 'spring', stiffness: 500, damping: 15 }}
              onClick={(e) => {
                e.preventDefault();
                setIsLiked(!isLiked);
              }}
              className="p-1.5 rounded-md bg-black/70 backdrop-blur-md border border-zinc-750 text-zinc-400 hover:text-red-400 transition-colors flex items-center justify-center cursor-pointer"
            >
              <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Editorial Content Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4 relative z-10">
        <div className="space-y-2.5">
          {/* Japanese Subtitle */}
          <div className="text-[10px] font-mono tracking-widest text-zinc-500 uppercase">
            {collection.subtitleJp}
          </div>

          {/* Main Title */}
          <h3 className="text-lg sm:text-xl font-bold font-sans text-zinc-100 tracking-tight leading-snug group-hover:text-white transition-colors">
            {collection.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 font-sans">
            {collection.description}
          </p>

          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {collection.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800/60 text-zinc-400 border border-zinc-800"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom Section: KuroNami Official Badge & Actions */}
        <div className="pt-3.5 border-t border-zinc-800 space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center font-display font-black text-[10px] text-white">
              KN
            </div>
            <span className="text-xs font-semibold text-zinc-300">
              Коллекция от KuroNami
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onQuickView(collection);
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 text-xs font-semibold transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Список ({collection.animeList.length})</span>
            </button>

            <Link
              href={collection.href}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-900 text-xs font-semibold transition-all"
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
