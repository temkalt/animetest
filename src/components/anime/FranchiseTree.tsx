'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimeRelationItem, UnifiedAnime } from '@/types';
import { getKnownRussianTitle, ensureRussianTitle } from '@/lib/api/russian-titles';
import {
  GitFork,
  GitBranch,
  GitCommit,
  Calendar,
  Tv,
  Film,
  Disc3,
  Sparkles,
  FastForward,
  History,
  Split,
  Zap,
  Shield,
  Shuffle,
  FileText,
  Layers,
  CheckCircle2,
  Clock,
  Radio,
  LayoutGrid,
  ListTree,
  Activity,
} from 'lucide-react';
import { staggerContainerVariants, staggerItemVariants } from '@/lib/motion-presets';

export interface FranchiseTreeProps {
  currentAnimeId: number;
  relations: AnimeRelationItem[];
  currentAnime?: Partial<UnifiedAnime> & {
    id?: number;
    title?: {
      russian?: string | null;
      english?: string | null;
      romaji?: string;
    };
    format?: string;
    coverImage?: {
      original?: string;
      large?: string;
      medium?: string;
      color?: string;
    };
    seasonYear?: number | null;
  };
}

interface ProcessedNode {
  id: number;
  title: string;
  relationType: string;
  format: string;
  coverImage?: string;
  year?: number | null;
  isCurrent: boolean;
  orderKey: number;
}

// Relation configuration mapping with Russian localization
export const RELATION_META: Record<
  string,
  {
    label: string;
    shortLabel: string;
    description: string;
    badgeStyle: string;
    icon: React.ElementType;
    group: 'canon' | 'movies' | 'spinoff' | 'other';
    weight: number;
  }
> = {
  CURRENT: {
    label: 'Текущий тайтл',
    shortLabel: 'ВЫ ЗДЕСЬ',
    description: 'Вы просматриваете этот релиз',
    badgeStyle: 'bg-zinc-800 text-zinc-100 border-zinc-700',
    icon: Radio,
    group: 'canon',
    weight: 0,
  },
  PREQUEL: {
    label: 'Предыстория / Приквел',
    shortLabel: 'ПРИКВЕЛ',
    description: 'События, предшествующие основной истории',
    badgeStyle: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    icon: History,
    group: 'canon',
    weight: -10,
  },
  SEQUEL: {
    label: 'Продолжение / Сиквел',
    shortLabel: 'СИКВЕЛ',
    description: 'Следующий хронологический сезон или глава',
    badgeStyle: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    icon: FastForward,
    group: 'canon',
    weight: 10,
  },
  PARENT: {
    label: 'Основная ветка',
    shortLabel: 'ОСНОВНОЙ СЕРИАЛ',
    description: 'Главный канонический первоисточник франшизы',
    badgeStyle: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    icon: Shield,
    group: 'canon',
    weight: -5,
  },
  SIDE_STORY: {
    label: 'Побочная история / Сайд-стори',
    shortLabel: 'САЙД-СТОРИ',
    description: 'Параллельные сюжетные арки и дополнения',
    badgeStyle: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    icon: Split,
    group: 'spinoff',
    weight: 20,
  },
  SPIN_OFF: {
    label: 'Спин-офф',
    shortLabel: 'СПИН-ОФФ',
    description: 'Самостоятельная история в той же вселенной',
    badgeStyle: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    icon: Zap,
    group: 'spinoff',
    weight: 25,
  },
  ALTERNATIVE: {
    label: 'Альтернативная версия',
    shortLabel: 'АЛЬТЕРНАТИВА',
    description: 'Иная временная линия или ребут',
    badgeStyle: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    icon: Shuffle,
    group: 'spinoff',
    weight: 30,
  },
  CHARACTER: {
    label: 'История персонажа',
    shortLabel: 'ПЕРСОНАЖ',
    description: 'Фокус на отдельном герое вселенной',
    badgeStyle: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    icon: Split,
    group: 'spinoff',
    weight: 35,
  },
  SUMMARY: {
    label: 'Рекап / Сводка',
    shortLabel: 'РЕКАП',
    description: 'Краткий пересказ ключевых событий',
    badgeStyle: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    icon: FileText,
    group: 'other',
    weight: 40,
  },
  OTHER: {
    label: 'Дополнительно',
    shortLabel: 'ЭКСТРА',
    description: 'Специальные материалы и бонусы',
    badgeStyle: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    icon: Layers,
    group: 'other',
    weight: 50,
  },
  ADAPTATION: {
    label: 'Адаптация',
    shortLabel: 'АДАПТАЦИЯ',
    description: 'Манга, ранобэ или первоисточник',
    badgeStyle: 'bg-zinc-800 text-zinc-300 border-zinc-700',
    icon: Layers,
    group: 'other',
    weight: 60,
  },
};

