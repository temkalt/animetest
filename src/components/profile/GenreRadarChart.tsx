'use client';

import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SPRINGS } from '@/lib/motion-presets';
import { Sparkles, Activity, Zap } from 'lucide-react';

export interface GenrePoint {
  genre: string;
  value: number; // 0 - 100
}

export interface GenreRadarProps {
  data?: GenrePoint[];
  size?: number;
  className?: string;
}

const DEFAULT_GENRES: GenrePoint[] = [
  { genre: 'Сёнен', value: 88 },
  { genre: 'Экшен', value: 94 },
  { genre: 'Фэнтези', value: 82 },
  { genre: 'Психология', value: 68 },
  { genre: 'Детектив', value: 74 },
  { genre: 'Драма', value: 62 },
  { genre: 'Комедия', value: 78 },
  { genre: 'Меха', value: 50 },
];

export const GenreRadarChart: React.FC<GenreRadarProps> = ({
  data = DEFAULT_GENRES,
  size = 360,
  className = '',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Geometry configuration based on 400x400 coordinate space
  const viewBoxSize = 400;
  const center = viewBoxSize / 2;
  const radius = 125;
  const count = data.length;

  // Calculate coordinates for polygon vertices and peripheral labels
  const points = useMemo(() => {
    return data.map((d, i) => {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const r = (Math.max(10, Math.min(100, d.value)) / 100) * radius;

      // Outer label positioning
      const labelDist = radius + 32;
      const labelX = center + labelDist * cosA;
      const labelY = center + labelDist * sinA;

      // Text alignment anchor to prevent clipping
      let textAnchor: 'start' | 'middle' | 'end' = 'middle';
      if (cosA > 0.25) textAnchor = 'start';
      else if (cosA < -0.25) textAnchor = 'end';

      return {
        x: center + r * cosA,
        y: center + r * sinA,
        axisEndX: center + radius * cosA,
        axisEndY: center + radius * sinA,
        labelX,
        labelY,
        angle,
        cosA,
        sinA,
        textAnchor,
        ...d,
      };
    });
  }, [data, center, radius, count]);

  // Polygon path strings
  const polygonPointsString = useMemo(() => {
    return points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  }, [points]);

  // Concentric grid levels (20%, 40%, 60%, 80%, 100%)
  const gridScales = [0.2, 0.4, 0.6, 0.8, 1.0];

  // Highest genre
  const topGenre = useMemo(() => {
    if (!data.length) return null;
    return [...data].sort((a, b) => b.value - a.value)[0];
  }, [data]);

  // Average Affinity
  const avgAffinity = useMemo(() => {
    if (!data.length) return 0;
    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    return Math.round(total / data.length);
  }, [data]);

  const activePoint = hoveredIndex !== null ? points[hoveredIndex] : null;

  return (
    <div
      className={`w-full relative flex flex-col items-center justify-between p-5 sm:p-6 rounded-lg bg-zinc-950 border border-zinc-800  overflow-hidden select-none ${className}`}
      style={{ maxWidth: size ? `${size + 80}px` : '100%' }}
    >
      {/* Background Cyber Glow & Corner Brackets */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-zinc-800 rounded-lg " />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-zinc-800 rounded-lg " />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-zinc-800 rounded-lg " />

        {/* Tech Corner Crosshairs */}
        <div className="absolute top-3 left-3 text-[9px] font-mono text-zinc-400/40">⌜ 001_RADAR</div>
        <div className="absolute top-3 right-3 text-[9px] font-mono text-zinc-400/40">GENRE_SYNC ⌝</div>
        <div className="absolute bottom-3 left-3 text-[9px] font-mono text-slate-500/40">⌞ AFFINITY_v2</div>
        <div className="absolute bottom-3 right-3 text-[9px] font-mono text-zinc-400/40">8_AXIS ⌟</div>
      </div>

      {/* Cyber HUD Header */}
      <div className="flex items-center justify-between w-full relative z-10 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-lg bg-zinc-800  " />
            <span className="absolute w-4 h-4 rounded-lg border border-zinc-800 " />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-sans font-extrabold text-zinc-100 tracking-wider uppercase flex items-center gap-1.5">
              <span>Матрица предпочтений</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-800 font-mono">
                CYBER
              </span>
            </h3>
            <p className="text-[10px] font-mono text-slate-400 tracking-tight">
              Синхронизация профиля вкусов
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-800">
          <Activity className="w-3 h-3 text-zinc-400 " />
          <span className="text-[10px] font-mono font-medium text-slate-300">
            {count}-Axis Matrix
          </span>
        </div>
      </div>

      {/* Main SVG Radar Container */}
      <div className="relative w-full aspect-square flex items-center justify-center max-w-[380px] my-1">
        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className="w-full h-full overflow-visible"
        >
          

          {/* Central Radial Atmosphere */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            className="pointer-events-none"
          />

          {/* Animated Rotating Radar Sweep Beam */}
          <g className="pointer-events-none">
            <motion.g
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
              style={{ originX: `${center}px`, originY: `${center}px` }}
            >
              <line
                x1={center}
                y1={center}
                x2={center}
                y2={center - radius}
                stroke="#52525b"
                strokeWidth="1.5"
                strokeOpacity="0.35"
                strokeDasharray="4 2"
              />
              <circle
                cx={center}
                cy={center - radius * 0.7}
                r={2}
                fill="#a1a1aa"
                opacity={0.6}
              />
            </motion.g>
          </g>

          {/* Concentric Background Grid Rings */}
          {gridScales.map((scale, index) => {
            const isOuter = index === gridScales.length - 1;
            const isMid = index === 2;
            const ringPoints = Array.from({ length: count }).map((_, i) => {
              const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
              const r = radius * scale;
              return `${(center + r * Math.cos(angle)).toFixed(1)},${(center + r * Math.sin(angle)).toFixed(1)}`;
            });

            return (
              <g key={`grid-ring-${index}`}>
                <polygon
                  points={ringPoints.join(' ')}
                  fill={isOuter ? 'rgba(6, 182, 212, 0.02)' : 'none'}
                  stroke={
                    isOuter
                      ? 'rgba(6, 182, 212, 0.3)'
                      : isMid
                      ? 'rgba(99, 102, 241, 0.18)'
                      : 'rgba(255, 255, 255, 0.07)'
                  }
                  strokeWidth={isOuter ? '1.5' : '1'}
                  strokeDasharray={isOuter ? 'none' : isMid ? '3 3' : '2 4'}
                />

                {/* Percentage Tick Label on Top Axis */}
                {index > 0 && (
                  <text
                    x={center + 6}
                    y={center - radius * scale + 3}
                    className="text-[8px] font-mono fill-slate-500/70 select-none pointer-events-none font-semibold"
                  >
                    {Math.round(scale * 100)}%
                  </text>
                )}
              </g>
            );
          })}

          {/* Radial Spokes / Axes */}
          {points.map((p, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <g key={`spoke-${i}`}>
                <line
                  x1={center}
                  y1={center}
                  x2={p.axisEndX}
                  y2={p.axisEndY}
                  stroke={isHovered ? '#06B6D4' : 'rgba(255, 255, 255, 0.09)'}
                  strokeWidth={isHovered ? '1.5' : '1'}
                  strokeDasharray={isHovered ? 'none' : '4 3'}
                  className="transition-colors duration-300"
                />
                {/* Spoke End Tech Tick */}
                <circle
                  cx={p.axisEndX}
                  cy={p.axisEndY}
                  r={1.5}
                  fill={isHovered ? '#06B6D4' : 'rgba(255, 255, 255, 0.2)'}
                />
              </g>
            );
          })}

          {/* Ghost / Ambient Glow Background Polygon */}
          <motion.polygon
            points={polygonPointsString}
            fill="none"
            stroke="#52525b"
            strokeWidth="6"
            strokeOpacity="0.3"
            
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ originX: `${center}px`, originY: `${center}px` }}
          />

          {/* Primary Data Area Polygon */}
          <motion.polygon
            points={polygonPointsString}
            fill="#27272a"
            stroke="#52525b"
            strokeWidth="2.2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            style={{ originX: `${center}px`, originY: `${center}px` }}
            className="cursor-pointer"
          />

          {/* Active Highlight Line from Center to Hovered Vertex */}
          {activePoint && (
            <motion.line
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              x1={center}
              y1={center}
              x2={activePoint.x}
              y2={activePoint.y}
              stroke="#e4e4e7"
              strokeWidth="2"
              strokeDasharray="3 3"
              className="pointer-events-none"
            />
          )}

          {/* Vertex Points */}
          {points.map((p, i) => {
            const isHovered = hoveredIndex === i;
            // Distinct neon dot accents
            const isHigh = p.value >= 80;
            const dotColor = '#a1a1aa';
            const ringColor = '#71717a';

            return (
              <g
                key={`vertex-${i}`}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Hit target zone */}
                <circle cx={p.x} cy={p.y} r={14} fill="transparent" />

                {/* Animated Pulsing Ring on Hover */}
                {isHovered && (
                  <motion.circle
                    cx={p.x}
                    cy={p.y}
                    r={8}
                    fill="none"
                    stroke='#52525b'
                    strokeWidth="1.5"
                    initial={{ scale: 0.8, opacity: 0.8 }}
                    animate={{ scale: [1, 1.7, 1], opacity: [0.9, 0.2, 0.9] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                  />
                )}

                {/* Core Vertex Node */}
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 5.5 : 4}
                  fill={isHovered ? '#f4f4f5' : '#a1a1aa'}
                  stroke={'#27272a'}
                  strokeWidth={2}
                  
                  whileHover={{ scale: 1.4 }}
                  transition={SPRINGS.snappy}
                />
              </g>
            );
          })}

          {/* Peripheral Genre Labels with Percentage Badges */}
          {points.map((p, i) => {
            const isHovered = hoveredIndex === i;
            const isTop = topGenre?.genre === p.genre;

            // Offset Y for percentage line
            const genreY = p.labelY - 5;
            const valY = p.labelY + 8;

            return (
              <g
                key={`label-${i}`}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Genre Title */}
                <text
                  x={p.labelX}
                  y={genreY}
                  textAnchor={p.textAnchor}
                  dominantBaseline="middle"
                  className={`text-[11px] font-sans font-bold transition-all duration-200 ${
                    isHovered
                      ? 'fill-cyan-300 font-extrabold text-[12px]'
                      : isTop
                      ? 'fill-white font-extrabold'
                      : 'fill-slate-300'
                  }`}
                  filter={isHovered ? '' : undefined}
                >
                  {p.genre}
                </text>

                {/* Percentage Badge */}
                <text
                  x={p.labelX}
                  y={valY}
                  textAnchor={p.textAnchor}
                  dominantBaseline="middle"
                  className={`text-[10px] font-mono font-semibold transition-all duration-200 ${
                    isHovered
                      ? 'fill-rose-400 font-bold'
                      : p.value >= 80
                      ? 'fill-cyan-400'
                      : 'fill-slate-400'
                  }`}
                >
                  {p.value}%
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Center Tooltip on Hover */}
        <AnimatePresence>
          {activePoint && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 4 }}
              transition={{ duration: 0.18 }}
              className="absolute pointer-events-none z-20 flex flex-col items-center px-3 py-1.5 rounded-lg bg-[#0F131D]/90 border border-zinc-800  "
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-lg bg-zinc-800 " />
                <span className="text-[11px] font-sans font-extrabold text-zinc-100">
                  {activePoint.genre}
                </span>
                <span className="text-[11px] font-mono font-bold text-zinc-300">
                  [{activePoint.value}%]
                </span>
              </div>
              <div className="text-[9px] font-mono text-slate-400 mt-0.5">
                {activePoint.value >= 85
                  ? '⚡ ДОМИНИРУЮЩИЙ ЖАНР'
                  : activePoint.value >= 70
                  ? '★ ВЫСОКИЙ ИНТЕРЕС'
                  : '◎ СРЕДНИЙ ИНТЕРЕС'}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cyber Footer Status Matrix Bar */}
      <div className="w-full grid grid-cols-2 gap-3 pt-3 mt-1 border-t border-zinc-800 relative z-10">
        {/* Dominant Genre Pill */}
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-800 border border-zinc-800">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-800 flex items-center justify-center flex-shrink-0">
            <Zap className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">
              Фаворит
            </div>
            <div className="text-xs font-sans font-bold text-zinc-100 truncate">
              {topGenre ? `${topGenre.genre} (${topGenre.value}%)` : '—'}
            </div>
          </div>
        </div>

        {/* Avg Affinity Pill */}
        <div className="flex items-center gap-2.5 p-2 rounded-lg bg-zinc-800 border border-zinc-800">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-800 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">
              Аффинити
            </div>
            <div className="text-xs font-sans font-bold text-zinc-300 truncate">
              {avgAffinity}% индекс
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

