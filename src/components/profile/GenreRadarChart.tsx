'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Flame, Compass, Sparkles, Clock, Star } from 'lucide-react';

export interface GenreRadarProps {
  data: { genre: string; value: number; count: number }[];
  totalWatched: number;
  totalHours: string | number;
  averageScore: number;
  className?: string;
}

const GENRE_RU_MAP: Record<string, string> = {
  Action: 'Экшен',
  Adventure: 'Приключения',
  Comedy: 'Комедия',
  Drama: 'Драма',
  Fantasy: 'Фэнтези',
  Horror: 'Ужасы',
  'Mahou Shoujo': 'Махо-сёдзё',
  Mecha: 'Меха',
  Music: 'Музыка',
  Mystery: 'Детектив',
  Psychological: 'Психология',
  Romance: 'Романтика',
  'Sci-Fi': 'Фантастика',
  'Slice of Life': 'Повседневность',
  Sports: 'Спорт',
  Supernatural: 'Мистика',
  Thriller: 'Триллер',
  Shounen: 'Сёнэн',
  Shonen: 'Сёнэн',
  Seinen: 'Сэйнэн',
};

// Geometry constants
const VIEWBOX_SIZE = 400;
const CENTER = VIEWBOX_SIZE / 2; // 200
const MAX_RADIUS = 120;

