'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, ChevronRight } from 'lucide-react';

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
                  onClick={() => setSelectedChunk(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-violet-600 text-white font-bold shadow-[0_0_12px_rgba(139,92,246,0.4)]'
                      : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
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
              className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-white placeholder-slate-500 w-36 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-mono font-bold transition-colors"
            >
              Перейти
            </button>
          </form>
        )}
      </div>

      {/* Episodes Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
        {episodesInCurrentChunk.map((epNum) => {
          const isCurrent = epNum === activeEpisode;
          return (
            <Link
              key={epNum}
              href={`/watch/${animeId}/${epNum}`}
              className={`p-3 rounded-xl border text-center transition-all group ${
                isCurrent
                  ? 'bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.5)] border-violet-400'
                  : 'bg-[#141722] hover:bg-violet-600/30 hover:border-violet-500/40 border-white/5'
              }`}
            >
              <span className="block text-[10px] font-mono text-slate-400 group-hover:text-violet-200">
                Серия
              </span>
              <span className="text-sm font-bold font-mono text-white">
                {epNum}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
