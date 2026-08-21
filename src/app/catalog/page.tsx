import React from 'react';
import { AnimeResolver } from '@/lib/api/resolver';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { Filter, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface CatalogProps {
  searchParams: Promise<{
    genre?: string;
    format?: string;
    status?: string;
    season?: string;
    year?: string;
  }>;
}

const GENRES = [
  'Все', 'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy',
  'Horror', 'Mahou Shoujo', 'Mecha', 'Music', 'Mystery',
  'Psychological', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
];

export const revalidate = 3600;

export default async function CatalogPage({ searchParams }: CatalogProps) {
  const params = await searchParams;
  const activeGenre = params.genre === 'Все' || !params.genre ? undefined : params.genre;
  const activeStatus = params.status;

  const animeList = await AnimeResolver.getPopular(1, 24);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
            Вселенная тайтлов
          </span>
        </div>
        <h1 className="text-3xl font-extrabold font-display tracking-tight text-white">
          Каталог всех аниме
        </h1>
      </div>

      {/* Filter Badges Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {GENRES.map((g) => {
          const isSelected = (!activeGenre && g === 'Все') || activeGenre === g;
          return (
            <Link
              key={g}
              href={g === 'Все' ? '/catalog' : `/catalog?genre=${encodeURIComponent(g)}`}
              className={`px-4 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-violet-600 text-white font-bold shadow-[0_0_15px_rgba(139,92,246,0.4)]'
                  : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {g}
            </Link>
          );
        })}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {animeList.map((anime) => (
          <AnimeCard key={anime.id} anime={anime} />
        ))}
      </div>
    </div>
  );
}
