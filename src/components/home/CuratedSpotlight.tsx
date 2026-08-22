'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Compass,
  Star,
  Film,
  ArrowUpRight,
} from 'lucide-react';

export interface SpotlightItem {
  id: string;
  title: string;
  englishTitle: string;
  tagline: string;
  description: string;
  badge: string;
  rating: string;
  totalTitles: string;
  curator: string;
  bannerImage: string;
  href: string;
  tags: string[];
  featuredAnime: string[];
}

export const SPOTLIGHT_CATEGORIES: SpotlightItem[] = [
  {
    id: 'sakuga-action',
    title: 'Сакуга года',
    englishTitle: 'Supreme Sakuga & High-Octane Action',
    tagline: 'Шедевры хореографии боёв и безупречная визуальная пластика',
    description: 'Подборка тайтлов с эталонной анимацией, кинематографичной режиссурой и виртуозной работой аниматоров MAPPA, Ufotable, Bones и Wit Studio.',
    badge: 'EDITORIAL PICK',
    rating: '9.5',
    totalTitles: '48+',
    curator: 'Редакция KuroNami',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQBSkxWAAk83.jpg',
    href: '/catalog?genre=Action&sort=SCORE_DESC',
    tags: ['MAPPA & Ufotable', 'High-Octane', 'Хореография'],
    featuredAnime: ['Магическая битва', 'Клинок демонов', 'Человек-бензопила', 'Моб Психо 100'],
  },
  {
    id: 'cyberpunk-scifi',
    title: 'Шедевры Киберпанка',
    englishTitle: 'Cyberpunk, Dystopia & Neon Sci-Fi',
    tagline: 'Неоновый нуар, аугментации и философские дилеммы ИИ',
    description: 'Мрачные футуристические мегаполисы, аугментированные наёмники, киберпространство и бескомпромиссная борьба за остатки человечности.',
    badge: 'NEON PULSE',
    rating: '9.3',
    totalTitles: '34+',
    curator: 'Редакция KuroNami',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/120377-c15oLS8CA31s.jpg',
    href: '/catalog?genre=Sci-Fi&sort=POPULARITY_DESC',
    tags: ['Studio Trigger', 'Неоновый нуар', 'Аугментации'],
    featuredAnime: ['Киберпанк: Бегущие по краю', 'Психопаспорт', 'Призрак в доспехах', 'Акира'],
  },
  {
    id: 'dark-fantasy',
    title: 'Тёмное Фэнтези',
    englishTitle: 'Grimdark Epic & Ancient Sorcery',
    tagline: 'Суровые миры, древняя магия и непреклонная воля',
    description: 'Эпические саги о выживании в беспощадных вселенных, где древние заклятия сталкиваются с человеческими страстями, честью и ценой победы.',
    badge: 'DARK FANTASY',
    rating: '9.6',
    totalTitles: '42+',
    curator: 'Редакция KuroNami',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-ivXNJ23SM1xB.jpg',
    href: '/catalog?genre=Fantasy&sort=SCORE_DESC',
    tags: ['Madhouse', 'Древняя магия', 'Эпическое путешествие'],
    featuredAnime: ['Фрирен, провожающая в путь', 'Берсерк', 'Атака титанов', 'Re:Zero'],
  },
];

export interface CuratedSpotlightProps {
  items?: SpotlightItem[];
  initialSelectedId?: string;
  className?: string;
}

export const CuratedSpotlight: React.FC<CuratedSpotlightProps> = ({
  items = SPOTLIGHT_CATEGORIES,
  initialSelectedId,
  className = '',
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    initialSelectedId || (items.length > 0 ? items[0].id : 'sakuga-action')
  );

  if (!items || items.length === 0) return null;

  return (
    <section className={`w-full space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-zinc-400 text-sm font-mono uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>Спецпроекты</span>
          </div>
          <h2 className="text-2xl font-bold font-sans text-zinc-100">
            Кураторский Выбор
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-4 border-b border-zinc-800 overflow-x-auto scrollbar-none">
        {items.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              className={`pb-3 text-sm font-sans font-medium whitespace-nowrap border-b-2 transition-colors ${
                isSelected
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {item.title}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {items.map((cat) => {
          const isActive = cat.id === selectedId;
          if (!isActive) return null;
          return (
            <div
              key={cat.id}
              className="lg:col-span-3 grid lg:grid-cols-5 gap-4"
            >
              <div className="lg:col-span-3 relative h-64 sm:h-80 rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800">
                <Image
                  src={cat.bannerImage}
                  alt={cat.title}
                  fill
                  className="object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
                <div className="absolute inset-0 p-6 flex flex-col justify-end space-y-2">
                  <div className="flex items-center gap-3 text-sm text-zinc-400 font-mono">
                    <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" />{cat.rating}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Film className="w-3.5 h-3.5" />{cat.totalTitles}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white font-sans">{cat.title}</h3>
                  <p className="text-sm text-zinc-300 font-sans max-w-2xl">{cat.description}</p>
                  <div className="pt-2">
                    <Link href={cat.href} className="inline-flex items-center gap-2 px-4 py-2 bg-white text-zinc-900 rounded-lg text-sm font-medium hover:bg-zinc-200 transition-colors">
                      Смотреть подборку <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-2 space-y-3">
                {cat.featuredAnime.map((anime, idx) => (
                  <div key={idx} className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 transition-colors">
                    <h4 className="text-sm font-medium text-zinc-100 font-sans">{anime}</h4>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CuratedSpotlight;