export const GenreRadarChart: React.FC<GenreRadarProps> = ({
  data = [],
  totalWatched = 0,
  totalHours = 0,
  averageScore = 0,
  className = '',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Take top 8 max
  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => b.value - a.value).slice(0, 8);
  }, [data]);

  const sides = Math.max(3, sortedData.length);
  const angleStep = (Math.PI * 2) / sides;

  // Compute vertices for concentric rings and data polygon
  const rings = [0.2, 0.4, 0.6, 0.8, 1];
  
  const getPoint = (value: number, index: number, radius = MAX_RADIUS) => {
    // start from top (-PI/2)
    const angle = index * angleStep - Math.PI / 2;
    const r = (value / 100) * radius;
    return {
      x: CENTER + Math.cos(angle) * r,
      y: CENTER + Math.sin(angle) * r
    };
  };

  const dataPoints = sortedData.map((d, i) => getPoint(d.value, i));
  const dataPath = dataPoints.length > 0 
    ? dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z'
    : '';

  const topGenre = sortedData.length > 0 ? sortedData[0] : null;

  return (
    <div className={`flex flex-col p-6 rounded-lg bg-zinc-900 border border-zinc-800 shadow-sm relative ${className}`}>
      {/* Header & Badges */}
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2 text-zinc-100">
          <PieChart className="w-5 h-5 text-zinc-400" />
          <h2 className="font-semibold text-sm">Матрица предпочтений</h2>
        </div>
        {topGenre && (
          <div className="flex flex-col items-end">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider mb-1">Любимый жанр</div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800/50 border border-zinc-700/50">
              <Flame className="w-3.5 h-3.5 text-zinc-300" />
              <span className="text-xs font-semibold text-zinc-200">
                {GENRE_RU_MAP[topGenre.genre] || topGenre.genre} ({topGenre.value}%)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Spider Chart Area */}
      <div className="flex-1 flex items-center justify-center relative min-h-[300px]">
        {sortedData.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-4">
            <Compass className="w-10 h-10 text-zinc-700" />
            <p className="text-xs text-zinc-500 max-w-[240px] leading-relaxed">
              Анализ вкусов формируется в реальном времени на основе ваших просмотров и закладок
            </p>
          </div>
        ) : null}

        <svg viewBox={`0 0 ${VIEWBOX_SIZE} ${VIEWBOX_SIZE}`} className="w-full h-full max-w-[400px] max-h-[400px] overflow-visible">
          <defs>
            <radialGradient id="data-gradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#d4d4d8" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#d4d4d8" stopOpacity="0.05" />
            </radialGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid Rings */}
          {rings.map((ring, ringIdx) => {
            const numVertices = sortedData.length || 5;
            const ringAngleStep = (Math.PI * 2) / numVertices;
            const ringPoints = Array.from({ length: numVertices }).map((_, i) => {
              const angle = i * ringAngleStep - Math.PI / 2;
              const r = ring * MAX_RADIUS;
              return `${CENTER + Math.cos(angle) * r},${CENTER + Math.sin(angle) * r}`;
            });
            return (
              <polygon
                key={`ring-${ringIdx}`}
                points={ringPoints.join(' ')}
                className="fill-none stroke-zinc-800"
                strokeWidth={ringIdx === 4 ? 1.5 : 1}
                strokeDasharray={ringIdx < 4 ? "4 4" : "none"}
              />
            );
          })}

          {/* Radial Axis Spokes */}
          {sortedData.length > 0 ? sortedData.map((_, i) => {
            const p = getPoint(100, i);
            return (
              <line
                key={`axis-${i}`}
                x1={CENTER}
                y1={CENTER}
                x2={p.x}
                y2={p.y}
                className="stroke-zinc-800"
                strokeWidth="1"
              />
            );
          }) : Array.from({ length: 5 }).map((_, i) => {
            // ghost spokes
            const angle = i * ((Math.PI * 2) / 5) - Math.PI / 2;
            const r = MAX_RADIUS;
            return (
              <line
                key={`ghost-axis-${i}`}
                x1={CENTER}
                y1={CENTER}
                x2={CENTER + Math.cos(angle) * r}
                y2={CENTER + Math.sin(angle) * r}
                className="stroke-zinc-800/50"
                strokeWidth="1"
              />
            );
          })}

          {/* Data Polygon */}
          {sortedData.length > 0 && (
            <motion.path
              initial={{ opacity: 0, scale: 0.8, transformOrigin: 'center' }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              d={dataPath}
              fill="url(#data-gradient)"
              className="stroke-zinc-200"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Vertices */}
          {sortedData.length > 0 && sortedData.map((d, i) => {
            const p = getPoint(d.value, i);
            const isHovered = hoveredIndex === i;
            return (
              <g key={`vertex-${i}`} 
                 onMouseEnter={() => setHoveredIndex(i)} 
                 onMouseLeave={() => setHoveredIndex(null)}
                 className="cursor-pointer">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 12 : 8}
                  fill="transparent"
                />
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  animate={{ r: isHovered ? 7 : 4 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className={`${isHovered ? 'fill-white' : 'fill-zinc-300'} stroke-zinc-900`}
                  strokeWidth="2"
                  filter={isHovered ? 'url(#glow)' : 'none'}
                />
              </g>
            );
          })}

          {/* Peripheral Labels */}
          {sortedData.length > 0 && sortedData.map((d, i) => {
            // Label point slightly further than max radius
            const angle = i * angleStep - Math.PI / 2;
            const r = MAX_RADIUS + 28;
            const lx = CENTER + Math.cos(angle) * r;
            const ly = CENTER + Math.sin(angle) * r;

            // Determine text anchor based on x position
            let textAnchor: "middle" | "start" | "end" = 'middle';
            if (lx > CENTER + 10) textAnchor = 'start';
            else if (lx < CENTER - 10) textAnchor = 'end';

            // Vertical adjustment
            const dy = ly > CENTER ? 5 : (ly < CENTER ? -5 : 0);

            const label = GENRE_RU_MAP[d.genre] || d.genre;
            
            return (
              <g key={`label-${i}`}>
                <text
                  x={lx}
                  y={ly + dy}
                  textAnchor={textAnchor}
                  className="fill-zinc-400 font-mono text-[10px] select-none"
                  alignmentBaseline="middle"
                >
                  {label} <tspan className="fill-zinc-200 font-bold">{d.value}%</tspan>
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        <AnimatePresence>
          {hoveredIndex !== null && sortedData[hoveredIndex] && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-md bg-zinc-800 border border-zinc-700 text-xs shadow-sm pointer-events-none z-20"
            >
              <span className="font-medium text-zinc-300 mr-1.5">
                {GENRE_RU_MAP[sortedData[hoveredIndex].genre] || sortedData[hoveredIndex].genre}
              </span>
              <span className="font-mono font-bold text-white">{sortedData[hoveredIndex].value}%</span>
              <div className="mt-0.5 text-[10px] text-zinc-500 font-mono text-center">
                {sortedData[hoveredIndex].count} тайтлов
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Metrics */}
      <div className="grid grid-cols-3 gap-3 pt-5 border-t border-zinc-800/50 mt-2 relative z-10">
        <div className="flex flex-col">
          <div className="text-[10px] text-zinc-500 font-mono uppercase mb-0.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Всего тайтлов
          </div>
          <div className="text-sm font-semibold text-zinc-100">{totalWatched}</div>
        </div>
        <div className="flex flex-col border-l border-zinc-800/50 pl-3">
          <div className="text-[10px] text-zinc-500 font-mono uppercase mb-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Часов
          </div>
          <div className="text-sm font-semibold text-zinc-100">{totalHours}</div>
        </div>
        <div className="flex flex-col border-l border-zinc-800/50 pl-3">
          <div className="text-[10px] text-zinc-500 font-mono uppercase mb-0.5 flex items-center gap-1">
            <Star className="w-3 h-3" />
            Ср. рейтинг
          </div>
          <div className="text-sm font-semibold text-zinc-100">{averageScore > 0 ? averageScore.toFixed(1) : '-'}</div>
        </div>
      </div>
    </div>
  );
};
