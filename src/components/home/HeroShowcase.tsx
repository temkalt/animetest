'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Star, Radio, Sparkles, ChevronRight, ChevronLeft } from 'lucide-react';
import { UnifiedAnime } from '@/types';
import { heroSliderVariants, SPRINGS } from '@/lib/motion-presets';

interface HeroShowcaseProps {
  items: UnifiedAnime[];
}

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    if (items.length <= 1) return;
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [items.length]);

  if (!items || items.length === 0) return null;

  const current = items[currentIndex];
  const title = current.title.russian || current.title.english || current.title.romaji;

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  return (
    <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[580px] rounded-3xl overflow-hidden bg-[#07080B] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
      {/* Background Banner with Ambient Blur */}
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={current.id}
          custom={direction}
          variants={heroSliderVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0"
        >
          {current.bannerImage || current.coverImage.original ? (
            <Image
              src={current.bannerImage || current.coverImage.original}
              alt={title}
              fill
              priority
              className="object-cover opacity-60 filter saturate-125"
            />
          ) : null}

          {/* Cinematic Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#07080B] via-[#07080B]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07080B] via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Hero Content Scrim */}
      <div className="relative z-20 h-full flex flex-col justify-end p-6 sm:p-12 max-w-3xl space-y-4">
        {/* Airing / Popularity Badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 backdrop-blur-md text-xs font-mono font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-rose-400" />
            <span>ТРЕНД СЕЗОНА</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 backdrop-blur-md text-xs font-mono font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{current.score.toFixed(1)} / 10</span>
          </div>

          {current.genres.slice(0, 3).map((g) => (
            <span key={g} className="px-2.5 py-1 rounded-full bg-white/5 text-slate-300 border border-white/10 text-xs font-sans">
              {g}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white line-clamp-2 drop-shadow-lg">
          {title}
        </h1>

        {/* Synopsis */}
        <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-2xl font-sans">
          {current.synopsisRu || current.synopsisEn || 'Смотрите в высоком качестве с выбором лучших озвучек и субтитров.'}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Link
            href={`/watch/${current.id}/1`}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-display font-bold text-sm shadow-[0_0_30px_rgba(139,92,246,0.5)] transition-all transform hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-white text-white" />
            <span>Смотреть 1 серию</span>
          </Link>

          <Link
            href={`/anime/${current.id}`}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 text-white font-display font-semibold text-sm backdrop-blur-md transition-all"
          >
            <span>О тайтле</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute right-6 bottom-6 z-30 flex items-center gap-2">
        <button
          onClick={handlePrev}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white backdrop-blur-md transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={handleNext}
          className="p-2.5 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 text-white backdrop-blur-md transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
