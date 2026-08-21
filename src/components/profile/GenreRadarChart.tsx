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
      className={`w-full relative flex flex-col items-center justify-between p-5 sm:p-6 rounded-3xl bg-[#090B10] border border-white/[0.08] shadow-[0_0_30px_rgba(6,182,212,0.05)] overflow-hidden select-none ${className}`}
      style={{ maxWidth: size ? `${size + 80}px` : '100%' }}
    >
      {/* Background Cyber Glow & Corner Brackets */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-rose-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl" />

        {/* Tech Corner Crosshairs */}
        <div className="absolute top-3 left-3 text-[9px] font-mono text-cyan-400/40">⌜ 001_RADAR</div>
        <div className="absolute top-3 right-3 text-[9px] font-mono text-rose-400/40">GENRE_SYNC ⌝</div>
        <div className="absolute bottom-3 left-3 text-[9px] font-mono text-slate-500/40">⌞ AFFINITY_v2</div>
        <div className="absolute bottom-3 right-3 text-[9px] font-mono text-indigo-400/40">8_AXIS ⌟</div>
      </div>

      {/* Cyber HUD Header */}
      <div className="flex items-center justify-between w-full relative z-10 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#06B6D4]" />
            <span className="absolute w-4 h-4 rounded-full border border-cyan-400/40 animate-ping" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-display font-extrabold text-white tracking-wider uppercase flex items-center gap-1.5">
              <span>Матрица предпочтений</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                CYBER
              </span>
            </h3>
            <p className="text-[10px] font-mono text-slate-400 tracking-tight">
              Синхронизация профиля вкусов
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08]">
          <Activity className="w-3 h-3 text-cyan-400 animate-pulse" />
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
          <defs>
            {/* Multi-stop Neon Linear Gradient */}
            <linearGradient id="cyberRadarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#6366F1" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.45" />
            </linearGradient>

            {/* Neon Border Gradient */}
            <linearGradient id="cyberStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#22D3EE" />
              <stop offset="50%" stopColor="#818CF8" />
              <stop offset="100%" stopColor="#FB7185" />
            </linearGradient>

            {/* Radial Radar Core Glow */}
            <radialGradient id="cyberRadarCenterGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.25" />
              <stop offset="40%" stopColor="#6366F1" stopOpacity="0.12" />
              <stop offset="85%" stopColor="#0E1017" stopOpacity="0" />
            </radialGradient>

            {/* Subtle Scanning Cone Gradient */}
            <radialGradient id="radarSweepGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.3" />
              <stop offset="70%" stopColor="#06B6D4" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#06B6D4" stopOpacity="0" />
            </radialGradient>

            {/* High-glow Neon Filter for Polygon */}
            <filter id="neonRadarGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Vertex Point Glow Filter */}
            <filter id="vertexPointGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Central Radial Atmosphere */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="url(#cyberRadarCenterGlow)"
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
                stroke="url(#cyberStrokeGrad)"
                strokeWidth="1.5"
                strokeOpacity="0.35"
                strokeDasharray="4 2"
              />
              <circle
                cx={center}
                cy={center - radius * 0.7}
                r={2}
                fill="#06B6D4"
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
            stroke="url(#cyberStrokeGrad)"
            strokeWidth="6"
            strokeOpacity="0.3"
            filter="url(#neonRadarGlow)"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ originX: `${center}px`, originY: `${center}px` }}
          />

          {/* Primary Data Area Polygon */}
          <motion.polygon
            points={polygonPointsString}
            fill="url(#cyberRadarGrad)"
            stroke="url(#cyberStrokeGrad)"
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
              stroke="#F43F5E"
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
            const dotColor = isHigh ? '#F43F5E' : '#06B6D4';
            const ringColor = isHigh ? '#FB7185' : '#38BDF8';

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
                    stroke={ringColor}
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
                  fill={isHovered ? '#FFFFFF' : dotColor}
                  stroke={isHovered ? dotColor : '#090B10'}
                  strokeWidth={2}
                  filter={isHovered ? 'url(#vertexPointGlow)' : undefined}
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
                  className={`text-[11px] font-display font-bold transition-all duration-200 ${
                    isHovered
                      ? 'fill-cyan-300 font-extrabold text-[12px]'
                      : isTop
                      ? 'fill-white font-extrabold'
                      : 'fill-slate-300'
                  }`}
                  filter={isHovered ? 'drop-shadow(0 0 6px rgba(6,182,212,0.8))' : undefined}
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
              className="absolute pointer-events-none z-20 flex flex-col items-center px-3 py-1.5 rounded-xl bg-[#0F131D]/90 border border-cyan-500/40 backdrop-blur-md shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-[11px] font-display font-extrabold text-white">
                  {activePoint.genre}
                </span>
                <span className="text-[11px] font-mono font-bold text-cyan-300">
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
      <div className="w-full grid grid-cols-2 gap-3 pt-3 mt-1 border-t border-white/[0.07] relative z-10">
        {/* Dominant Genre Pill */}
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="w-7 h-7 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
            <Zap className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">
              Фаворит
            </div>
            <div className="text-xs font-display font-bold text-white truncate">
              {topGenre ? `${topGenre.genre} (${topGenre.value}%)` : '—'}
            </div>
          </div>
        </div>

        {/* Avg Affinity Pill */}
        <div className="flex items-center gap-2.5 p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="min-w-0">
            <div className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">
              Аффинити
            </div>
            <div className="text-xs font-display font-bold text-cyan-300 truncate">
              {avgAffinity}% индекс
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

