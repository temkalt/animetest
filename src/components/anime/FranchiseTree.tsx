'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimeRelationItem, UnifiedAnime } from '@/types';
import {
  GitFork,
  GitBranch,
  GitCommit,
  Calendar,
  Tv,
  Film,
  Disc3,
  Sparkles,
  ArrowRight,
  ArrowLeft,
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
  ExternalLink,
  Filter,
  LayoutGrid,
  ListTree,
  Activity,
  Play,
} from 'lucide-react';
import { SPRINGS, staggerContainerVariants, staggerItemVariants } from '@/lib/motion-presets';

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

// Relation configuration mapping with futuristic styling & Russian localization
export const RELATION_META: Record<
  string,
  {
    label: string;
    shortLabel: string;
    description: string;
    badgeStyle: string;
    borderStyle: string;
    glowStyle: string;
    accentColor: string;
    icon: React.ElementType;
    group: 'canon' | 'movies' | 'spinoff' | 'other';
    weight: number;
  }
> = {
  CURRENT: {
    label: 'Текущий тайтл',
    shortLabel: 'ВЫ ЗДЕСЬ',
    description: 'Вы просматриваете этот релиз',
    badgeStyle: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]',
    borderStyle: 'border-cyan-500/50 ring-2 ring-cyan-500/30',
    glowStyle: 'shadow-[0_0_30px_rgba(6,182,212,0.25)]',
    accentColor: '#06B6D4',
    icon: Radio,
    group: 'canon',
    weight: 0,
  },
  PREQUEL: {
    label: 'Предыстория / Приквел',
    shortLabel: 'ПРИКВЕЛ',
    description: 'События, предшествующие основной истории',
    badgeStyle: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]',
    borderStyle: 'border-emerald-500/30 hover:border-emerald-500/60',
    glowStyle: 'hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]',
    accentColor: '#10B981',
    icon: History,
    group: 'canon',
    weight: -10,
  },
  SEQUEL: {
    label: 'Продолжение / Сиквел',
    shortLabel: 'СИКВЕЛ',
    description: 'Следующий хронологический сезон или глава',
    badgeStyle: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 shadow-[0_0_10px_rgba(99,102,241,0.15)]',
    borderStyle: 'border-indigo-500/30 hover:border-indigo-500/60',
    glowStyle: 'hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]',
    accentColor: '#6366F1',
    icon: FastForward,
    group: 'canon',
    weight: 10,
  },
  PARENT: {
    label: 'Основная ветка',
    shortLabel: 'ОСНОВНОЙ СЕРИАЛ',
    description: 'Главный канонический первоисточник франшизы',
    badgeStyle: 'bg-amber-500/15 text-amber-300 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]',
    borderStyle: 'border-amber-500/30 hover:border-amber-500/60',
    glowStyle: 'hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]',
    accentColor: '#F59E0B',
    icon: Shield,
    group: 'canon',
    weight: -5,
  },
  SIDE_STORY: {
    label: 'Побочная история / Сайд-стори',
    shortLabel: 'САЙД-СТОРИ',
    description: 'Параллельные сюжетные арки и дополнения',
    badgeStyle: 'bg-sky-500/15 text-sky-300 border-sky-500/30 shadow-[0_0_10px_rgba(14,165,233,0.15)]',
    borderStyle: 'border-sky-500/30 hover:border-sky-500/60',
    glowStyle: 'hover:shadow-[0_0_20px_rgba(14,165,233,0.2)]',
    accentColor: '#0EA5E9',
    icon: Split,
    group: 'spinoff',
    weight: 20,
  },
  SPIN_OFF: {
    label: 'Спин-офф',
    shortLabel: 'СПИН-ОФФ',
    description: 'Самостоятельная история в той же вселенной',
    badgeStyle: 'bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30 shadow-[0_0_10px_rgba(217,70,239,0.15)]',
    borderStyle: 'border-fuchsia-500/30 hover:border-fuchsia-500/60',
    glowStyle: 'hover:shadow-[0_0_20px_rgba(217,70,239,0.2)]',
    accentColor: '#D946EF',
    icon: Zap,
    group: 'spinoff',
    weight: 25,
  },
  ALTERNATIVE: {
    label: 'Альтернативная версия',
    shortLabel: 'АЛЬТЕРНАТИВА',
    description: 'Иная временная линия или ребут',
    badgeStyle: 'bg-rose-500/15 text-rose-300 border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.15)]',
    borderStyle: 'border-rose-500/30 hover:border-rose-500/60',
    glowStyle: 'hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]',
    accentColor: '#F43F5E',
    icon: Shuffle,
    group: 'spinoff',
    weight: 30,
  },
  CHARACTER: {
    label: 'История персонажа',
    shortLabel: 'ПЕРСОНАЖ',
    description: 'Фокус на отдельном герое вселенной',
    badgeStyle: 'bg-teal-500/15 text-teal-300 border-teal-500/30',
    borderStyle: 'border-teal-500/30 hover:border-teal-500/60',
    glowStyle: 'hover:shadow-[0_0_20px_rgba(20,184,166,0.2)]',
    accentColor: '#14B8A6',
    icon: Split,
    group: 'spinoff',
    weight: 35,
  },
  SUMMARY: {
    label: 'Рекап / Сводка',
    shortLabel: 'РЕКАП',
    description: 'Краткий пересказ ключевых событий',
    badgeStyle: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30',
    borderStyle: 'border-zinc-500/30 hover:border-zinc-500/60',
    glowStyle: 'hover:shadow-[0_0_20px_rgba(113,113,122,0.2)]',
    accentColor: '#71717A',
    icon: FileText,
    group: 'other',
    weight: 40,
  },
  OTHER: {
    label: 'Дополнительно',
    shortLabel: 'ЭКСТРА',
    description: 'Специальные материалы и бонусы',
    badgeStyle: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
    borderStyle: 'border-slate-500/30 hover:border-slate-500/60',
    glowStyle: 'hover:shadow-[0_0_20px_rgba(100,116,139,0.2)]',
    accentColor: '#64748B',
    icon: Layers,
    group: 'other',
    weight: 50,
  },
  ADAPTATION: {
    label: 'Адаптация',
    shortLabel: 'АДАПТАЦИЯ',
    description: 'Манга, ранобэ или первоисточник',
    badgeStyle: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    borderStyle: 'border-yellow-500/30 hover:border-yellow-500/60',
    glowStyle: 'hover:shadow-[0_0_20px_rgba(234,179,8,0.2)]',
    accentColor: '#EAB308',
    icon: Layers,
    group: 'other',
    weight: 60,
  },
};

