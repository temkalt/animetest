'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Play, Star, Sparkles } from 'lucide-react';
import { SPRINGS } from '@/lib/motion-presets';
import { UnifiedAnime } from '@/types';

interface AnimeCardProps {
  anime: UnifiedAnime;
  priority?: boolean;
  className?: string;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({
  anime,
  priority = false,
  className = '',
}) => {
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

  // Title hierarchy
  const primaryTitle =
    anime.title.russian || anime.title.english || anime.title.romaji;
  const secondaryTitle = anime.title.russian
    ? anime.title.english || anime.title.romaji
    : anime.title.romaji !== primaryTitle
    ? anime.title.romaji
    : null;

  // Format label mapping
  const formatLabel =
    anime.format === 'TV'
      ? 'TV'
      : anime.format === 'MOVIE'
      ? 'ФИЛЬМ'
      : anime.format === 'OVA'
      ? 'OVA'
      : anime.format === 'ONA'
      ? 'ONA'
      : anime.format === 'SPECIAL'
      ? 'СПЕШЛ'
      : anime.format || 'TV';

  // Quick genre chips (max 2)
  const genreChips = (anime.genres || []).slice(0, 2);

  return (
    <div
      className={`relative select-none ${className}`}
      style={{ perspective: 1000 }}
    >
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
          className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-[#0A0D14] border border-white/[0.08] shadow-lg group-hover:border-indigo-500/50 group-hover:shadow-[0_0_30px_rgba(99,102,241,0.25)] transition-all duration-300"
        >
          {/* Specular Top Rim Highlight */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent z-30 pointer-events-none" />

          {/* Poster Image with Zoom on Hover */}
          {anime.coverImage?.original ? (
            <Image
              src={anime.coverImage.original}
              alt={primaryTitle}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              priority={priority}
              className="object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/40 via-[#0A0D14] to-[#06070A] flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-zinc-600 animate-pulse" />
            </div>
          )}

          {/* Top Ambient Scrim for Badges */}
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-black/80 via-black/30 to-transparent z-10 pointer-events-none" />

          {/* Bottom Glassmorphic Gradient Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06070A] via-[#06070A]/80 via-35% via-transparent to-transparent z-10 pointer-events-none" />

          {/* Cyber Neon Ambient Radial Backlight on Hover */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none" />

          {/* Top Badges: 1080p FHD Pill + Amber Score Badge */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1.5 z-20 pointer-events-none">
            {/* 1080p FHD Pill with glowing cyan border */}
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#06070A]/70 text-cyan-300 border border-cyan-400/40 backdrop-blur-md shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] animate-pulse" />
              <span className="text-[10px] font-mono font-bold tracking-wider uppercase">
                1080P FHD
              </span>
            </div>

            {/* Score badge with star and amber rating */}
            {anime.score > 0 ? (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#06070A]/70 text-amber-300 border border-amber-400/40 backdrop-blur-md shadow-[0_0_12px_rgba(245,158,11,0.25)] font-mono font-bold text-[10px]">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]" />
                <span>{anime.score.toFixed(1)}</span>
              </div>
            ) : anime.status === 'RELEASING' ? (
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#06070A]/70 text-emerald-300 border border-emerald-400/40 backdrop-blur-md shadow-[0_0_10px_rgba(16,185,129,0.2)] font-mono font-bold text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>NEW</span>
              </div>
            ) : null}
          </div>

          {/* Centered Play Button with Neon Pulse on Hover */}
          <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none scale-90 group-hover:scale-100">
            <div className="relative flex items-center justify-center">
              {/* Outer Neon Glow Pulse */}
              <span className="absolute -inset-2 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 opacity-40 blur-md animate-pulse" />
              <span className="absolute inset-0 rounded-full border border-cyan-400/40 animate-ping opacity-30" />

              {/* Central Glowing Button */}
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 text-white flex items-center justify-center shadow-[0_0_24px_rgba(99,102,241,0.7)] backdrop-blur-md border border-white/25 group-hover:scale-110 transition-transform duration-300">
                <Play className="w-5 h-5 fill-white text-white translate-x-0.5 drop-shadow-md" />
              </div>
            </div>
          </div>

          {/* Bottom Content: Chips, Typography & Subtitle */}
          <div className="absolute bottom-0 inset-x-0 p-3 z-20 space-y-1.5">
            {/* Format Tag, Quick Genre Chips & Episode Metadata */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {/* Format Tag */}
              <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 font-mono font-bold text-[10px] uppercase shadow-sm">
                {formatLabel}
              </span>

              {/* Quick Genre Chips */}
              {genreChips.map((genre) => (
                <span
                  key={genre}
                  className="px-1.5 py-0.5 rounded bg-white/[0.07] border border-white/10 text-zinc-300 text-[10px] font-medium backdrop-blur-sm truncate max-w-[80px]"
                >
                  {genre}
                </span>
              ))}

              {/* Episodes Counter */}
              {anime.episodesTotal ? (
                <span className="text-[10px] font-mono text-zinc-400 ml-auto">
                  {anime.episodesTotal} эп.
                </span>
              ) : anime.episodesAired ? (
                <span className="text-[10px] font-mono text-zinc-400 ml-auto">
                  {anime.episodesAired}+ эп.
                </span>
              ) : null}
            </div>

            {/* Typography: Primary Title & Subtitle */}
            <div className="space-y-0.5">
              <h3 className="text-xs sm:text-sm font-bold font-display text-white group-hover:text-indigo-300 transition-colors line-clamp-1 leading-snug">
                {primaryTitle}
              </h3>

              {secondaryTitle && (
                <p className="text-[11px] text-zinc-400 font-sans line-clamp-1 group-hover:text-zinc-300 transition-colors">
                  {secondaryTitle}
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </Link>
    </div>
  );
};