export function getRelationMeta(type: string, isCurrent = false) {
  if (isCurrent) return RELATION_META.CURRENT;
  const normalized = type?.toUpperCase().replace(/\s+/g, '_') || 'OTHER';
  return (
    RELATION_META[normalized] || {
      label: 'Связанный тайтл',
      shortLabel: 'СВЯЗЬ',
      description: 'Связанное произведение франшизы',
      badgeStyle: 'bg-zinc-800 text-zinc-300 border-zinc-700',
      icon: GitCommit,
      group: 'other' as const,
      weight: 99,
    }
  );
}

export function getFormatRussianLabel(format?: string): string {
  const f = format?.toUpperCase() || 'TV';
  switch (f) {
    case 'MOVIE':
      return 'Фильм';
    case 'OVA':
      return 'OVA';
    case 'ONA':
      return 'ONA';
    case 'SPECIAL':
      return 'Спешл';
    case 'TV_SHORT':
      return 'ТВ-короткое';
    case 'TV':
    default:
      return 'ТВ Сериал';
  }
}

function getFormatIcon(format: string) {
  const f = format?.toUpperCase() || 'TV';
  if (f === 'MOVIE') return Film;
  if (f === 'OVA' || f === 'ONA') return Disc3;
  if (f === 'SPECIAL') return Sparkles;
  return Tv;
}

