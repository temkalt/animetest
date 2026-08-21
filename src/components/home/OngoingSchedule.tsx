'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Radio, 
  ArrowRight, 
  Clock, 
  Tv, 
  Play, 
  Sparkles, 
  Film,
  Compass
} from 'lucide-react';
import { SPRINGS } from '@/lib/motion-presets';

export const DAYS = [
  { id: 1, name: 'ПН', fullName: 'Понедельник' },
  { id: 2, name: 'ВТ', fullName: 'Вторник' },
  { id: 3, name: 'СР', fullName: 'Среда' },
  { id: 4, name: 'ЧТ', fullName: 'Четверг' },
  { id: 5, name: 'ПТ', fullName: 'Пятница' },
  { id: 6, name: 'СБ', fullName: 'Суббота' },
  { id: 7, name: 'ВС', fullName: 'Воскресенье' },
];

export interface ScheduleItem {
  id: number;
  title: string;
  episode: number;
  airingAt: number;
  timeStr: string;
  coverImage: string;
  format: string;
  studio?: string;
}

export interface ScheduleProps {
  scheduleData?: {
    [day: number]: ScheduleItem[];
  };
  initialDay?: number;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 14, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: SPRINGS.snappy,
  },
};

export const OngoingSchedule: React.FC<ScheduleProps> = ({
  scheduleData = {},
  initialDay,
}) => {
  const [todayDay, setTodayDay] = useState<number>(() => {
    const d = new Date().getDay();
    return d === 0 ? 7 : d;
  });

  const [selectedDay, setSelectedDay] = useState<number>(() => {
    if (initialDay !== undefined) return initialDay;
    const d = new Date().getDay();
    return d === 0 ? 7 : d;
  });

  useEffect(() => {
    const d = new Date().getDay();
    const currentDay = d === 0 ? 7 : d;
    setTodayDay(currentDay);
  }, []);

  const itemsForDay = scheduleData[selectedDay] || [];
  const currentDayInfo = DAYS.find((d) => d.id === selectedDay) || DAYS[0];
  const isSelectedToday = selectedDay === todayDay;

  return (
    <div className="w-full space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#0B0E17]/95 via-[#0D111D]/90 to-[#0B0E17]/95 border border-white/[0.08] backdrop-blur-xl shadow-lg relative overflow-hidden">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

        {/* Title & Live Status */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex-shrink-0 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <Radio className="w-5 h-5 animate-pulse text-cyan-400" />
            <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-cyan-400 ring-2 ring-[#0B0E17] animate-ping" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                ЭФИРНАЯ СЕТКА
              </span>
              <span className="text-zinc-600">•</span>
              <span className="text-[11px] font-mono text-zinc-400">
                {currentDayInfo.fullName}
                {isSelectedToday ? ' (Сегодня)' : ''}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold font-display tracking-tight text-white flex items-center gap-2">
              <span>Расписание выхода серий</span>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 border border-white/10">
                {itemsForDay.length} {itemsForDay.length === 1 ? 'релиз' : itemsForDay.length >= 2 && itemsForDay.length <= 4 ? 'релиза' : 'релизов'}
              </span>
            </h2>
          </div>
        </div>

        {/* Day Selector Pill Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-[#07090F]/90 border border-white/[0.08] backdrop-blur-md overflow-x-auto no-scrollbar max-w-full">
          {DAYS.map((d) => {
            const isToday = d.id === todayDay;
            const isSelected = d.id === selectedDay;
            const dayCount = scheduleData[d.id]?.length || 0;

            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDay(d.id)}
                className={`relative px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 select-none flex-shrink-0 ${
                  isSelected
                    ? 'text-white'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                {/* Active Pill Glow Background */}
                {isSelected && (
                  <motion.div
                    layoutId="activeScheduleDayPill"
                    className="absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-600 to-cyan-600 shadow-md shadow-indigo-500/25 border border-white/20"
                    transition={SPRINGS.snappy}
                  />
                )}

                {/* Day Text and Badges */}
                <span className="relative z-10">{d.name}</span>

                {/* Live 'Сегодня' glowing dot indicator */}
                {isToday && (
                  <span className="relative z-10 flex h-2 w-2 ml-0.5" title="Сегодня">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                  </span>
                )}

                {/* Count Pill */}
                {dayCount > 0 && (
                  <span
                    className={`relative z-10 text-[9px] px-1.5 py-0.2 rounded-full font-mono transition-colors ${
                      isSelected
                        ? 'bg-black/30 text-cyan-200'
                        : 'bg-white/[0.05] text-zinc-500 group-hover:text-zinc-300'
                    }`}
                  >
                    {dayCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Schedule Items Grid / Empty State */}
      <AnimatePresence mode="wait">
        {itemsForDay.length === 0 ? (
          <motion.div
            key={`empty-${selectedDay}`}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={SPRINGS.snappy}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0B0E17]/90 to-[#07090F]/90 border border-white/[0.08] p-8 sm:p-12 text-center backdrop-blur-xl shadow-xl"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-md mx-auto space-y-4">
              <div className="relative mx-auto w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.2)]">
                <Calendar className="w-8 h-8 text-cyan-400" />
                <div className="absolute inset-0 rounded-2xl border border-cyan-500/20 animate-pulse" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold font-display text-white tracking-tight">
                  Нет запланированных релизов на {currentDayInfo.fullName.toLowerCase()}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
                  Все серии этого дня уже вышли в эфир или ожидают обновления вещательной сетки.
                </p>
              </div>

              <div className="pt-2">
                <Link
                  href="/catalog?status=RELEASING"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-display font-semibold shadow-lg shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95 border border-white/10"
                >
                  <Compass className="w-4 h-4" />
                  <span>Каталог онгоингов сезона</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={`grid-${selectedDay}`}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5"
          >
            {itemsForDay.map((item) => (
              <motion.div key={`${item.id}-${item.episode}`} variants={cardVariants}>
                <Link
                  href={`/anime/${item.id}`}
                  className="group relative flex items-center gap-3.5 p-3 rounded-2xl bg-[#0B0E17]/85 hover:bg-[#101524] border border-white/[0.07] hover:border-cyan-500/40 transition-all duration-300 shadow-md hover:shadow-xl hover:shadow-cyan-500/10 backdrop-blur-md overflow-hidden"
                >
                  {/* Subtle specular line on hover */}
                  <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/0 group-hover:via-cyan-400/50 to-transparent transition-all duration-500" />

                  {/* Poster Thumbnail */}
                  <div className="relative w-16 h-22 sm:w-18 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-[#121624] border border-white/[0.08] group-hover:border-cyan-500/40 transition-colors shadow-sm">
                    {item.coverImage ? (
                      <Image
                        src={item.coverImage}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 72px, 80px"
                        className="object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <Film className="w-6 h-6" />
                      </div>
                    )}

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                    {/* Format Tag Overlay */}
                    <span className="absolute top-1 left-1 px-1.5 py-0.2 rounded-md bg-black/70 border border-white/10 text-[9px] font-mono font-bold text-zinc-300 backdrop-blur-xs">
                      {item.format || 'TV'}
                    </span>

                    {/* Play Hover Indicator */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[1px]">
                      <div className="w-7 h-7 rounded-full bg-cyan-500/90 text-white flex items-center justify-center shadow-lg shadow-cyan-500/50 scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>

                  {/* Card Info */}
                  <div className="flex-1 min-w-0 space-y-1.5 py-0.5">
                    {/* Time & Episode Badges Row */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Air Time Pill */}
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-mono text-[10px] sm:text-[11px] font-bold tracking-tight shadow-xs">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>{item.timeStr || '18:00 МСК'}</span>
                      </span>

                      {/* Episode Badge */}
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 font-mono text-[10px] font-semibold">
                        Серия #{item.episode}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="text-xs sm:text-sm font-bold font-display text-white group-hover:text-cyan-300 transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h4>

                    {/* Studio / Subtitle */}
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 font-sans truncate">
                      <Tv className="w-3 h-3 text-zinc-500 flex-shrink-0" />
                      <span className="truncate">{item.studio || 'Онгоинг сезона'}</span>
                    </div>
                  </div>

                  {/* Arrow Action */}
                  <div className="w-8 h-8 rounded-xl bg-white/[0.03] group-hover:bg-cyan-500/20 border border-white/[0.06] group-hover:border-cyan-500/40 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:shadow-md group-hover:shadow-cyan-500/20">
                    <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
