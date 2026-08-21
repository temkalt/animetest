'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { radarPolygonVariants, SPRINGS } from '@/lib/motion-presets';

interface GenrePoint {
  genre: string;
  value: number; // 0 - 100
}

interface GenreRadarProps {
  data?: GenrePoint[];
  size?: number;
}

const DEFAULT_GENRES: GenrePoint[] = [
  { genre: 'Сёнен', value: 85 },
  { genre: 'Экшен', value: 92 },
  { genre: 'Фэнтези', value: 78 },
  { genre: 'Психология', value: 65 },
  { genre: 'Детектив', value: 70 },
  { genre: 'Драма', value: 60 },
  { genre: 'Комедия', value: 75 },
  { genre: 'Меха', value: 45 },
];

export const GenreRadarChart: React.FC<GenreRadarProps> = ({
  data = DEFAULT_GENRES,
  size = 300,
}) => {
  const center = size / 2;
  const radius = (size / 2) * 0.7;
  const count = data.length;

  const points = useMemo(() => {
    return data.map((d, i) => {
      const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
      const r = (d.value / 100) * radius;
      return {
        x: center + r * Math.cos(angle),
        y: center + r * Math.sin(angle),
        labelX: center + (radius + 22) * Math.cos(angle),
        labelY: center + (radius + 22) * Math.sin(angle),
        ...d,
      };
    });
  }, [data, center, radius, count]);

  const polygonPath = useMemo(() => {
    return points.map((p) => `${p.x},${p.y}`).join(' ');
  }, [points]);

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#0E1017] rounded-3xl border border-white/10 shadow-xl space-y-4">
      <div className="flex items-center justify-between w-full">
        <h3 className="text-sm font-display font-bold text-white tracking-wider uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#06B6D4]" />
          <span>Матрица жанровых предпочтений</span>
        </h3>
        <span className="text-[11px] font-mono text-slate-400">8-Axis Matrix</span>
      </div>

      <svg width={size} height={size} className="overflow-visible select-none">
        {/* Background Rings */}
        {[0.25, 0.5, 0.75, 1].map((scale, index) => {
          const ringPoints = Array.from({ length: count }).map((_, i) => {
            const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
            const r = radius * scale;
            return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
          });
          return (
            <polygon
              key={`ring-${index}`}
              points={ringPoints.join(' ')}
              fill="none"
              stroke="rgba(255, 255, 255, 0.08)"
              strokeWidth="1"
              strokeDasharray={scale === 1 ? 'none' : '3,3'}
            />
          );
        })}

        {/* Axis Spokes */}
        {Array.from({ length: count }).map((_, i) => {
          const angle = (Math.PI * 2 * i) / count - Math.PI / 2;
          return (
            <line
              key={`axis-${i}`}
              x1={center}
              y1={center}
              x2={center + radius * Math.cos(angle)}
              y2={center + radius * Math.sin(angle)}
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
            />
          );
        })}

        {/* Data Area Polygon */}
        <defs>
          <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        <motion.polygon
          variants={radarPolygonVariants}
          initial="hidden"
          animate="visible"
          points={polygonPath}
          fill="url(#radarGrad)"
          stroke="#06B6D4"
          strokeWidth="2"
          filter="drop-shadow(0 0 10px rgba(6, 182, 212, 0.4))"
        />

        {/* Vertex Points & Labels */}
        {points.map((p, i) => (
          <g key={`point-${i}`}>
            <motion.circle
              cx={p.x}
              cy={p.y}
              r={3.5}
              fill="#F43F5E"
              stroke="#ffffff"
              strokeWidth={1.5}
              whileHover={{ r: 6 }}
              transition={SPRINGS.snappy}
            />
            <text
              x={p.labelX}
              y={p.labelY}
              textAnchor="middle"
              dominantBaseline="middle"
              className="text-[10px] font-mono fill-slate-300 font-medium"
            >
              {p.genre}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};