function getRelationMeta(type: string, isCurrent = false) {
  if (isCurrent) return RELATION_META.CURRENT;
  const normalized = type?.toUpperCase().replace(/\s+/g, '_') || 'OTHER';
  return (
    RELATION_META[normalized] || {
      label: type?.replace(/_/g, ' ') || 'Связанный тайтл',
      shortLabel: type?.replace(/_/g, ' ') || 'СВЯЗЬ',
      description: 'Связанное произведение франшизы',
      badgeStyle: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
      borderStyle: 'border-violet-500/30 hover:border-violet-500/60',
      glowStyle: 'hover:shadow-[0_0_20px_rgba(139,92,246,0.2)]',
      accentColor: '#8B5CF6',
      icon: GitCommit,
      group: 'other' as const,
      weight: 99,
    }
  );
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

  // Build unified and deduplicated node list
  const allNodes: ProcessedNode[] = useMemo(() => {
    const list: ProcessedNode[] = [];
    const seenIds = new Set<number>();

    // 1. Check if current anime exists in relations
    const hasCurrentInRelations = relations.some((r) => r.id === currentAnimeId);

    // 2. Add current anime if provided and not yet present
    if (!hasCurrentInRelations && currentAnime) {
      const currentTitle =
        currentAnime.title?.russian ||
        currentAnime.title?.english ||
        currentAnime.title?.romaji ||
        'Текущий сезон';
      const currentCover =
        currentAnime.coverImage?.large ||
        currentAnime.coverImage?.original ||
        currentAnime.coverImage?.medium ||
        '';

      list.push({
        id: currentAnimeId,
        title: currentTitle,
        relationType: 'CURRENT',
        format: currentAnime.format || 'TV',
        coverImage: currentCover,
        year: currentAnime.seasonYear || null,
        isCurrent: true,
        orderKey: 0,
      });
      seenIds.add(currentAnimeId);
    }

    // 3. Add relation nodes
    relations.forEach((rel) => {
      if (seenIds.has(rel.id)) return;
      seenIds.add(rel.id);

      const isCurrent = rel.id === currentAnimeId;
      const meta = getRelationMeta(rel.relationType, isCurrent);

      list.push({
        id: rel.id,
        title: rel.title,
        relationType: isCurrent ? 'CURRENT' : rel.relationType,
        format: rel.format || 'TV',
        coverImage: rel.coverImage,
        year: rel.year || null,
        isCurrent,
        orderKey: meta.weight,
      });
    });

    // 4. Chronological / Semantic Sort
    return list.sort((a, b) => {
      // If both have release years, sort by year
      if (a.year && b.year && a.year !== b.year) {
        return a.year - b.year;
      }
      // If one has year and one doesn't, sort relative to current
      if (a.isCurrent) return a.year ? 0 : -1;
      if (b.isCurrent) return b.year ? 0 : 1;
      // Fallback by relation weight
      return a.orderKey - b.orderKey;
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
        color: 'text-indigo-400',
        borderColor: 'border-indigo-500/30',
        bgGradient: 'from-indigo-500/10 via-transparent to-transparent',
        nodes: mainStory,
      },
      ...(movies.length > 0
        ? [
            {
              id: 'movies',
              title: 'Полнометражные фильмы',
              subtitle: 'Кинотеатральные релизы и спецвыпуски',
              icon: Film,
              color: 'text-rose-400',
              borderColor: 'border-rose-500/30',
              bgGradient: 'from-rose-500/10 via-transparent to-transparent',
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
              color: 'text-cyan-400',
              borderColor: 'border-cyan-500/30',
              bgGradient: 'from-cyan-500/10 via-transparent to-transparent',
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
              color: 'text-zinc-400',
              borderColor: 'border-zinc-500/30',
              bgGradient: 'from-zinc-500/10 via-transparent to-transparent',
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
    <div className="relative rounded-3xl overflow-hidden bg-[#0A0D16]/90 border border-white/[0.08] backdrop-blur-2xl shadow-2xl p-4 sm:p-7 space-y-6">
      {/* Background Cyber Glow Mesh */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* 1. Header Toolbar & Futuristic Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-white/[0.07]">
        {/* Title & Stats */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <GitFork className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold font-display text-white tracking-tight flex items-center gap-2">
                <span>Хронология франшизы</span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">
                  <Activity className="w-3 h-3 animate-pulse text-cyan-400" />
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
                  <Clock className="w-3 h-3 text-indigo-400" />
                  {minYear === maxYear ? `${minYear} год` : `${minYear} — ${maxYear} гг.`}
                </span>
              </>
            )}
          </p>
        </div>

        {/* View Mode Switcher & Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          {/* View Toggles */}
          <div className="flex items-center p-1 rounded-xl bg-[#121624] border border-white/[0.08]">
            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'timeline'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
              title="Хронологическая лента"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Хронология</span>
            </button>

            <button
              onClick={() => setViewMode('tree')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'tree'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
              }`}
              title="Древо ветвей франшизы"
            >
              <ListTree className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ветви Вселенной</span>
            </button>

            <button
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === 'grid'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
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
            className={`px-3 py-1 rounded-full font-mono transition-all flex items-center gap-1.5 flex-shrink-0 ${
              activeFilter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                : 'bg-white/[0.03] text-zinc-400 hover:text-zinc-200 border border-white/[0.06]'
            }`}
          >
            <span>Все тайтлы</span>
            <span className="text-[10px] opacity-70">({allNodes.length})</span>
          </button>

          <button
            onClick={() => setActiveFilter('canon')}
            className={`px-3 py-1 rounded-full font-mono transition-all flex items-center gap-1.5 flex-shrink-0 ${
              activeFilter === 'canon'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-[0_0_12px_rgba(99,102,241,0.2)]'
                : 'bg-white/[0.03] text-zinc-400 hover:text-zinc-200 border border-white/[0.06]'
            }`}
          >
            <span>Основной канон</span>
          </button>

          <button
            onClick={() => setActiveFilter('movies')}
            className={`px-3 py-1 rounded-full font-mono transition-all flex items-center gap-1.5 flex-shrink-0 ${
              activeFilter === 'movies'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
                : 'bg-white/[0.03] text-zinc-400 hover:text-zinc-200 border border-white/[0.06]'
            }`}
          >
            <span>Фильмы</span>
          </button>

          <button
            onClick={() => setActiveFilter('spinoff')}
            className={`px-3 py-1 rounded-full font-mono transition-all flex items-center gap-1.5 flex-shrink-0 ${
              activeFilter === 'spinoff'
                ? 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/40 shadow-[0_0_12px_rgba(217,70,239,0.2)]'
                : 'bg-white/[0.03] text-zinc-400 hover:text-zinc-200 border border-white/[0.06]'
            }`}
          >
            <span>Спин-оффы & Спешлы</span>
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
            {/* Desktop / Tablet Timeline Rail */}
            <div className="relative">
              {/* Horizontal Scrollable Rail on Large Screens */}
              <div className="flex md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 overflow-x-auto pb-3 md:pb-0 scrollbar-thin">
                {filteredNodes.map((node, index) => (
                  <TimelineCard key={`${node.id}-${node.relationType}`} node={node} stepNumber={index + 1} />
                ))}
              </div>
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
            className="space-y-6"
          >
            {branchGroups.map((group) => (
              <div
                key={group.id}
                className={`p-4 sm:p-5 rounded-2xl border ${group.borderColor} bg-gradient-to-br ${group.bgGradient} bg-[#0D101C]/60 backdrop-blur-md space-y-3.5`}
              >
                {/* Branch Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <group.icon className={`w-4 h-4 ${group.color}`} />
                    <div>
                      <h4 className="text-sm font-bold font-display text-white">{group.title}</h4>
                      <p className="text-[11px] text-zinc-400">{group.subtitle}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/[0.06] text-zinc-300 border border-white/[0.08]">
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
      <div className="pt-2 flex items-center justify-between text-[11px] text-zinc-500 font-mono border-t border-white/[0.05]">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          <span>Нажмите на любой тайтл для перехода к просмотру</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-zinc-400">
          <Sparkles className="w-3 h-3 text-cyan-400" />
          <span>KuroNami Universe Graph</span>
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

  return (
    <motion.div variants={staggerItemVariants} className="flex-shrink-0 w-72 md:w-auto">
      <Link
        href={`/anime/${node.id}`}
        className={`group relative block h-full p-3.5 rounded-2xl border transition-all duration-300 backdrop-blur-xl ${
          node.isCurrent
            ? 'bg-gradient-to-br from-cyan-950/40 via-[#101726]/90 to-[#0A0D15] border-cyan-400/60 ring-2 ring-cyan-400/30 shadow-[0_0_30px_rgba(6,182,212,0.25)]'
            : 'bg-[#0E121E]/80 border-white/[0.08] hover:border-indigo-500/50 hover:bg-[#141A2B]/90 hover:shadow-[0_0_25px_rgba(99,102,241,0.2)]'
        }`}
      >
        {/* Futuristic Cyber Corner Accents for Current Item */}
        {node.isCurrent && (
          <>
            <span className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-cyan-400 rounded-tl-sm pointer-events-none" />
            <span className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-cyan-400 rounded-tr-sm pointer-events-none" />
            <span className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-cyan-400 rounded-bl-sm pointer-events-none" />
            <span className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-cyan-400 rounded-br-sm pointer-events-none" />
          </>
        )}

        <div className="flex gap-3.5 items-start">
          {/* Poster Thumbnail */}
          <div className="relative w-14 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800 border border-white/[0.1] shadow-md group-hover:scale-105 transition-transform duration-300">
            {node.coverImage ? (
              <Image
                src={node.coverImage}
                alt={node.title}
                fill
                sizes="64px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-indigo-950 text-indigo-400 text-[10px] font-mono">
                ANI
              </div>
            )}
            {/* Dark gradient shadow */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          </div>

          {/* Body Content */}
          <div className="flex-1 min-w-0 space-y-1.5">
            {/* Top Row: Relation Badge & Step */}
            <div className="flex items-center justify-between gap-1">
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-mono font-bold tracking-wider uppercase border ${meta.badgeStyle}`}
              >
                {node.isCurrent ? (
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
                  </span>
                ) : (
                  <meta.icon className="w-2.5 h-2.5" />
                )}
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
              className={`text-xs font-bold font-display line-clamp-2 leading-snug transition-colors ${
                node.isCurrent ? 'text-cyan-200' : 'text-zinc-100 group-hover:text-indigo-300'
              }`}
            >
              {node.title}
            </h4>

            {/* Format & Year Badges */}
            <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
              <div className="flex items-center gap-1 text-zinc-300">
                <FormatIcon className="w-3 h-3 text-indigo-400" />
                <span>{node.format}</span>
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

        {/* Current Node Glow Banner */}
        {node.isCurrent && (
          <div className="mt-2.5 pt-2 border-t border-cyan-500/20 flex items-center justify-between text-[10px] font-mono text-cyan-300">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-cyan-400" />
              <span>Текущий релиз</span>
            </span>
            <span className="text-cyan-400/70">Вы смотрите</span>
          </div>
        )}
      </Link>
    </motion.div>
  );
};

// ==========================================
// SUB-COMPONENT: FRANCHISE NODE CARD (TREE / GRID)
// ==========================================
const FranchiseNodeCard: React.FC<CardProps> = ({ node, compact }) => {
  const meta = getRelationMeta(node.relationType, node.isCurrent);
  const FormatIcon = getFormatIcon(node.format);

  return (
    <motion.div variants={staggerItemVariants}>
      <Link
        href={`/anime/${node.id}`}
        className={`group relative flex items-center gap-3 p-3 rounded-2xl border transition-all duration-300 backdrop-blur-xl ${
          node.isCurrent
            ? 'bg-gradient-to-r from-cyan-950/40 via-[#101726]/90 to-[#0A0D15] border-cyan-400/60 ring-2 ring-cyan-400/30 shadow-[0_0_25px_rgba(6,182,212,0.25)]'
            : 'bg-[#0E121E]/80 border-white/[0.08] hover:border-indigo-500/50 hover:bg-[#141A2B]/90 hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]'
        }`}
      >
        {/* Poster Thumbnail */}
        <div className="relative w-12 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800 border border-white/[0.1] shadow-md group-hover:scale-105 transition-transform duration-300">
          {node.coverImage ? (
            <Image
              src={node.coverImage}
              alt={node.title}
              fill
              sizes="48px"
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-indigo-950 text-indigo-400 text-[10px] font-mono">
              ANI
            </div>
          )}
        </div>

        {/* Meta Content */}
        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex items-center justify-between gap-1">
            <span
              className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${meta.badgeStyle}`}
            >
              {node.isCurrent ? (
                <span className="flex h-1.5 w-1.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-300 opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-cyan-400" />
                </span>
              ) : (
                <meta.icon className="w-2.5 h-2.5" />
              )}
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
            className={`text-xs font-bold font-display truncate transition-colors ${
              node.isCurrent ? 'text-cyan-200' : 'text-zinc-100 group-hover:text-indigo-300'
            }`}
          >
            {node.title}
          </h4>

          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-400">
            <div className="flex items-center gap-1 text-zinc-300">
              <FormatIcon className="w-3 h-3 text-indigo-400" />
              <span>{node.format}</span>
            </div>

            {node.isCurrent && (
              <span className="text-cyan-400 font-bold ml-auto flex items-center gap-1 text-[9px]">
                <CheckCircle2 className="w-2.5 h-2.5" />
                <span>АКТИВЕН</span>
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

