import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnimeResolver } from '@/lib/api/resolver';
import { VideoPlayerView } from '@/components/player/VideoPlayerView';
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

  // Resolve active stream
  const currentEpItem = anime.episodes?.find((e) => e.episodeNumber === epNumber);
  const streamUrl = currentEpItem?.sources?.[0]?.streamUrl || 'https://cache.libria.fun/videos/media/ts/9542/1/1080/aa675e5f3fe5b528517d812182344011.m3u8';

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
          <span>• Серия {epNumber}</span>
        </div>
      </div>

      {/* Main Video Theater Canvas */}
      <div className="relative">
        <VideoPlayerView
          animeId={anime.id}
          episodeNumber={epNumber}
          url={streamUrl}
          title={`${title} — Серия ${epNumber}`}
          poster={anime.bannerImage || anime.coverImage.original}
          timecodes={currentEpItem?.timecodes}
        />
      </div>

      {/* Under-Player Controls & Voiceover Selector */}
      <div className="p-4 sm:p-6 rounded-3xl bg-[#0E1017] border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Navigation & Voiceover Badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-[#141722] border border-white/5">
            <span className="text-xs font-mono text-slate-400 px-2 flex items-center gap-1">
              <Volume2 className="w-3.5 h-3.5 text-violet-400" />
              <span>Озвучка:</span>
            </span>
            <button className="px-3 py-1 rounded-lg bg-violet-600 text-white text-xs font-mono font-bold shadow-[0_0_10px_rgba(139,92,246,0.4)]">
              AniLibria (FHD)
            </button>
            <button className="px-3 py-1 rounded-lg hover:bg-white/5 text-slate-400 text-xs font-mono">
              Оригинал + Sub
            </button>
          </div>

          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-mono">
            <ShieldCheck className="w-3 h-3" />
            <span>Ad-Shield Active</span>
          </div>
        </div>

        {/* Next / Prev Episode Steppers */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          {prevEp && (
            <Link
              href={`/watch/${anime.id}/${prevEp}`}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Серия {prevEp}</span>
            </Link>
          )}

          {nextEp && (
            <Link
              href={`/watch/${anime.id}/${nextEp}`}
              className="flex items-center gap-1 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-mono font-bold shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-colors"
            >
              <span>Серия {nextEp}</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Episode Strip */}
      <div className="p-4 rounded-2xl bg-[#0E1017] border border-white/5 space-y-2">
        <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">Все серии</h4>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {Array.from({ length: totalEpisodes }).map((_, i) => {
            const num = i + 1;
            const isCurrent = num === epNumber;
            return (
              <Link
                key={num}
                href={`/watch/${anime.id}/${num}`}
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-mono font-bold transition-all flex-shrink-0 ${
                  isCurrent
                    ? 'bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.5)] border border-violet-400'
                    : 'bg-[#141722] hover:bg-white/10 text-slate-300 border border-white/5'
                }`}
              >
                {num}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Timecode Comments for this Episode */}
      <TimecodeComments episodeId={`ep-${anime.id}-${epNumber}`} animeId={anime.id} />
    </div>
  );
}
