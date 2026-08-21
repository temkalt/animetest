'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Info, Star, Flame, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { UnifiedAnime } from '@/types';
import { SPRINGS } from '@/lib/motion-presets';

interface HeroShowcaseProps {
  items: UnifiedAnime[];
}

const ROTATION_INTERVAL = 7000; // 7 seconds per slide

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 100 : -100,
    opacity: 0,
    scale: 0.98,
    filter: 'blur(8px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      x: SPRINGS.gentle,
      opacity: { duration: 0.45 },
      scale: SPRINGS.gentle,
      filter: { duration: 0.35 },
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 100 : -100,
    opacity: 0,
    scale: 1.02,
    filter: 'blur(8px)',
    transition: { duration: 0.4, ease: 'easeIn' as const },
  }),
};

const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: 'easeOut' as const,
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
};

const itemVariant = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: SPRINGS.snappy },
};

export const HeroShowcase: React.FC<HeroShowcaseProps> = ({ items }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const topItems = items.slice(0, 5);
  const count = topItems.length;

  const handleNext = useCallback(() => {
    if (count <= 1) return;
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % count);
    setProgressKey((prev) => prev + 1);
  }, [count]);

  const handlePrev = useCallback(() => {
    if (count <= 1) return;
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + count) % count);
    setProgressKey((prev) => prev + 1);
  }, [count]);

  const handleSelect = useCallback(
    (index: number) => {
      if (index === currentIndex) return;
      setDirection(index > currentIndex ? 1 : -1);
      setCurrentIndex(index);
      setProgressKey((prev) => prev + 1);
    },
    [currentIndex]
  );

  // Auto rotation timer with pause-on-hover
  useEffect(() => {
    if (count <= 1 || isPaused) return;

    const timer = setInterval(() => {
      handleNext();
    }, ROTATION_INTERVAL);

    return () => clearInterval(timer);
  }, [count, isPaused, handleNext, currentIndex]);

  // Touch Swipe Handlers for Mobile
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
  const subtitle = current.title.romaji !== title ? current.title.romaji : current.title.english;
  const nativeTitle = current.title.native;
  const backdropUrl = current.bannerImage || current.coverImage.original || current.coverImage.medium || '';
  const accentColor = current.coverImage.color || '#6366F1';

  // Format season string
  const seasonMap: Record<string, string> = {
    WINTER: 'Зима',
    SPRING: 'Весна',
    SUMMER: 'Лето',
    FALL: 'Осень',
  };
  const formattedSeason = current.season ? seasonMap[current.season] || current.season : null;
  const seasonText = [formattedSeason, current.seasonYear].filter(Boolean).join(' ');

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
      className="relative w-full aspect-[16/11] sm:aspect-[21/10] lg:aspect-[2.35/1] min-h-[500px] sm:min-h-[540px] lg:min-h-[570px] rounded-3xl overflow-hidden bg-[#06070A] border border-white/[0.08] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95)] group select-none focus:outline-none focus:ring-1 focus:ring-indigo-500/40"
    >
      {/* Dynamic Ambient Background Glow */}
      <div
        className="absolute -right-16 -top-16 w-96 h-96 rounded-full blur-[110px] pointer-events-none opacity-25 transition-all duration-1000"
        style={{ backgroundColor: accentColor }}
      />
      <div className="absolute left-1/3 -bottom-20 w-[500px] h-64 rounded-full blur-[130px] pointer-events-none opacity-20 bg-indigo-600/30" />

      {/* Background Banner with Motion Cross-fade */}
      <AnimatePresence custom={direction} mode="wait">
        <motion.div
          key={current.id}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          className="absolute inset-0 z-0"
        >
          {backdropUrl ? (
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 1.04 }}
              transition={{ duration: 7, ease: 'linear' }}
              className="relative w-full h-full"
            >
              <Image
                src={backdropUrl}
                alt={title}
                fill
                priority
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover object-center sm:object-[center_20%] filter saturate-[1.15] brightness-[0.78]"
              />
            </motion.div>
          ) : (
            <div className="w-full h-full bg-[#0E1118]" />
          )}

          {/* Cinematic Multi-Stop Gradient Overlays for High Legibility */}
          {/* Left-to-Right Scrim */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#06070A] via-[#06070A]/95 via-35% md:via-[#06070A]/80 md:via-55% lg:via-[#06070A]/50 lg:via-70% to-transparent" />
          {/* Bottom-to-Top Scrim */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#06070A] via-[#06070A]/75 via-35% to-transparent" />
          {/* Top Vignette */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#06070A]/80 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Hero Content Layer */}
      <div className="relative z-20 h-full flex flex-col justify-end p-6 sm:p-10 lg:p-12 max-w-3xl space-y-4 sm:space-y-5">
        <AnimatePresence mode="wait">
          <motion.div
            key={current.id}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-3.5 sm:space-y-4"
          >
            {/* 1. Badges Row: Trend, Rating, Quality, Genres */}
            <motion.div variants={itemVariant} className="flex items-center gap-2 flex-wrap">
              {/* Season Trend Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/35 backdrop-blur-md text-[11px] sm:text-xs font-mono font-bold tracking-wider uppercase shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                <Flame className="w-3.5 h-3.5 text-rose-400 fill-rose-400 animate-pulse" />
                <span>ТРЕНД СЕЗОНА</span>
              </div>

              {/* Rating Pill */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/35 backdrop-blur-md text-[11px] sm:text-xs font-mono font-bold tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{current.score > 0 ? current.score.toFixed(1) : '9.0'} / 10</span>
              </div>

              {/* Quality / Format Pill */}
              <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 backdrop-blur-md text-[11px] sm:text-xs font-mono font-bold">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>{current.format || 'TV'} • 1080P</span>
              </div>

              {/* Genre Tags */}
              {current.genres.slice(0, 3).map((g) => (
                <span
                  key={g}
                  className="px-2.5 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-zinc-300 border border-white/[0.08] backdrop-blur-md text-[11px] sm:text-xs font-sans transition-colors"
                >
                  {g}
                </span>
              ))}
            </motion.div>

            {/* 2. Subtitle / Native Japanese Kana */}
            {(subtitle || nativeTitle) && (
              <motion.div
                variants={itemVariant}
                className="flex items-center gap-2 text-xs sm:text-sm font-mono tracking-wider text-zinc-400/90 uppercase truncate max-w-xl"
              >
                {subtitle && <span className="truncate">{subtitle}</span>}
                {subtitle && nativeTitle && <span className="text-zinc-600">•</span>}
                {nativeTitle && <span className="text-zinc-500 font-sans">{nativeTitle}</span>}
              </motion.div>
            )}

            {/* 3. Bold Headline */}
            <motion.h1
              variants={itemVariant}
              className="text-2xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-extrabold font-display tracking-tight text-white line-clamp-2 drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)] leading-[1.1]"
            >
              {title}
            </motion.h1>

            {/* 4. Release Meta info */}
            <motion.div
              variants={itemVariant}
              className="flex items-center gap-2.5 text-xs sm:text-sm font-mono text-zinc-400/90"
            >
              {current.studios?.[0] && (
                <>
                  <span className="text-zinc-200 font-semibold">{current.studios[0]}</span>
                  <span className="text-zinc-600">•</span>
                </>
              )}
              {seasonText && (
                <>
                  <span>{seasonText}</span>
                  <span className="text-zinc-600">•</span>
                </>
              )}
              <span className="text-indigo-300">
                {current.episodesTotal ? `${current.episodesTotal} эп.` : 'Онгоинг'}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-emerald-400">Full HD Dub</span>
            </motion.div>

            {/* 5. Clean Synopsis */}
            <motion.p
              variants={itemVariant}
              className="text-xs sm:text-sm text-zinc-300/90 line-clamp-2 sm:line-clamp-3 leading-relaxed max-w-2xl font-sans drop-shadow-sm"
            >
              {current.synopsisRu ||
                current.synopsisEn ||
                'Смотрите в высоком качестве Full HD 1080p с моментальным переключением топовых студий озвучки без рекламы.'}
            </motion.p>

            {/* 6. Stylish CTA Buttons */}
            <motion.div variants={itemVariant} className="flex items-center gap-3 pt-2 sm:pt-3">
              {/* Primary Indigo CTA */}
              <Link
                href={`/watch/${current.id}/1`}
                className="group/btn relative inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:via-indigo-500 hover:to-violet-500 text-white font-display font-bold text-xs sm:text-sm shadow-[0_0_25px_rgba(99,102,241,0.45)] hover:shadow-[0_0_35px_rgba(99,102,241,0.7)] transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
              >
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center group-hover/btn:scale-110 transition-transform">
                  <Play className="w-3 h-3 fill-white text-white ml-0.5" />
                </div>
                <span>Смотреть 1 серию</span>
              </Link>

              {/* Secondary Glass CTA */}
              <Link
                href={`/anime/${current.id}`}
                className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl bg-white/[0.08] hover:bg-white/[0.16] text-white border border-white/15 hover:border-white/30 backdrop-blur-xl font-display font-semibold text-xs sm:text-sm shadow-lg shadow-black/40 transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
              >
                <Info className="w-4 h-4 text-zinc-300 group-hover:text-white transition-colors" />
                <span>О тайтле</span>
              </Link>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop Interactive Thumbnail Preview Strip (Top 5) */}
      <div className="absolute bottom-6 right-6 z-30 hidden lg:flex items-center gap-2.5 bg-[#0A0D14]/80 p-2 rounded-2xl border border-white/10 backdrop-blur-xl shadow-2xl">
        <div className="flex items-center gap-2">
          {topItems.map((item, idx) => {
            const isSelected = idx === currentIndex;
            const itemTitle = item.title.russian || item.title.english || item.title.romaji;
            const thumbUrl = item.coverImage.medium || item.coverImage.original || item.bannerImage || '';

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(idx)}
                className={`group/thumb relative w-16 h-22 rounded-xl overflow-hidden transition-all duration-300 text-left cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-105 opacity-100'
                    : 'opacity-50 hover:opacity-100 hover:scale-100 border border-white/10'
                }`}
                title={itemTitle}
              >
                {thumbUrl && (
                  <Image
                    src={thumbUrl}
                    alt={itemTitle}
                    fill
                    sizes="64px"
                    className="object-cover transition-transform duration-300 group-hover/thumb:scale-110"
                  />
                )}

                {/* Dark Gradient Scrim on Thumbnail */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                {/* Index / Score Badge */}
                <div className="absolute top-1 left-1 px-1 rounded bg-black/60 backdrop-blur-sm text-[9px] font-mono font-bold text-white">
                  0{idx + 1}
                </div>

                {/* Active Rotation Progress Bar */}
                {isSelected && (
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 overflow-hidden">
                    <div
                      key={progressKey}
                      className="h-full bg-indigo-400"
                      style={{
                        animation: `progressTimer ${ROTATION_INTERVAL}ms linear infinite`,
                        animationPlayState: isPaused ? 'paused' : 'running',
                      }}
                    />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Desktop Prev / Next Glass Controls */}
        <div className="flex flex-col gap-1.5 pl-1 border-l border-white/10">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Предыдущий слайд"
            className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.18] border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Следующий слайд"
            className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.18] border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tablet / Mobile Navigation & Indicators */}
      <div className="absolute bottom-4 inset-x-0 z-30 flex lg:hidden items-center justify-between px-6">
        {/* Pagination Pill Dots with Active Progress */}
        <div className="flex items-center gap-1.5">
          {topItems.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleSelect(idx)}
              aria-label={`Перейти к слайду ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                idx === currentIndex
                  ? 'w-8 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]'
                  : 'w-2 bg-white/25 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        {/* Mobile Prev / Next Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Предыдущий слайд"
            className="w-8 h-8 rounded-xl bg-[#0F1117]/80 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Следующий слайд"
            className="w-8 h-8 rounded-xl bg-[#0F1117]/80 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center transition-all cursor-pointer backdrop-blur-md"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Global CSS animation for thumbnail countdown bar */}
      <style jsx global>{`
        @keyframes progressTimer {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};