export const FranchiseTree: React.FC<FranchiseTreeProps> = ({
  currentAnimeId,
  relations = [],
  currentAnime,
}) => {
  const [viewMode, setViewMode] = useState<'timeline' | 'tree' | 'grid'>('timeline');
  const [activeFilter, setActiveFilter] = useState<'all' | 'canon' | 'movies' | 'spinoff'>('all');

  // Build unified, deduplicated, and strictly chronological node list
  const allNodes: ProcessedNode[] = useMemo(() => {
    const list: ProcessedNode[] = [];
    const seenIds = new Set<number>();

    // 1. Check if current anime exists in relations
    const hasCurrentInRelations = relations.some((r) => r.id === currentAnimeId);

    // 2. Add current anime if not yet present in relations
    if (!hasCurrentInRelations) {
      const currentTitle = ensureRussianTitle({
        russian: currentAnime?.title?.russian,
        english: currentAnime?.title?.english,
        romaji: currentAnime?.title?.romaji,
        id: currentAnimeId,
      });

      const currentCover =
        currentAnime?.coverImage?.large ||
        currentAnime?.coverImage?.original ||
        currentAnime?.coverImage?.medium ||
        '';

      list.push({
        id: currentAnimeId,
        title: currentTitle,
        relationType: 'CURRENT',
        format: currentAnime?.format || 'TV',
        coverImage: currentCover,
        year: currentAnime?.seasonYear || null,
        isCurrent: true,
        orderKey: 0,
      });
      seenIds.add(currentAnimeId);
    }

    // 3. Add relation nodes with Russian title resolution and deduplication
    relations.forEach((rel) => {
      if (seenIds.has(rel.id)) return;
      seenIds.add(rel.id);

      const isCurrent = rel.id === currentAnimeId;
      const meta = getRelationMeta(rel.relationType, isCurrent);
      const title = ensureRussianTitle({
        russian: rel.title,
        romaji: rel.title,
        id: rel.id,
        malId: rel.malId,
      });

      list.push({
        id: rel.id,
        title,
        relationType: isCurrent ? 'CURRENT' : rel.relationType,
        format: rel.format || 'TV',
        coverImage: rel.coverImage,
        year: rel.year || null,
        isCurrent,
        orderKey: isCurrent ? 0 : meta.weight,
      });
    });

    // 4. Strict Chronological Sort by year, relation weight, and ID
    return list.sort((a, b) => {
      const yearA = a.year || (a.isCurrent ? currentAnime?.seasonYear : null) || 0;
      const yearB = b.year || (b.isCurrent ? currentAnime?.seasonYear : null) || 0;

      if (yearA && yearB && yearA !== yearB) {
        return yearA - yearB;
      }
      if (yearA && !yearB) return -1;
      if (!yearA && yearB) return 1;

      if (a.orderKey !== b.orderKey) {
        return a.orderKey - b.orderKey;
      }
      return a.id - b.id;
    });
  }, [relations, currentAnimeId, currentAnime]);

  // Filtered nodes based on active tab
  const filteredNodes = useMemo(() => {
    if (activeFilter === 'all') return allNodes;

    return allNodes.filter((node) => {
      if (node.isCurrent) return true; // Always show current node
      const meta = getRelationMeta(node.relationType, node.isCurrent);
      const isMovie = node.format?.toUpperCase() === 'MOVIE';

      if (activeFilter === 'movies') {
        return isMovie || meta.group === 'movies';
      }
      if (activeFilter === 'canon') {
        return meta.group === 'canon' && !isMovie;
      }
      if (activeFilter === 'spinoff') {
        return meta.group === 'spinoff' || meta.group === 'other';
      }
      return true;
    });
  }, [allNodes, activeFilter]);

  // Grouped nodes for Tree branch mode
  const branchGroups = useMemo(() => {
    const mainStory = allNodes.filter((n) => {
      return (
        n.isCurrent ||
        ['PREQUEL', 'SEQUEL', 'PARENT'].includes(n.relationType?.toUpperCase())
      );
    });

    const movies = allNodes.filter(
      (n) =>
        !n.isCurrent &&
        n.format?.toUpperCase() === 'MOVIE' &&
        !mainStory.some((m) => m.id === n.id)
    );

    const spinOffs = allNodes.filter(
      (n) =>
        !n.isCurrent &&
        ['SIDE_STORY', 'SPIN_OFF', 'ALTERNATIVE', 'CHARACTER'].includes(
          n.relationType?.toUpperCase()
        )
    );

    const otherNodes = allNodes.filter(
      (n) =>
        !n.isCurrent &&
        !mainStory.some((m) => m.id === n.id) &&
        !movies.some((m) => m.id === n.id) &&
        !spinOffs.some((s) => s.id === n.id)
    );

    return [
      {
        id: 'main',
        title: 'Каноническая хронология сюжета',
        subtitle: 'Главная сюжетная ветвь и ключевые сезоны',
        icon: GitBranch,
        nodes: mainStory,
      },
      ...(movies.length > 0
        ? [
            {
              id: 'movies',
              title: 'Полнометражные фильмы',
              subtitle: 'Кинотеатральные релизы и спецвыпуски',
              icon: Film,
              nodes: movies,
            },
          ]
        : []),
      ...(spinOffs.length > 0
        ? [
            {
              id: 'spinoffs',
              title: 'Спин-оффы и альтернативные ветки',
              subtitle: 'Параллельные миры, ответвления и спец-эпизоды',
              icon: Split,
              nodes: spinOffs,
            },
          ]
        : []),
      ...(otherNodes.length > 0
        ? [
            {
              id: 'others',
              title: 'Дополнительные материалы',
              subtitle: 'Рекапы, кроссоверы и спешлы',
              icon: Layers,
              nodes: otherNodes,
            },
          ]
        : []),
    ];
  }, [allNodes]);

  // Franchise span calculation (e.g. 2013 — 2024)
  const years = allNodes.map((n) => n.year).filter((y): y is number => Boolean(y));
  const minYear = years.length > 0 ? Math.min(...years) : null;
  const maxYear = years.length > 0 ? Math.max(...years) : null;

  if (allNodes.length === 0) return null;

  return (
    <div className="relative rounded-lg bg-zinc-900 border border-zinc-800 shadow-sm p-4 sm:p-6 space-y-5">
      {/* 1. Header Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        {/* Title & Stats */}
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300">
              <GitFork className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-sans text-zinc-100 tracking-tight flex items-center gap-2">
                <span>Хронология франшизы</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                  <Activity className="w-3 h-3 text-zinc-400" />
                  {allNodes.length} {allNodes.length === 1 ? 'тайтл' : allNodes.length < 5 ? 'тайтла' : 'тайтлов'}
                </span>
              </h3>
            </div>
          </div>

          <p className="text-xs text-zinc-400 font-sans flex items-center gap-2 flex-wrap">
            <span>Полная карта вселенной и порядок просмотра</span>
            {minYear && maxYear && (
              <>
                <span className="text-zinc-600">•</span>
                <span className="font-mono text-zinc-300 text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  {minYear === maxYear ? `${minYear} год` : `${minYear} — ${maxYear} гг.`}
                </span>
              </>
            )}
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          <div className="flex items-center p-1 rounded-lg bg-zinc-950 border border-zinc-800">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'timeline'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
              title="Хронологическая лента"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Хронология</span>
            </button>

            <button
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'tree'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
              title="Древо ветвей франшизы"
            >
              <ListTree className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ветви</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-zinc-800 text-white font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              }`}
              title="Сетка релизов"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Сетка</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Filter Pills for Timeline & Grid Mode */}
      {viewMode !== 'tree' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-md font-mono transition-colors flex items-center gap-1.5 flex-shrink-0 ${
              activeFilter === 'all'
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:bg-zinc-800/50'
            }`}
          >
            <span>Все тайтлы</span>
            <span className="text-[10px] opacity-70">({allNodes.length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('canon')}
            className={`px-3 py-1 rounded-md font-mono transition-colors flex items-center gap-1.5 flex-shrink-0 ${
              activeFilter === 'canon'
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:bg-zinc-800/50'
            }`}
          >
            <span>Основной канон</span>
          </button>

          <button
            onClick={() => setActiveFilter('movies')}
            className={`px-3 py-1 rounded-md font-mono transition-colors flex items-center gap-1.5 flex-shrink-0 ${
              activeFilter === 'movies'
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:bg-zinc-800/50'
            }`}
          >
            <span>Фильмы</span>
          </button>

          <button
            onClick={() => setActiveFilter('spinoff')}
            className={`px-3 py-1 rounded-md font-mono transition-colors flex items-center gap-1.5 flex-shrink-0 ${
              activeFilter === 'spinoff'
                ? 'bg-zinc-800 text-white border border-zinc-700'
                : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:bg-zinc-800/50'
            }`}
          >
            <span>Спин-оффы и спешлы</span>
          </button>
        </div>
      )}

      {/* 3. CONTENT VIEWS */}
      <AnimatePresence mode="wait">
        {/* VIEW 1: CHRONOLOGICAL TIMELINE FLOW */}
        {viewMode === 'timeline' && (
          <motion.div
            key="timeline"
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 overflow-x-auto pb-3 md:pb-0 scrollbar-thin">
              {filteredNodes.map((node, index) => (
                <TimelineCard key={`${node.id}-${node.relationType}`} node={node} stepNumber={index + 1} />
              ))}
            </div>
          </motion.div>
        )}

        {/* VIEW 2: GROUPED BRANCH TREE */}
        {viewMode === 'tree' && (
          <motion.div
            key="tree"
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {branchGroups.map((group) => (
              <div
                key={group.id}
                className="p-4 sm:p-5 rounded-lg border border-zinc-800 bg-zinc-900 space-y-3.5"
              >
                {/* Branch Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <group.icon className="w-4 h-4 text-zinc-300" />
                    <div>
                      <h4 className="text-sm font-bold font-sans text-zinc-100">{group.title}</h4>
                      <p className="text-[11px] text-zinc-400">{group.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                    {group.nodes.length}
                  </span>
                </div>

                {/* Branch Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {group.nodes.map((node) => (
                    <FranchiseNodeCard key={`${node.id}-${node.relationType}`} node={node} compact />
                  ))}
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* VIEW 3: GRID MATRIX */}
        {viewMode === 'grid' && (
          <motion.div
            key="grid"
            variants={staggerContainerVariants}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5"
          >
            {filteredNodes.map((node) => (
              <FranchiseNodeCard key={`${node.id}-${node.relationType}`} node={node} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Footer Hint */}
      <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-500 font-mono border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-zinc-400" />
          <span>Нажмите на тайтл для перехода к просмотру</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-zinc-400">
          <Sparkles className="w-3 h-3 text-zinc-400" />
          <span>KuroNami Франшиза</span>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// SUB-COMPONENT: TIMELINE CARD
// ==========================================
interface CardProps {
  node: ProcessedNode;
  stepNumber?: number;
  compact?: boolean;
}

const TimelineCard: React.FC<CardProps> = ({ node, stepNumber }) => {
  const meta = getRelationMeta(node.relationType, node.isCurrent);
  const FormatIcon = getFormatIcon(node.format);
  const formatLabel = getFormatRussianLabel(node.format);

  return (
    <motion.div variants={staggerItemVariants} whileHover={{ y: -2 }} className="flex-shrink-0 w-72 md:w-auto">
      <Link
        href={`/anime/${node.id}`}
        className={`group relative block h-full p-3.5 rounded-lg border transition-colors duration-200 ${
          node.isCurrent
            ? 'bg-zinc-800/90 border-zinc-600'
            : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50'
        }`}
      >
        <div className="flex gap-3.5 items-start">
          {/* Poster Thumbnail */}
          <div className="relative w-14 h-20 rounded-md overflow-hidden flex-shrink-0 bg-zinc-800 border border-zinc-700/50">
            {node.coverImage ? (
              <Image
                src={node.coverImage}
                alt={node.title}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 text-[10px] font-mono">
                —
              </div>
            )}
          </div>

          {/* Body Content */}
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Top Row: Relation Badge & Step */}
            <div className="flex items-center justify-between gap-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-mono font-semibold tracking-wider uppercase border ${meta.badgeStyle}`}
              >
                <meta.icon className="w-2.5 h-2.5" />
                <span>{meta.shortLabel}</span>
              </span>

              {stepNumber && (
                <span className="text-[10px] font-mono text-zinc-500 font-semibold">
                  #{stepNumber.toString().padStart(2, '0')}
                </span>
              )}
            </div>

            {/* Anime Title */}
            <h4
              className={`text-xs font-bold font-sans line-clamp-2 leading-snug transition-colors ${
                node.isCurrent ? 'text-white' : 'text-zinc-100 group-hover:text-white'
              }`}
            >
              {node.title}
            </h4>

            {/* Format & Year Badges */}
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
              <div className="flex items-center gap-1 text-zinc-300">
                <FormatIcon className="w-3 h-3 text-zinc-400" />
                <span>{formatLabel}</span>
              </div>

              {node.year && (
                <>
                  <span className="text-zinc-600">•</span>
                  <div className="flex items-center gap-1 text-zinc-400">
                    <Calendar className="w-2.5 h-2.5 text-zinc-500" />
                    <span>{node.year}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Current Node Bottom Bar */}
        {node.isCurrent && (
          <div className="mt-2.5 pt-2 border-t border-zinc-700/60 flex items-center justify-between text-[10px] font-mono text-zinc-300">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-zinc-400" />
              <span>Текущий релиз</span>
            </span>
            <span className="text-zinc-400">Вы смотрите</span>
          </div>
        )}
      </Link>
    </motion.div>
  );
};

// ==========================================
// SUB-COMPONENT: FRANCHISE NODE CARD (TREE / GRID)
// ==========================================
const FranchiseNodeCard: React.FC<CardProps> = ({ node }) => {
  const meta = getRelationMeta(node.relationType, node.isCurrent);
  const FormatIcon = getFormatIcon(node.format);
  const formatLabel = getFormatRussianLabel(node.format);

  return (
    <motion.div variants={staggerItemVariants} whileHover={{ y: -2 }}>
      <Link
        href={`/anime/${node.id}`}
        className={`group relative flex items-center gap-3 p-3 rounded-lg border transition-colors duration-200 ${
          node.isCurrent
            ? 'bg-zinc-800/90 border-zinc-600'
            : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50'
        }`}
      >
        {/* Poster Thumbnail */}
        <div className="relative w-12 h-16 rounded-md overflow-hidden flex-shrink-0 bg-zinc-800 border border-zinc-700/50">
          {node.coverImage ? (
            <Image
              src={node.coverImage}
              alt={node.title}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-500 text-[10px] font-mono">
              —
            </div>
          )}
        </div>

        {/* Meta Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-1">
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold uppercase border ${meta.badgeStyle}`}
            >
              <meta.icon className="w-2.5 h-2.5" />
              <span>{meta.shortLabel}</span>
            </span>

            {node.year && (
              <span className="text-[10px] font-mono text-zinc-500 flex items-center gap-0.5">
                <Calendar className="w-2.5 h-2.5" />
                <span>{node.year}</span>
              </span>
            )}
          </div>

          <h4
            className={`text-xs font-bold font-sans truncate transition-colors ${
              node.isCurrent ? 'text-white' : 'text-zinc-100 group-hover:text-white'
            }`}
          >
            {node.title}
          </h4>

          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
            <div className="flex items-center gap-1 text-zinc-300">
              <FormatIcon className="w-3 h-3 text-zinc-400" />
              <span>{formatLabel}</span>
            </div>

            {node.isCurrent && (
              <span className="text-zinc-300 font-medium ml-auto flex items-center gap-1 text-[9px]">
                <CheckCircle2 className="w-2.5 h-2.5 text-zinc-400" />
                <span>АКТИВЕН</span>
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
