'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Compass,
  Sparkles,
  Flame,
  Cpu,
  Heart,
  Zap,
  ArrowRight,
  ArrowUpRight,
  Star,
  Film,
  Layers,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { SPRINGS } from '@/lib/motion-presets';

export interface SpotlightItem {
  id: string;
  title: string;
  englishTitle: string;
  tagline: string;
  description: string;
  badge: string;
  iconName: 'sparkles' | 'cpu' | 'flame' | 'heart' | 'zap';
  highlightTag: string;
  categoryTag: string;
  rating: string;
  totalTitles: string;
  curator: string;
  bannerImage: string;
  href: string;
  accentColor: {
    primary: string;
    border: string;
    glow: string;
    text: string;
    badgeBg: string;
    buttonBg: string;
    ring: string;
  };
  tags: string[];
  featuredAnime: string[];
}

export const SPOTLIGHT_CATEGORIES: SpotlightItem[] = [
  {
    id: 'sakuga-action',
    title: 'Сакуга года',
    englishTitle: 'Supreme Sakuga & High-Octane Action',
    tagline: 'Шедевры хореографии боёв и безупречная визуальная пластика',
    description:
      'Подборка тайтлов с эталонной анимацией 60 FPS, кинематографичной режиссурой и виртуозной работой аниматоров MAPPA, Ufotable, Bones и Wit Studio.',
    badge: 'EDITORIAL PICK',
    iconName: 'sparkles',
    highlightTag: '4K SAKUGA',
    categoryTag: 'Экшен & Боевые искусства',
    rating: '9.5',
    totalTitles: '48+ тайтлов',
    curator: 'KuroNami Editorial',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/113415-jQBSkxWAAk83.jpg',
    href: '/catalog?genre=Action&sort=SCORE_DESC',
    accentColor: {
      primary: 'indigo',
      border: 'border-indigo-500/40 hover:border-indigo-400/80',
      glow: 'from-indigo-600/35 via-purple-600/20 to-transparent',
      text: 'text-indigo-400',
      badgeBg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40 shadow-indigo-500/20',
      buttonBg: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30',
      ring: 'ring-indigo-500/50',
    },
    tags: ['MAPPA & Ufotable', 'High-Octane', 'Хореография', 'HDR 1080p', 'Культовый экшен'],
    featuredAnime: ['Магическая битва', 'Клинок демонов', 'Человек-бензопила', 'Моб Психо 100'],
  },
  {
    id: 'cyberpunk-scifi',
    title: 'Шедевры Киберпанка',
    englishTitle: 'Cyberpunk, Dystopia & Neon Sci-Fi',
    tagline: 'Неоновый нуар, аугментации и философские дилеммы ИИ',
    description:
      'Мрачные футуристические мегаполисы, аугментированные наёмники, киберпространство и бескомпромиссная борьба за остатки человечности.',
    badge: 'NEON PULSE',
    iconName: 'cpu',
    highlightTag: 'CYBERPUNK',
    categoryTag: 'Sci-Fi & Антиутопия',
    rating: '9.3',
    totalTitles: '34+ тайтла',
    curator: 'KuroNami Curators',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/148862-10f7690fe4223f66.jpg',
    href: '/catalog?genre=Sci-Fi&sort=POPULARITY_DESC',
    accentColor: {
      primary: 'cyan',
      border: 'border-cyan-500/40 hover:border-cyan-400/80',
      glow: 'from-cyan-500/35 via-blue-600/20 to-transparent',
      text: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-cyan-500/20',
      buttonBg: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30',
      ring: 'ring-cyan-500/50',
    },
    tags: ['Studio Trigger', 'Неоновый нуар', 'Аугментации', 'Синтвейв', 'Искусственный интеллект'],
    featuredAnime: ['Киберпанк: Бегущие по краю', 'Психопаспорт', 'Призрак в доспехах', 'Акира'],
  },
  {
    id: 'dark-fantasy',
    title: 'Тёмное Фэнтези',
    englishTitle: 'Grimdark Epic & Ancient Sorcery',
    tagline: 'Суровые миры, древняя магия и непреклонная воля',
    description:
      'Эпические саги о выживании в беспощадных вселенных, где древние заклятия сталкиваются с человеческими страстями, честью и ценой победы.',
    badge: 'DARK FANTASY',
    iconName: 'flame',
    highlightTag: 'GRIMDARK',
    categoryTag: 'Тёмное Фэнтези & Эпос',
    rating: '9.6',
    totalTitles: '42+ тайтла',
    curator: 'KuroNami Editorial',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/154587-n1HJZokE9A31.jpg',
    href: '/catalog?genre=Fantasy&sort=SCORE_DESC',
    accentColor: {
      primary: 'rose',
      border: 'border-rose-500/40 hover:border-rose-400/80',
      glow: 'from-rose-600/35 via-red-600/20 to-transparent',
      text: 'text-rose-400',
      badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-rose-500/20',
      buttonBg: 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30',
      ring: 'ring-rose-500/50',
    },
    tags: ['Madhouse', 'Древняя магия', 'Эпическое путешествие', 'Глубокий лор', 'Высокий рейтинг'],
    featuredAnime: ['Фрирен, провожающая в путь', 'Берсерк', 'Атака титанов', 'Re:Zero'],
  },
  {
    id: 'romance-drama',
    title: 'Романтика & Драма',
    englishTitle: 'Emotional Resonance & Tender Hearts',
    tagline: 'Пронзительные истории о первой любви, потерях и надежде',
    description:
      'Тайтлы, заставляющие сердце замирать: тонкая психология чувств, завораживающая эстетика Kyoto Animation и саундтреки, трогающие до глубины души.',
    badge: 'HEARTFELT',
    iconName: 'heart',
    highlightTag: 'EMOTIONAL',
    categoryTag: 'Романтика & Драма',
    rating: '9.2',
    totalTitles: '36+ тайтлов',
    curator: 'KuroNami Curators',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/9253-53d9e87ec096b797.jpg',
    href: '/catalog?genre=Romance&sort=SCORE_DESC',
    accentColor: {
      primary: 'amber',
      border: 'border-amber-500/40 hover:border-amber-400/80',
      glow: 'from-amber-500/35 via-rose-600/20 to-transparent',
      text: 'text-amber-400',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-amber-500/20',
      buttonBg: 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30',
      ring: 'ring-amber-500/50',
    },
    tags: ['Kyoto Animation', 'Пронзительная драма', 'Музыка чувств', 'Первая любовь', 'Катарсис'],
    featuredAnime: ['Вайолет Эвергарден', 'Твоя апрельская ложь', 'Госпожа Кагуя', 'Форма голоса'],
  },
  {
    id: 'mind-games',
    title: 'Игры Разума & Триллер',
    englishTitle: 'Psychological Warfare & High-Stakes Suspense',
    tagline: 'Битвы гениев, непредсказуемые ходы и накал страстей',
    description:
      'Интеллектуальные дуэли и психологические лабиринты, где каждая деталь имеет значение. Манипуляции, паранойя и закрученные расследования.',
    badge: 'MIND GAMES',
    iconName: 'zap',
    highlightTag: 'PSYCHOLOGICAL',
    categoryTag: 'Психология & Триллер',
    rating: '9.4',
    totalTitles: '30+ тайтлов',
    curator: 'Detective Club',
    bannerImage: 'https://s4.anilist.co/file/anilistcdn/media/anime/banner/9253-53d9e87ec096b797.jpg',
    href: '/catalog?genre=Psychological&sort=SCORE_DESC',
    accentColor: {
      primary: 'emerald',
      border: 'border-emerald-500/40 hover:border-emerald-400/80',
      glow: 'from-emerald-500/35 via-teal-600/20 to-transparent',
      text: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-emerald-500/20',
      buttonBg: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30',
      ring: 'ring-emerald-500/50',
    },
    tags: ['White Fox', 'Игры со временем', 'Многоходовочки', 'Детектив', 'Саспенс'],
    featuredAnime: ['Врата Штейна', 'Тетрадь смерти', 'Монстр', 'Код Гиас'],
  },
];

