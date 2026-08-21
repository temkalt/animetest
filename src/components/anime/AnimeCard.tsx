'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Play, Star, Sparkles } from 'lucide-react';
import { SPRINGS } from '@/lib/motion-presets';
import { UnifiedAnime } from '@/types';

interface AnimeCardProps {
  anime: UnifiedAnime;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 350, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 350, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['7deg', '-7deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-7deg', '7deg']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const title = anime.title.russian || anime.title.english || anime.title.romaji;

  return (
    <div className="relative select-none" style={{ perspective: 1000 }}>
      <Link href={`/anime/${anime.id}`} className="block group">
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
          whileHover={{ scale: 1.03, y: -4 }}
          transition={SPRINGS.snappy}
          className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#0F1117] border border-white/[0.08] shadow-lg group-hover:border-indigo-500/50 group-hover:shadow-2xl group-hover:shadow-indigo-500/15 transition-all duration-300"
        >
          {/* Poster Image */}
          {anime.coverImage.original && (
            <Image
              src={anime.coverImage.original}
              alt={title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
          )}

          {/* Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

          {/* Top Badges */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1 z-20 pointer-events-none">
            <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider bg-black/60 text-cyan-300 border border-cyan-500/30 backdrop-blur-md">
              1080P
            </span>

            {anime.score > 0 && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-black/60 text-amber-400 border border-amber-500/30 backdrop-blur-md">
                <Star className="w-3 h-3 fill-amber-400" />
                <span>{anime.score.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Play Icon Center Button on Hover */}
          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="w-11 h-11 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-xl shadow-indigo-600/50 backdrop-blur-sm group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </div>
          </div>

          {/* Bottom Meta & Title */}
          <div className="absolute bottom-0 inset-x-0 p-3.5 z-20 space-y-1">
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
              <span className="text-indigo-400 font-semibold">{anime.format || 'TV'}</span>
              <span>•</span>
              <span className="truncate">{anime.genres?.[0] || 'Аниме'}</span>
              {anime.episodesTotal && (
                <>
                  <span>•</span>
                  <span>{anime.episodesTotal} эп.</span>
                </>
              )}
            </div>

            <h3 className="text-xs sm:text-sm font-bold font-display text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-tight">
              {title}
            </h3>
          </div>
        </motion.div>
      </Link>
    </div>
  );
};
