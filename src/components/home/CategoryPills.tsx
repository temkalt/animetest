'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Flame, 
  Sparkles, 
  Film, 
  Cpu, 
  Wand2, 
  Swords, 
  Heart, 
  Ghost,
  Compass,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

interface CategoryPillItem {
  id: string;
  name: string;
  query: string;
  icon: React.ElementType;
  countLabel?: string;
  color: {
    text: string;
    border: string;
    bg: string;
    glow: string;
    iconColor: string;
  };
}

const CATEGORIES: CategoryPillItem[] = [
  {
    id: 'top-100',
    name: 'Топ-100',
    query: '/catalog?sort=SCORE_DESC',
    icon: Trophy,
    countLabel: '9.0+',
    color: {
      text: 'text-amber-300 group-hover:text-amber-200',
      border: 'border-amber-500/30 group-hover:border-amber-400/70',
      bg: 'bg-amber-500/10 group-hover:bg-amber-500/20',
      glow: 'group-hover:shadow-[0_0_20px_rgba(245,158,11,0.35)]',
      iconColor: 'text-amber-400 group-hover:scale-110',
    },
  },
  {
    id: 'new-releases',
    name: 'Новинки',
    query: '/catalog?sort=START_DATE_DESC',
    icon: Flame,
    countLabel: '2026',
    color: {
      text: 'text-rose-300 group-hover:text-rose-200',
      border: 'border-rose-500/30 group-hover:border-rose-400/70',
      bg: 'bg-rose-500/10 group-hover:bg-rose-500/20',
      glow: 'group-hover:shadow-[0_0_20px_rgba(244,63,94,0.35)]',
      iconColor: 'text-rose-400 group-hover:scale-110',
    },
  },
  {
    id: 'sakuga',
    name: 'Сакуга',
    query: '/catalog?genre=Action',
    countLabel: '60 FPS',
    icon: Sparkles,
    color: {
      text: 'text-indigo-300 group-hover:text-indigo-200',
      border: 'border-indigo-500/30 group-hover:border-indigo-400/70',
      bg: 'bg-indigo-500/10 group-hover:bg-indigo-500/20',
      glow: 'group-hover:shadow-[0_0_20px_rgba(99,102,241,0.35)]',
      iconColor: 'text-indigo-400 group-hover:scale-110',
    },
  },
  {
    id: 'movies',
    name: 'Полнометражки',
    query: '/catalog?format=MOVIE',
    countLabel: 'Фильмы',
    icon: Film,
    color: {
      text: 'text-cyan-300 group-hover:text-cyan-200',
      border: 'border-cyan-500/30 group-hover:border-cyan-400/70',
      bg: 'bg-cyan-500/10 group-hover:bg-cyan-500/20',
      glow: 'group-hover:shadow-[0_0_20px_rgba(6,182,212,0.35)]',
      iconColor: 'text-cyan-400 group-hover:scale-110',
    },
  },
  {
    id: 'cyberpunk',
    name: 'Киберпанк',
    query: '/catalog?genre=Sci-Fi',
    countLabel: 'Sci-Fi',
    icon: Cpu,
    color: {
      text: 'text-teal-300 group-hover:text-teal-200',
      border: 'border-teal-500/30 group-hover:border-teal-400/70',
      bg: 'bg-teal-500/10 group-hover:bg-teal-500/20',
      glow: 'group-hover:shadow-[0_0_20px_rgba(20,184,166,0.35)]',
      iconColor: 'text-teal-400 group-hover:scale-110',
    },
  },
  {
    id: 'fantasy',
    name: 'Фэнтези',
    query: '/catalog?genre=Fantasy',
    countLabel: 'Magic',
    icon: Wand2,
    color: {
      text: 'text-purple-300 group-hover:text-purple-200',
      border: 'border-purple-500/30 group-hover:border-purple-400/70',
      bg: 'bg-purple-500/10 group-hover:bg-purple-500/20',
      glow: 'group-hover:shadow-[0_0_20px_rgba(168,85,247,0.35)]',
      iconColor: 'text-purple-400 group-hover:scale-110',
    },
  },
  {
    id: 'shonen',
    name: 'Сёнэн',
    query: '/catalog?genre=Action',
    countLabel: 'Бои',
    icon: Swords,
    color: {
      text: 'text-orange-300 group-hover:text-orange-200',
      border: 'border-orange-500/30 group-hover:border-orange-400/70',
      bg: 'bg-orange-500/10 group-hover:bg-orange-500/20',
      glow: 'group-hover:shadow-[0_0_20px_rgba(249,115,22,0.35)]',
      iconColor: 'text-orange-400 group-hover:scale-110',
    },
  },
  {
    id: 'romance',
    name: 'Романтика',
    query: '/catalog?genre=Romance',
    countLabel: 'Любовь',
    icon: Heart,
    color: {
      text: 'text-pink-300 group-hover:text-pink-200',
      border: 'border-pink-500/30 group-hover:border-pink-400/70',
      bg: 'bg-pink-500/10 group-hover:bg-pink-500/20',
      glow: 'group-hover:shadow-[0_0_20px_rgba(236,72,153,0.35)]',
      iconColor: 'text-pink-400 group-hover:scale-110',
    },
  },
];

export const CategoryPills: React.FC = () => {
  return (
    <div className="w-full relative select-none">
      {/* Scrollable Container with Glass Effect */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 pt-1 scrollbar-none no-scrollbar">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={cat.query}
              className={`group flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl ${cat.color.bg} border ${cat.color.border} ${cat.color.glow} backdrop-blur-xl transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]`}
            >
              <div className="p-1 rounded-lg bg-black/40 border border-white/10">
                <Icon className={`w-4 h-4 transition-transform duration-300 ${cat.color.iconColor}`} />
              </div>

              <span className={`text-xs sm:text-sm font-display font-bold tracking-tight transition-colors ${cat.color.text}`}>
                {cat.name}
              </span>

              {cat.countLabel && (
                <span className="px-1.5 py-0.5 rounded-md bg-black/40 border border-white/10 text-[10px] font-mono text-zinc-400 group-hover:text-white transition-colors">
                  {cat.countLabel}
                </span>
              )}
            </Link>
          );
        })}

        {/* All Categories Explorer Link */}
        <Link
          href="/catalog"
          className="group flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-white/25 backdrop-blur-xl text-zinc-400 hover:text-white transition-all duration-300 hover:scale-[1.03] active:scale-[0.97]"
        >
          <Compass className="w-4 h-4 text-indigo-400 group-hover:rotate-45 transition-transform duration-300" />
          <span className="text-xs sm:text-sm font-display font-medium">Все жанры</span>
          <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>
    </div>
  );
};
