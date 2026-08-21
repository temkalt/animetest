'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Calendar, Clock, Tv, ChevronRight } from 'lucide-react';

const DAYS = [
  { id: 1, name: 'ПН', fullName: 'Понедельник' },
  { id: 2, name: 'ВТ', fullName: 'Вторник' },
  { id: 3, name: 'СР', fullName: 'Среда' },
  { id: 4, name: 'ЧТ', fullName: 'Четверг' },
  { id: 5, name: 'ПТ', fullName: 'Пятница' },
  { id: 6, name: 'СБ', fullName: 'Суббота' },
  { id: 7, name: 'ВС', fullName: 'Воскресенье' },
];

interface ScheduleProps {
  initialDay?: number;
}

export const OngoingSchedule: React.FC<ScheduleProps> = ({ initialDay = new Date().getDay() || 7 }) => {
  const [selectedDay, setSelectedDay] = useState(initialDay);

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#06B6D4]" />
          <h2 className="text-xl font-bold font-display tracking-tight text-white">
            Расписание релиза серий
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div className="p-4 rounded-2xl bg-[#0E1017] border border-white/5 flex items-center justify-between hover:border-violet-500/30 transition-colors">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 font-semibold uppercase">Сегодня в 18:30 МСК</span>
            <h4 className="text-sm font-semibold text-white">Магическая битва: 3 сезон</h4>
            <span className="text-xs text-slate-400 font-mono">Серия 8 • AniLibria</span>
          </div>
          <Link
            href="/catalog"
            className="p-2 rounded-xl bg-white/5 hover:bg-violet-600 hover:text-white text-slate-400 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-4 rounded-2xl bg-[#0E1017] border border-white/5 flex items-center justify-between hover:border-violet-500/30 transition-colors">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 font-semibold uppercase">Сегодня в 20:00 МСК</span>
            <h4 className="text-sm font-semibold text-white">Поднятие уровня в одиночку 2</h4>
            <span className="text-xs text-slate-400 font-mono">Серия 12 • Studio Band</span>
          </div>
          <Link
            href="/catalog"
            className="p-2 rounded-xl bg-white/5 hover:bg-violet-600 hover:text-white text-slate-400 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="p-4 rounded-2xl bg-[#0E1017] border border-white/5 flex items-center justify-between hover:border-violet-500/30 transition-colors">
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-cyan-400 font-semibold uppercase">Сегодня в 22:15 МСК</span>
            <h4 className="text-sm font-semibold text-white">Клинок, рассекающий демонов: Крепость</h4>
            <span className="text-xs text-slate-400 font-mono">Серия 4 • SHIZA Project</span>
          </div>
          <Link
            href="/catalog"
            className="p-2 rounded-xl bg-white/5 hover:bg-violet-600 hover:text-white text-slate-400 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
