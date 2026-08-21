import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AnimeRelationItem } from '@/types';
import { Film, Tv, GitFork } from 'lucide-react';

interface FranchiseTreeProps {
  currentAnimeId: number;
  relations: AnimeRelationItem[];
}

export const FranchiseTree: React.FC<FranchiseTreeProps> = ({ currentAnimeId, relations }) => {
  if (!relations || relations.length === 0) return null;

  return (
    <div className="p-6 rounded-3xl bg-[#0E1017] border border-white/5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
          <GitFork className="w-4 h-4 text-violet-400" />
          <span>Хронология и Вселенная франшизы</span>
        </h3>
        <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300">
          {relations.length + 1} тайтлов
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {relations.map((node) => {
          const isCurrent = node.id === currentAnimeId;
          return (
            <Link
              key={`${node.id}-${node.relationType}`}
              href={`/anime/${node.id}`}
              className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${
                isCurrent
                  ? 'bg-violet-600/15 border-violet-500/50 ring-1 ring-violet-500/30'
                  : 'bg-[#141722] border-white/5 hover:border-white/20 hover:bg-[#1C202E]'
              }`}
            >
              <div className="relative w-12 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-slate-800">
                {node.coverImage && (
                  <Image src={node.coverImage} alt={node.title} fill className="object-cover" />
                )}
              </div>
              <div className="overflow-hidden space-y-1">
                <div className="text-[10px] font-mono font-bold tracking-wider text-cyan-400 uppercase">
                  {node.relationType.replace(/_/g, ' ')}
                </div>
                <div className="text-xs font-semibold text-gray-200 truncate">{node.title}</div>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-mono">
                  {node.format === 'TV' ? <Tv className="w-3 h-3" /> : <Film className="w-3 h-3" />}
                  <span>{node.format}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
