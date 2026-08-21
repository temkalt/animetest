'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play } from 'lucide-react';

interface EpisodeGridProps {
  animeId: number;
  totalEpisodes: number;
  activeEpisode?: number;
}

export const EpisodeGrid: React.FC<EpisodeGridProps> = ({
  animeId,
  totalEpisodes,
  activeEpisode,
}) => {
  const router = useRouter();
  const chunkSize = 50;
  const totalChunks = Math.ceil(totalEpisodes / chunkSize);
  const [selectedChunk, setSelectedChunk] = useState(
    activeEpisode ? Math.floor((activeEpisode - 1) / chunkSize) : 0
  );
  const [jumpInput, setJumpInput] = useState('');

  const startEp = selectedChunk * chunkSize + 1;
  const endEp = Math.min(totalEpisodes, (selectedChunk + 1) * chunkSize);
  const episodesInCurrentChunk = Array.from(
    { length: endEp - startEp + 1 },
    (_, i) => startEp + i
  );

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const ep = parseInt(jumpInput, 10);
    if (!isNaN(ep) && ep >= 1 && ep <= totalEpisodes) {
      router.push(`/watch/${animeId}/${ep}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Chunk Tabs & Fast Jump Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap">
        {totalChunks > 1 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
            {Array.from({ length: totalChunks }).map((_, idx) => {
              const cStart = idx * chunkSize + 1;
              const cEnd = Math.min(totalEpisodes, (idx + 1) * chunkSize);
              const isSelected = selectedChunk === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedChunk(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-[#0E1118] text-zinc-400 hover:text-white hover:bg-white/[0.06] border border-white/[0.06]'
                  }`}
                >
                  {cStart} – {cEnd}
                </button>
              );
            })}
          </div>
        )}

        {/* Jump To Episode Form */}
        {totalEpisodes > 20 && (
          <form onSubmit={handleJump} className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={totalEpisodes}
              value={jumpInput}
              onChange={(e) => setJumpInput(e.target.value)}
              placeholder={`Серия (1-${totalEpisodes})...`}
              className="px-3 py-1.5 rounded-xl bg-[#0E1118] border border-white/[0.08] text-xs font-mono text-white placeholder-zinc-500 w-36 focus:outline-none focus:border-indigo-500/60"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold transition-colors cursor-pointer"
            >
              Перейти
            </button>
          </form>
        )}
      </div>

      {/* Episodes Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
        {episodesInCurrentChunk.map((epNum) => {
          const isCurrent = epNum === activeEpisode;
          return (
            <Link
              key={epNum}
              href={`/watch/${animeId}/${epNum}`}
              className={`p-3 rounded-xl border text-center transition-all group flex flex-col items-center justify-center gap-1 ${
                isCurrent
                  ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow-lg shadow-indigo-600/30 scale-105'
                  : 'bg-[#0E1118] hover:bg-[#151926] text-zinc-300 hover:text-white border-white/[0.06] hover:border-indigo-500/40'
              }`}
            >
              <span className="text-xs font-mono font-bold">{epNum}</span>
              <span className="text-[10px] text-zinc-500 group-hover:text-zinc-400 uppercase tracking-tighter">
                Серия
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
