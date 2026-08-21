'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, ChevronRight, Tv, Calendar } from 'lucide-react';

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
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#06B6D4]" />
          <h2 className="text-xl font-bold font-display tracking-tight text-white">
            Расписание онгоингов на неделю
          </h2>
        </div>

        {/* Days Pill Selector */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
          {DAYS.map((d) => (
            <button
              key={d.id}
              onClick={() => setSelectedDay(d.id)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                selectedDay === d.id
                  ? 'bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {d.name}
            </button>
          ))}
        </div>
      </div>

      {/* Schedule Items Grid */}
      {itemsForDay.length === 0 ? (
        <div className="p-8 rounded-3xl bg-[#0E1017] border border-white/5 text-center text-xs font-mono text-slate-400 space-y-2">
          <Calendar className="w-8 h-8 mx-auto text-slate-600 mb-2" />
          <div>В этот день нет запланированных релизов в эфире.</div>
          <Link href="/catalog?status=RELEASING" className="text-violet-400 hover:underline">
            Посмотреть все онгоинги сезона →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {itemsForDay.map((item) => (
            <Link
              key={`${item.id}-${item.episode}`}
              href={`/anime/${item.id}`}
              className="p-3.5 rounded-2xl bg-[#0E1017] border border-white/5 hover:border-violet-500/40 hover:bg-[#141722] transition-all flex items-center gap-3.5 group"
            >
              <div className="relative w-12 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
                {item.coverImage && (
                  <Image src={item.coverImage} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform" />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-1">
                <span className="text-[10px] font-mono text-cyan-400 font-semibold uppercase block">
                  {item.timeStr}
                </span>
                <h4 className="text-xs font-bold text-white group-hover:text-violet-300 transition-colors truncate">
                  {item.title}
                </h4>
                <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                  <span className="text-violet-400 font-semibold">Серия {item.episode}</span>
                  {item.studio && <span>• {item.studio}</span>}
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white/5 group-hover:bg-violet-600 group-hover:text-white text-slate-400 transition-colors">
                <ChevronRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

