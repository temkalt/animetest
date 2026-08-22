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
  Compass,
  ArrowRight
} from 'lucide-react';

interface CategoryPillItem {
  id: string;
  name: string;
  query: string;
  icon: React.ElementType;
}

const CATEGORIES: CategoryPillItem[] = [
  {
    id: 'top-100',
    name: 'Топ-100',
    query: '/catalog?sort=SCORE_DESC',
    icon: Trophy,
  },
  {
    id: 'new-releases',
    name: 'Новинки',
    query: '/catalog?sort=START_DATE_DESC',
    icon: Flame,
  },
  {
    id: 'sakuga',
    name: 'Сакуга',
    query: '/catalog?genre=Action',
    icon: Sparkles,
  },
  {
    id: 'movies',
    name: 'Полнометражки',
    query: '/catalog?format=MOVIE',
    icon: Film,
  },
  {
    id: 'cyberpunk',
    name: 'Киберпанк',
    query: '/catalog?genre=Sci-Fi',
    icon: Cpu,
  },
  {
    id: 'fantasy',
    name: 'Фэнтези',
    query: '/catalog?genre=Fantasy',
    icon: Wand2,
  },
  {
    id: 'shonen',
    name: 'Сёнэн',
    query: '/catalog?genre=Action',
    icon: Swords,
  },
  {
    id: 'romance',
    name: 'Романтика',
    query: '/catalog?genre=Romance',
    icon: Heart,
  },
];

export const CategoryPills: React.FC = () => {
  return (
    <div className="w-full relative select-none">
      <div className="absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />
      
      <div className="flex items-center gap-2.5 overflow-x-auto py-2 scrollbar-none no-scrollbar relative z-0 px-1">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.id}
              href={cat.query}
              className="group flex-shrink-0 flex items-center gap-2 px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-semibold text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700 hover:text-white transition-all duration-150 shadow-sm"
            >
              <Icon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white transition-colors duration-150" />
              <span className="font-sans">{cat.name}</span>
            </Link>
          );
        })}

        <Link
          href="/catalog"
          className="group flex-shrink-0 flex items-center gap-2 px-3.5 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-semibold text-zinc-400 hover:bg-zinc-800 hover:border-zinc-700 hover:text-white transition-all duration-150 shadow-sm"
        >
          <Compass className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors duration-150" />
          <span className="font-sans">Все жанры</span>
          <ArrowRight className="w-3 h-3 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 transition-all duration-150" />
        </Link>
      </div>
    </div>
  );
};