const renderIcon = (name: SpotlightItem['iconName'], className: string = 'w-4 h-4') => {
  switch (name) {
    case 'sparkles':
      return <Sparkles className={className} />;
    case 'cpu':
      return <Cpu className={className} />;
    case 'flame':
      return <Flame className={className} />;
    case 'heart':
      return <Heart className={className} />;
    case 'zap':
      return <Zap className={className} />;
    default:
      return <Sparkles className={className} />;
  }
};

export interface CuratedSpotlightProps {
  items?: SpotlightItem[];
  initialSelectedId?: string;
  className?: string;
  showHeroBanner?: boolean;
}

export const CuratedSpotlight: React.FC<CuratedSpotlightProps> = ({
  items = SPOTLIGHT_CATEGORIES,
  initialSelectedId,
  className = '',
  showHeroBanner = true,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    initialSelectedId || (items.length > 0 ? items[0].id : 'sakuga-action')
  );

  const activeItem = items.find((it) => it.id === selectedId) || items[0];

  if (!items || items.length === 0) return null;

  return (
    <section className={`w-full space-y-6 ${className}`}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 backdrop-blur-md text-xs font-mono font-semibold">
            <Compass className="w-3.5 h-3.5 text-indigo-400" />
            <span className="tracking-wider uppercase">КУРАТОРСКИЙ ВЫБОР KURO NAMI</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold font-display tracking-tight text-white flex items-center gap-2.5">
            <span>Редакторские Спецпроекты & Спотлайты</span>
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl font-sans">
            Эксклюзивные авторские категории с точной фильтрацией каталога по атмосфере, режиссуре и ключевым жанрам.
          </p>
        </div>

        <Link
          href="/collections"
          className="inline-flex items-center gap-1.5 text-xs font-mono text-indigo-400 hover:text-indigo-300 group transition-colors self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08]"
        >
          <span>Все коллекции</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Category Pills Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
        {items.map((item) => {
          const isSelected = item.id === selectedId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedId(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-display font-medium whitespace-nowrap transition-all duration-300 cursor-pointer border ${
                isSelected
                  ? `${item.accentColor.badgeBg} shadow-lg backdrop-blur-xl scale-105`
                  : 'bg-[#0E1118]/80 hover:bg-[#131722] text-zinc-400 hover:text-zinc-200 border-white/[0.06]'
              }`}
            >
              <span className={isSelected ? item.accentColor.text : 'text-zinc-400'}>
                {renderIcon(item.iconName, 'w-3.5 h-3.5')}
              </span>
              <span>{item.title}</span>
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              )}
            </button>
          );
        })}
      </div>

      {/* Large Featured Hero Spotlight Canvas */}
      {showHeroBanner && activeItem && (
        <div className="relative w-full rounded-3xl overflow-hidden bg-[#08090D] border border-white/[0.1] shadow-2xl group">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeItem.id}
              initial={{ opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={SPRINGS.cinematic}
              className="relative min-h-[380px] sm:min-h-[440px] flex flex-col justify-end p-6 sm:p-10 md:p-12 overflow-hidden"
            >
              {/* Background Cover Image with High Resolution */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={activeItem.bannerImage}
                  alt={activeItem.title}
                  fill
                  priority
                  className="object-cover object-center filter saturate-115 contrast-105 opacity-40 group-hover:scale-105 group-hover:opacity-50 transition-all duration-700 ease-out"
                />

                {/* Cinematic Multi-Stop Gradients & Dynamic Glowing Accents */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#08090D] via-[#08090D]/85 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#08090D] via-[#08090D]/75 to-transparent" />
                <div
                  className={`absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-gradient-to-tr ${activeItem.accentColor.glow} blur-3xl opacity-60 pointer-events-none`}
                />
              </div>

              {/* Spotlight Content Overlay */}
              <div className="relative z-10 max-w-3xl space-y-4">
                {/* Glowing Badges Row */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border backdrop-blur-md text-[11px] font-mono font-semibold shadow-md ${activeItem.accentColor.badgeBg}`}
                  >
                    {renderIcon(activeItem.iconName, 'w-3 h-3')}
                    <span>{activeItem.badge}</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 backdrop-blur-md text-[11px] font-mono font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Рейтинг {activeItem.rating}</span>
                  </div>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] text-zinc-300 border border-white/[0.08] backdrop-blur-md text-[11px] font-mono">
                    <Film className="w-3 h-3 text-zinc-400" />
                    <span>{activeItem.totalTitles}</span>
                  </div>

                  <span className="text-[11px] font-mono text-zinc-400 hidden sm:inline-block">
                    Куратор: <strong className="text-zinc-200">{activeItem.curator}</strong>
                  </span>
                </div>

                {/* Main Heading & Tagline */}
                <div className="space-y-1">
                  <h3 className="text-2xl sm:text-4xl md:text-5xl font-extrabold font-display tracking-tight text-white drop-shadow-md">
                    {activeItem.title}
                  </h3>
                  <p className={`text-xs sm:text-sm font-mono font-medium ${activeItem.accentColor.text}`}>
                    {activeItem.englishTitle} — {activeItem.tagline}
                  </p>
                </div>

                {/* Editorial Description */}
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans max-w-2xl">
                  {activeItem.description}
                </p>

                {/* Featured Key Tags */}
                <div className="flex items-center gap-1.5 flex-wrap pt-1">
                  {activeItem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 border border-white/[0.07] text-[11px] font-sans transition-colors"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Representative Titles Sample Pill Chips */}
                <div className="pt-1 flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono text-zinc-400">Включает:</span>
                  {activeItem.featuredAnime.map((title) => (
                    <span
                      key={title}
                      className="inline-flex items-center gap-1 text-[11px] font-sans text-zinc-200 bg-[#0E1118]/80 px-2 py-0.5 rounded-md border border-white/[0.06]"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>{title}</span>
                    </span>
                  ))}
                </div>

                {/* Action CTAs */}
                <div className="flex items-center gap-3 pt-3 flex-wrap">
                  <Link
                    href={activeItem.href}
                    className={`inline-flex items-center gap-2 px-5 py-3 rounded-2xl font-display font-semibold text-xs transition-all duration-300 shadow-xl hover:scale-105 active:scale-95 ${activeItem.accentColor.buttonBg}`}
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Открыть подборку в каталоге</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </Link>

                  <Link
                    href="/collections"
                    className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl bg-white/[0.06] hover:bg-white/[0.12] text-zinc-200 border border-white/[0.08] font-display font-medium text-xs backdrop-blur-md transition-all hover:scale-105"
                  >
                    <Layers className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Все спецпроекты</span>
                  </Link>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      )}

      {/* Glassmorphism Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
        {items.map((cat) => {
          const isActive = cat.id === selectedId;
          return (
            <div
              key={cat.id}
              className={`group relative rounded-3xl overflow-hidden bg-[#0E1118]/90 border transition-all duration-300 flex flex-col justify-between p-5 sm:p-6 shadow-xl backdrop-blur-xl hover:scale-[1.02] ${
                isActive
                  ? `${cat.accentColor.border} ring-1 ${cat.accentColor.ring} shadow-2xl`
                  : 'border-white/[0.08] hover:border-white/[0.2]'
              }`}
            >
              {/* Background Glass Image Layer */}
              <div className="absolute inset-0 z-0">
                <Image
                  src={cat.bannerImage}
                  alt={cat.title}
                  fill
                  className="object-cover opacity-25 group-hover:opacity-35 group-hover:scale-105 transition-all duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0E1118] via-[#0E1118]/80 to-[#0E1118]/40" />
                <div
                  className={`absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-bl ${cat.accentColor.glow} blur-2xl opacity-40 group-hover:opacity-70 transition-opacity`}
                />
              </div>

              {/* Top Meta Details */}
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border backdrop-blur-md ${cat.accentColor.badgeBg}`}
                  >
                    {renderIcon(cat.iconName, 'w-3 h-3')}
                    <span>{cat.highlightTag}</span>
                  </span>

                  <div className="flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{cat.rating}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-lg font-bold font-display text-white group-hover:text-indigo-300 transition-colors">
                    {cat.title}
                  </h4>
                  <p className="text-xs text-zinc-300 line-clamp-2 leading-relaxed font-sans">
                    {cat.tagline}
                  </p>
                </div>
              </div>

              {/* Bottom Tags & Catalog Link */}
              <div className="relative z-10 pt-4 mt-4 border-t border-white/[0.06] space-y-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {cat.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-md bg-white/[0.04] text-zinc-300 text-[10px] font-mono border border-white/[0.06]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] font-mono text-zinc-400">{cat.totalTitles}</span>

                  <Link
                    href={cat.href}
                    className={`inline-flex items-center gap-1 text-xs font-mono font-semibold ${cat.accentColor.text} group-hover:translate-x-0.5 transition-all`}
                  >
                    <span>Смотреть</span>
                    <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CuratedSpotlight;
