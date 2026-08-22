'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Play, Info, Star, ChevronRight, ChevronLeft } from 'lucide-react';
import { UnifiedAnime } from '@/types';

interface HeroShowcaseProps {
  items: UnifiedAnime[];
}

const ROTATION_INTERVAL = 7000;

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const topItems = items.slice(0, 6);
  const count = topItems.length;

  const handleNext = useCallback(() => {
    if (count <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % count);
  }, [count]);

  const handlePrev = useCallback(() => {
    if (count <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + count) % count);
  }, [count]);

  const handleSelect = useCallback(
    (index: number) => {
      if (index === currentIndex) return;
      setDirection(index > currentIndex ? 1 : -1);
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

  const handleDragEnd = (e: any, { offset, velocity }: any) => {
    const swipe = offset.x;
    if (swipe < -50) {
      handleNext();
    } else if (swipe > 50) {
      handlePrev();
    }
  };

  if (!items || items.length === 0) return null;

  const current = topItems[currentIndex] || items[0];
  const title = current.title.russian || current.title.romaji || current.title.english || 'Без названия';
  const backdropUrl = current.bannerImage || current.coverImage.original || current.coverImage.medium || '';
  const synopsis = current.synopsisRu || current.synopsisEn || 'Описание отсутствует.';

  const slideVariants: Variants = {
    enter: (direction: number) => ({ x: direction > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    exit: (direction: number) => ({ x: direction < 0 ? 40 : -40, opacity: 0, transition: { duration: 0.25 } }),
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'ArrowRight') handleNext();
      }}
      className="relative w-full aspect-[16/11] sm:aspect-[21/10] lg:aspect-[2.35/1] min-h-[500px] rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-sm group select-none focus:outline-none"
    >
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={current.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing"
        >
          {backdropUrl ? (
            <div className="relative w-full h-full pointer-events-none">
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
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/50 to-transparent pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 h-full flex flex-col justify-end p-6 lg:p-10 max-w-3xl pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ staggerChildren: 0.1 }}
            className="space-y-4 pointer-events-auto"
          >
            <motion.div variants={contentVariants} className="flex items-center gap-3 text-sm text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5 text-zinc-100">
                <Star className="w-4 h-4" />
                {current.score > 0 ? current.score.toFixed(1) : 'N/A'}
              </span>
              <span>•</span>
              <span>{current.format || 'TV'}</span>
              <span>•</span>
              <span>{current.seasonYear || 'N/A'}</span>
            </motion.div>

            <motion.h1 variants={contentVariants} className="text-3xl sm:text-5xl font-bold font-sans tracking-tight text-zinc-100 line-clamp-2">
              {title}
            </motion.h1>

            <motion.p variants={contentVariants} className="text-sm sm:text-base text-zinc-300 line-clamp-2 sm:line-clamp-3 font-sans max-w-2xl leading-relaxed">
              {synopsis}
            </motion.p>

            <motion.div variants={contentVariants} className="flex items-center gap-3 pt-2">
              <Link
                href={`/watch/${current.id}/1`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white text-zinc-900 font-sans font-semibold text-sm hover:bg-zinc-200 transition-colors shadow-sm cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Смотреть</span>
              </Link>
              <Link
                href={`/anime/${current.id}`}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-zinc-800/90 text-zinc-100 border border-zinc-700 font-sans font-medium text-sm hover:bg-zinc-700 transition-colors cursor-pointer"
              >
                <Info className="w-4 h-4" />
                <span>Подробнее</span>
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Indicators & Navigation Buttons */}
      <div className="absolute bottom-6 right-6 lg:bottom-10 lg:right-10 z-20 flex items-center gap-4 pointer-events-auto">
        <div className="flex items-center gap-1.5 bg-zinc-900/80 px-2.5 py-1.5 rounded-full border border-zinc-800">
          {topItems.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelect(index)}
              aria-label={`Перейти к слайду ${index + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentIndex ? 'w-6 bg-white' : 'w-1.5 bg-zinc-600 hover:bg-zinc-400'
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Предыдущий слайд"
            className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Следующий слайд"
            className="p-2 rounded-lg bg-zinc-900/80 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
