'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Star, Flame, ChevronRight, ChevronLeft } from 'lucide-react';
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
    }, 7000);
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
    <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[540px] rounded-3xl overflow-hidden bg-[#08090D] border border-white/[0.08] shadow-2xl group">
      {/* Background Banner with Motion Transition */}
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
              className="object-cover opacity-60 filter saturate-110"
            />
          ) : null}

          {/* Cinematic Multi-Stop Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#08090D] via-[#08090D]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/30 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Hero Content Layer */}
      <div className="relative z-20 h-full flex flex-col justify-end p-6 sm:p-12 max-w-3xl space-y-4">
        {/* Airing / Popularity Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 backdrop-blur-md text-[11px] font-mono font-semibold">
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>ТРЕНД СЕЗОНА</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md text-[11px] font-mono font-semibold">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{current.score.toFixed(1)} / 10</span>
          </div>

          {current.genres.slice(0, 3).map((g) => (
            <span
              key={g}
              className="px-2.5 py-1 rounded-full bg-white/[0.06] text-zinc-300 border border-white/[0.08] text-[11px] font-sans"
            >
              {g}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white line-clamp-2 drop-shadow-md">
          {title}
        </h1>

        {/* Synopsis */}
        <p className="text-xs sm:text-sm text-zinc-300 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-2xl font-sans">
          {current.synopsisRu || current.synopsisEn || 'Смотрите в высоком качестве Full HD 1080p с выбором лучших студий озвучки.'}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Link
            href={`/watch/${current.id}/1`}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-display font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Смотреть 1 серию</span>
          </Link>

          <Link
            href={`/anime/${current.id}`}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] text-zinc-200 border border-white/[0.08] font-display font-medium text-xs backdrop-blur-md transition-all hover:scale-105"
          >
            <Info className="w-4 h-4 text-zinc-300" />
            <span>О тайтле</span>
          </Link>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute bottom-6 right-6 z-30 hidden sm:flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrev}
          className="w-9 h-9 rounded-xl bg-[#0F1117]/80 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="w-9 h-9 rounded-xl bg-[#0F1117]/80 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-3 inset-x-0 z-30 flex sm:hidden items-center justify-center gap-1.5">
        {items.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setDirection(idx > currentIndex ? 1 : -1);
              setCurrentIndex(idx);
            }}
            className={`h-1 rounded-full transition-all ${
              idx === currentIndex ? 'w-6 bg-indigo-500' : 'w-1.5 bg-white/20'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
