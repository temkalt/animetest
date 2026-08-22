'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Star, ChevronRight, ChevronLeft } from 'lucide-react';
import { UnifiedAnime } from '@/types';

interface HeroShowcaseProps {
  items: UnifiedAnime[];
}

const ROTATION_INTERVAL = 7000;

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const topItems = items.slice(0, 5);
  const count = topItems.length;

  const handleNext = useCallback(() => {
    if (count <= 1) return;
    setCurrentIndex((prev) => (prev + 1) % count);
  }, [count]);

  const handlePrev = useCallback(() => {
    if (count <= 1) return;
    setCurrentIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  const handleSelect = useCallback(
    (index: number) => {
      if (index === currentIndex) return;
      setCurrentIndex(index);
    },
    [currentIndex]
  );

  useEffect(() => {
    if (count <= 1 || isPaused) return;
    const timer = setInterval(() => {
      handleNext();
    }, ROTATION_INTERVAL);
    return () => clearInterval(timer);
  }, [count, isPaused, handleNext, currentIndex]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  if (!items || items.length === 0) return null;

  const current = topItems[currentIndex] || items[0];
  const title = current.title.russian || current.title.english || current.title.romaji || 'Без названия';
  const backdropUrl = current.bannerImage || current.coverImage.original || current.coverImage.medium || '';

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'ArrowRight') handleNext();
      }}
      className="relative w-full aspect-[16/11] sm:aspect-[21/10] lg:aspect-[2.35/1] min-h-[500px] rounded-lg overflow-hidden bg-zinc-950 border border-zinc-800 shadow-sm group select-none focus:outline-none"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute inset-0 z-0"
        >
          {backdropUrl ? (
            <div className="relative w-full h-full">
              <Image
                src={backdropUrl}
                alt={title}
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover object-center opacity-40"
              />
            </div>
          ) : (
            <div className="w-full h-full bg-zinc-950" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/50 to-transparent" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col justify-end p-6 lg:p-10 max-w-3xl space-y-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 text-sm text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5 text-zinc-100">
                <Star className="w-4 h-4" />
                {current.score > 0 ? current.score.toFixed(1) : 'N/A'}
              </span>
              <span>•</span>
              <span>{current.format || 'TV'}</span>
              <span>•</span>
              <span>{current.seasonYear || 'N/A'}</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold font-sans tracking-tight text-zinc-100 line-clamp-2">
              {title}
            </h1>

            <p className="text-sm sm:text-base text-zinc-400 line-clamp-2 sm:line-clamp-3 font-sans max-w-2xl">
              {current.synopsisRu || current.synopsisEn || 'Описание отсутствует.'}
            </p>

            <div className="flex items-center gap-3 pt-2">
              <Link
                href={`/watch/${current.id}/1`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white text-zinc-900 font-sans font-medium text-sm hover:bg-zinc-200 transition-colors"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Смотреть</span>
              </Link>
              <Link
                href={`/anime/${current.id}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-zinc-800 text-zinc-100 border border-zinc-700 font-sans font-medium text-sm hover:bg-zinc-700 transition-colors"
              >
                <Info className="w-4 h-4" />
                <span>Подробнее</span>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="absolute bottom-6 right-6 z-20 flex items-center gap-4">
        <div className="flex items-center gap-2">
          {topItems.map((_, idx) => (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              aria-label={`Слайд ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                idx === currentIndex ? 'w-6 bg-white' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
              }`}
            />
          ))}
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNext}
            className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
