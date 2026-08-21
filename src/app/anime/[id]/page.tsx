import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnimeResolver } from '@/lib/api/resolver';
import { FranchiseTree } from '@/components/anime/FranchiseTree';
import { EpisodeGrid } from '@/components/anime/EpisodeGrid';
import { TimecodeComments } from '@/components/player/TimecodeComments';
import { Play, Star, Calendar, Tv, Clock, Bookmark, Sparkles, Film, ArrowLeft } from 'lucide-react';

interface AnimeDetailsProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 3600;

export default async function AnimeDetailsPage({ params }: AnimeDetailsProps) {
  const { id } = await params;
  const animeId = parseInt(id, 10);

  if (isNaN(animeId)) {
    notFound();
  }

  const anime = await AnimeResolver.getDetails(animeId);
  if (!anime) {
    notFound();
  }

  const title = anime.title.russian || anime.title.english || anime.title.romaji;
  const episodesCount = anime.episodes?.length || anime.episodesTotal || 12;

  return (
    <div className="space-y-10">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
        <Link href="/catalog" className="flex items-center gap-1 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Каталог</span>
        </Link>
        <span>/</span>
        <span className="text-zinc-200 truncate">{title}</span>
      </div>

      {/* 1. Backdrop Banner Header */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-[#0E1118] border border-white/[0.08] p-6 sm:p-10 shadow-2xl">
        {/* Banner Blur Ambient Background */}
        {anime.bannerImage || anime.coverImage.original ? (
          <div className="absolute inset-0 -z-10 opacity-25 filter blur-2xl scale-110">
            <Image
              src={anime.bannerImage || anime.coverImage.original}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="flex flex-col md:flex-row gap-8 items-start relative z-10">
          {/* Poster */}
          <div className="relative w-48 sm:w-60 aspect-[3/4] rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl border border-white/[0.12] bg-zinc-900">
            {anime.coverImage.original && (
              <Image src={anime.coverImage.original} alt={title} fill priority className="object-cover" />
            )}
          </div>

          {/* Details Content */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-bold">
                {anime.format || 'TV'}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                {anime.status || 'FINISHED'}
              </span>
              {anime.score > 0 && (
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono font-bold text-xs">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{anime.score.toFixed(1)} / 10</span>
                </div>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-white tracking-tight">
              {title}
            </h1>

            {anime.title.english && anime.title.english !== title && (
              <h2 className="text-sm font-sans text-zinc-400">
                {anime.title.english}
              </h2>
            )}

            {/* Quick Meta Stats Grid */}
            <div className="flex items-center gap-6 text-xs text-zinc-300 font-mono flex-wrap py-3 border-y border-white/[0.08]">
              {anime.seasonYear && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{anime.season} {anime.seasonYear}</span>
                </div>
              )}
              {anime.studios && anime.studios.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{anime.studios.join(', ')}</span>
                </div>
              )}
              {anime.durationMinutes && (
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  <span>{anime.durationMinutes} мин / серия</span>
                </div>
              )}
            </div>

            {/* Genres List */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              {anime.genres.map((g) => (
                <Link
                  key={g}
                  href={`/catalog?genre=${encodeURIComponent(g)}`}
                  className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 border border-white/[0.08] text-xs font-sans transition-colors"
                >
                  {g}
                </Link>
              ))}
            </div>

            {/* Synopsis */}
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans pt-2">
              {anime.synopsisRu || anime.synopsisEn || 'Смотрите все серии в высоком качестве с выбором студий озвучки.'}
            </p>

            {/* Main Action Buttons */}
            <div className="flex items-center gap-3 pt-3">
              <Link
                href={`/watch/${anime.id}/1`}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-display font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Смотреть 1 серию</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Episode Selection Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Film className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold font-display text-white">Список серий ({episodesCount})</h2>
          </div>
        </div>

        <EpisodeGrid animeId={anime.id} totalEpisodes={episodesCount} />
      </section>

      {/* 3. Franchise Timeline Tree */}
      {anime.relations && anime.relations.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="text-xl font-bold font-display text-white">Хронология и связанные сезоны</h2>
          </div>
          <FranchiseTree currentAnimeId={anime.id} relations={anime.relations} />
        </section>
      )}

      {/* 4. Timecode Comments */}
      <section className="space-y-4">
        <TimecodeComments animeId={anime.id} episodeId={`${anime.id}-1`} />
      </section>
    </div>
  );
}
