import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnimeResolver } from '@/lib/api/resolver';
import { VideoPlayerView } from '@/components/player/VideoPlayerView';
import { EpisodeGrid } from '@/components/anime/EpisodeGrid';
import { TimecodeComments } from '@/components/player/TimecodeComments';
import { ChevronLeft, ChevronRight, List, Volume2, ShieldCheck, ArrowLeft } from 'lucide-react';

interface WatchProps {
  params: Promise<{
    id: string;
    episode: string;
  }>;
}

export const revalidate = 1800;

export default async function WatchPage({ params }: WatchProps) {
  const { id, episode } = await params;
  const animeId = parseInt(id, 10);
  const epNumber = parseInt(episode, 10);

  if (isNaN(animeId) || isNaN(epNumber)) {
    notFound();
  }

  const anime = await AnimeResolver.getDetails(animeId);
  if (!anime) {
    notFound();
  }

  const title = anime.title.russian || anime.title.english || anime.title.romaji;
  const totalEpisodes = anime.episodes?.length || anime.episodesTotal || 12;

  // Resolve active stream and sources
  const currentEpItem = anime.episodes?.find((e) => e.episodeNumber === epNumber);
  const streamUrl = currentEpItem?.sources?.[0]?.streamUrl || '';

  const prevEp = epNumber > 1 ? epNumber - 1 : null;
  const nextEp = epNumber < totalEpisodes ? epNumber + 1 : null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400">
        <Link
          href={`/anime/${anime.id}`}
          className="flex items-center gap-1.5 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>К описанию тайтла</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-white font-bold">{title}</span>
          <span>• Серия {epNumber} из {totalEpisodes}</span>
        </div>
      </div>

      {/* Main Video Theater Canvas */}
      <div className="relative">
        <VideoPlayerView
          animeId={anime.id}
          shikimoriId={anime.shikimoriId}
          malId={anime.malId}
          episodeNumber={epNumber}
          url={streamUrl}
          title={`${title} — Серия ${epNumber}`}
          russianTitle={anime.title.russian}
          englishTitle={anime.title.english}
          romajiTitle={anime.title.romaji}
          poster={anime.bannerImage || anime.coverImage.original}
          timecodes={currentEpItem?.timecodes}
          sources={currentEpItem?.sources || []}
        />
      </div>

      {/* Next / Prev Episode Steppers */}
      <div className="p-4 rounded-3xl bg-[#0E1017] border border-white/5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Навигация по сериям:</span>
        </div>

        <div className="flex items-center gap-2">
          {prevEp && (
            <Link
              href={`/watch/${anime.id}/${prevEp}`}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Предыдущая ({prevEp})</span>
            </Link>
          )}

          {nextEp && (
            <Link
              href={`/watch/${anime.id}/${nextEp}`}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-mono font-bold shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-colors"
            >
              <span>Следующая ({nextEp})</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* All Episodes Browser with 50-chunk selector */}
      <div className="p-6 rounded-3xl bg-[#0E1017] border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold font-display text-white">Все доступные серии ({totalEpisodes})</h4>
        </div>
        <EpisodeGrid animeId={anime.id} totalEpisodes={totalEpisodes} activeEpisode={epNumber} />
      </div>

      {/* Timecode Comments for this Episode */}
      <TimecodeComments episodeId={`ep-${anime.id}-${epNumber}`} animeId={anime.id} />
    </div>
  );
}
