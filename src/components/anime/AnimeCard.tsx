'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Play, Plus, Star, Sparkles, Tv } from 'lucide-react';
import { SPRINGS, quickPreviewModalVariants } from '@/lib/motion-presets';
import { UnifiedAnime } from '@/types';

interface AnimeCardProps {
  anime: UnifiedAnime;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDwellPreview, setIsDwellPreview] = useState(false);
  const dwellTimerRef = useRef<NodeJS.Timeout | null>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x, { stiffness: 350, damping: 25 });
  const mouseYSpring = useSpring(y, { stiffness: 350, damping: 25 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['10deg', '-10deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-10deg', '10deg']);
  const glareOpacity = useTransform(
    [mouseXSpring, mouseYSpring],
    ([currX, currY]) => Math.min(0.4, Math.hypot(Number(currX), Number(currY)) * 0.7)
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const normalizedX = (e.clientX - rect.left) / rect.width - 0.5;
    const normalizedY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(normalizedX);
    y.set(normalizedY);
  };

  const handleMouseEnter = () => {
    dwellTimerRef.current = setTimeout(() => {
      setIsDwellPreview(true);
    }, 400);
  };

  const handleMouseLeave = () => {
    if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    setIsDwellPreview(false);
    x.set(0);
    y.set(0);
  };

  const title = anime.title.russian || anime.title.english || anime.title.romaji;

  return (
    <div className="relative select-none" style={{ perspective: 1000 }}>
      <Link href={`/anime/${anime.id}`}>
        <motion.div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX,
            rotateY,
            transformStyle: 'preserve-3d',
          }}
          whileHover={{ scale: 1.03, z: 15 }}
          transition={SPRINGS.snappy}
          className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden cursor-pointer bg-[#0E1017] border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.6)] hover:border-violet-500/50 hover:shadow-[0_12px_32px_rgba(139,92,246,0.25)] transition-colors group"
        >
          {/* Poster Image */}
          {anime.coverImage.original && (
            <Image
              src={anime.coverImage.original}
              alt={title}
              fill
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          )}

          {/* Holographic Sheen Layer */}
          <motion.div
            className="absolute inset-0 pointer-events-none mix-blend-overlay z-10"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(139,92,246,0.6) 0%, rgba(6,182,212,0.3) 50%, transparent 80%)',
              opacity: glareOpacity,
            }}
          />

          {/* Badges Overlay */}
          <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between gap-1 z-20 pointer-events-none">
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 backdrop-blur-md">
                1080P
              </span>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-violet-600/30 text-violet-300 border border-violet-500/40 backdrop-blur-md">
                DUB
              </span>
            </div>

            {anime.episodesAired ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-black/70 text-white/90 border border-white/10 backdrop-blur-md">
                EP {anime.episodesAired}
              </span>
            ) : null}
          </div>

          {/* Scrim Gradient & Card Info */}
          <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-[#07080B] via-[#07080B]/85 to-transparent z-20 flex flex-col gap-1">
            <h4 className="text-xs sm:text-sm font-display font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
              {title}
            </h4>
            <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1 text-amber-400 font-bold">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {anime.score.toFixed(1)}
              </span>
              <span className="text-[10px] text-slate-400 uppercase">{anime.format}</span>
            </div>
          </div>
        </motion.div>
      </Link>

      {/* Dwell Quick Preview Card */}
      <AnimatePresence>
        {isDwellPreview && (
          <motion.div
            variants={quickPreviewModalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] z-50 rounded-2xl bg-[#141722]/95 border border-white/20 shadow-[0_24px_60px_rgba(0,0,0,0.95)] backdrop-blur-2xl p-4 flex flex-col gap-3 pointer-events-auto"
          >
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-900">
              <Image
                src={anime.bannerImage || anime.coverImage.original}
                alt={title}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2.5">
                <span className="text-[11px] font-mono font-semibold text-cyan-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  Быстрый старт
                </span>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-display font-bold text-white line-clamp-1">{title}</h3>
              <p className="text-xs font-sans text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                {anime.synopsisRu || anime.synopsisEn || 'Захватывающий сюжет и динамичные сражения в высоком качестве.'}
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1 border-t border-white/10">
              <Link
                href={`/watch/${anime.id}/1`}
                className="flex-1 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-display font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(139,92,246,0.4)]"
              >
                <Play className="w-3.5 h-3.5 fill-white text-white" />
                <span>Смотреть</span>
              </Link>
              <Link
                href={`/anime/${anime.id}`}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-mono text-xs border border-white/10 transition-colors"
              >
                Инфо
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
