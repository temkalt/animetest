'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Radio, ArrowRight } from 'lucide-react';

const DAYS = [
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

interface ScheduleProps {
  scheduleData?: {
    [day: number]: ScheduleItem[];
  };
  initialDay?: number;
}

export const OngoingSchedule: React.FC<ScheduleProps> = ({
  scheduleData = {},
  initialDay = new Date().getDay() || 7,
}) => {
  const [selectedDay, setSelectedDay] = useState(initialDay);
  const itemsForDay = scheduleData[selectedDay] || [];

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <h2 className="text-lg sm:text-xl font-bold font-display tracking-tight text-white">
            Расписание онгоингов недели
          </h2>
        </div>

        {/* Days Pill Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#0F1117] border border-white/[0.06]">
          {DAYS.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDay(d.id)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-all cursor-pointer ${
                selectedDay === d.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Items Grid */}
      {itemsForDay.length === 0 ? (
        <div className="p-8 rounded-2xl bg-[#0E1118] border border-white/[0.06] text-center text-xs font-mono text-zinc-400 space-y-2">
          <Calendar className="w-6 h-6 mx-auto text-zinc-600 mb-1" />
          <div>В этот день нет запланированных релизов в эфире.</div>
          <Link href="/catalog?status=RELEASING" className="text-indigo-400 hover:underline">
            Посмотреть все онгоинги сезона →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {itemsForDay.map((item) => (
            <Link
              key={`${item.id}-${item.episode}`}
              href={`/anime/${item.id}`}
              className="p-3 rounded-2xl bg-[#0E1118] border border-white/[0.06] hover:border-indigo-500/40 hover:bg-[#131722] transition-all flex items-center gap-3.5 group shadow-sm"
            >
              <div className="relative w-12 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-zinc-800">
                {item.coverImage && (
                  <Image
                    src={item.coverImage}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className="text-cyan-400 font-semibold uppercase">{item.timeStr}</span>
                  <span className="text-zinc-500">Серия #{item.episode}</span>
                </div>
                <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                  {item.title}
                </h4>
                {item.studio && <p className="text-[10px] text-zinc-400 truncate">{item.studio}</p>}
              </div>

              <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
