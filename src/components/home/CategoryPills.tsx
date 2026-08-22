'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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

const MotionLink = motion.create(Link);

export const CategoryPills: React.FC = () => {
  return (
    <div className="w-full relative select-none">
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />
      
      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none no-scrollbar relative z-0 px-2">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <MotionLink
              key={cat.id}
              href={cat.query}
              whileHover={{ y: -2, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="group flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800/50 hover:border-zinc-700 hover:text-zinc-100 transition-colors duration-150"
            >
              <Icon className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
              <span className="font-sans font-medium">{cat.name}</span>
            </MotionLink>
          );
        })}

        <MotionLink
          href="/catalog"
          whileHover={{ y: -2, scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="group flex-shrink-0 flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800/50 hover:border-zinc-700 hover:text-zinc-100 transition-colors duration-150"
        >
          <Compass className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
          <span className="font-sans font-medium">Все жанры</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </MotionLink>
      </div>
    </div>
  );
};
