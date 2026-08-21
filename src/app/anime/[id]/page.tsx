import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnimeResolver } from '@/lib/api/resolver';
import { FranchiseTree } from '@/components/anime/FranchiseTree';
import { EpisodeGrid } from '@/components/anime/EpisodeGrid';
import { TimecodeComments } from '@/components/player/TimecodeComments';
import { Play, Star, Calendar, Tv, Film, Clock, Bookmark, Sparkles } from 'lucide-react';

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
      {/* 1. Backdrop Banner Header */}
      <div className="relative w-full rounded-3xl overflow-hidden bg-[#07080B] border border-white/10 p-6 sm:p-10">
        {/* Banner Blur Background */}
        {anime.bannerImage || anime.coverImage.original ? (
          <div className="absolute inset-0 -z-10 opacity-30 filter blur-xl scale-105">
            <Image
              src={anime.bannerImage || anime.coverImage.original}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        ) : null}

        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Poster */}
          <div className="relative w-48 sm:w-64 aspect-[3/4] rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl border border-white/15 bg-slate-900">
            {anime.coverImage.original && (
              <Image src={anime.coverImage.original} alt={title} fill priority className="object-cover" />
            )}
          </div>

          {/* Details Content */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30 text-xs font-mono font-bold">
                {anime.format}
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold">
                {anime.status}
              </span>
              <div className="flex items-center gap-1 text-amber-400 font-mono font-bold text-xs">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{anime.score.toFixed(1)} / 10</span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-white">
              {title}
            </h1>

            {anime.title.english && anime.title.english !== title && (
              <h2 className="text-sm font-sans text-slate-400">
                {anime.title.english}
              </h2>
            )}

            {/* Quick Meta Stats */}
            <div className="flex items-center gap-6 text-xs text-slate-300 font-mono flex-wrap py-2 border-y border-white/10">
              {anime.seasonYear && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{anime.season} {anime.seasonYear}</span>
                </div>
              )}
              {anime.studios.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <Tv className="w-3.5 h-3.5 text-violet-400" />
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

            {/* Synopsis */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-3xl">
              {anime.synopsisRu || anime.synopsisEn || 'Описание временно отсутствует.'}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <Link
                href={`/watch/${anime.id}/1`}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-display font-bold text-sm shadow-[0_0_25px_rgba(139,92,246,0.5)] transition-all transform hover:scale-105"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Смотреть онлайн (1 серия)</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Episode Grid Selector */}
      <section className="p-6 rounded-3xl bg-[#0E1017] border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold font-display text-white">Список серий</h3>
          <span className="text-xs font-mono text-slate-400">{episodesCount} серий</span>
        </div>

        <EpisodeGrid animeId={anime.id} totalEpisodes={episodesCount} />
      </section>

      {/* 3. Franchise Universe Tree */}
      {anime.relations && anime.relations.length > 0 && (
        <FranchiseTree currentAnimeId={anime.id} relations={anime.relations} />
      )}

      {/* 4. Episode Comments Stream */}
      <TimecodeComments episodeId={`anime-${anime.id}-general`} animeId={anime.id} />
    </div>
  );
}
