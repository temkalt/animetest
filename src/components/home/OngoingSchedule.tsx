'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  Clock, 
  ArrowRight,
  Film
} from 'lucide-react';

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
    <div className="w-full space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-zinc-900 border border-zinc-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span>ЭФИРНАЯ СЕТКА</span>
            <span>•</span>
            <span>
              {currentDayInfo.fullName}
              {isSelectedToday ? ' (Сегодня)' : ''}
            </span>
          </div>
          <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
            Расписание выхода
            <span className="text-xs font-mono bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded">
              {itemsForDay.length}
            </span>
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-full">
          {DAYS.map((d) => {
            const isToday = d.id === todayDay;
            const isSelected = d.id === selectedDay;

            return (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDay(d.id)}
                className={`px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap ${
                  isSelected
                    ? 'bg-zinc-800 text-white font-medium'
                    : isToday
                    ? 'text-white font-bold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                {d.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid */}
      <AnimatePresence mode="wait">
        {itemsForDay.length === 0 ? (
          <motion.div
            key={`empty-${selectedDay}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="flex flex-col items-center justify-center py-12 rounded-lg bg-zinc-900 border border-zinc-800 text-center px-4"
          >
            <Calendar className="w-8 h-8 text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-zinc-200 mb-2">
              Нет релизов на {currentDayInfo.fullName.toLowerCase()}
            </h3>
            <p className="text-sm text-zinc-500 max-w-sm mb-6">
              Все серии этого дня уже вышли в эфир или ожидают обновления вещательной сетки.
            </p>
            <Link
              href="/catalog?status=RELEASING"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Смотреть каталог онгоингов →
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key={`grid-${selectedDay}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            {itemsForDay.map((item) => (
              <Link
                key={`${item.id}-${item.episode}`}
                href={`/anime/${item.id}`}
                className="group flex gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative w-16 h-24 rounded-md overflow-hidden flex-shrink-0 bg-zinc-800">
                  {item.coverImage ? (
                    <Image
                      src={item.coverImage}
                      alt={item.title}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">
                      <Film className="w-6 h-6" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-zinc-100 group-hover:text-white transition-colors line-clamp-2 leading-snug">
                      {item.title}
                    </h4>
                    <div className="text-xs text-zinc-500 mt-1 truncate">
                      {item.studio || 'Онгоинг сезона'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-zinc-400">
                      <Clock className="w-3 h-3" />
                      {item.timeStr || '18:00'}
                    </span>
                    <span className="text-zinc-600 text-xs">•</span>
                    <span className="text-xs font-mono text-zinc-300">
                      Эп. {item.episode}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
