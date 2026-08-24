import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnimeResolver } from '@/lib/api/resolver';
import { ensureRussianTitle } from '@/lib/api/russian-titles';
import { VideoPlayerView } from '@/components/player/VideoPlayerView';
import { EpisodeGrid } from '@/components/anime/EpisodeGrid';
import { TimecodeComments } from '@/components/player/TimecodeComments';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Sparkles,
  Star,
  Film,
  Calendar,
  Clock,
  Tv,
  CheckCircle2,
  Share2,
  Layers,
  Flame,
} from 'lucide-react';

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

  if (isNaN(animeId) || isNaN(epNumber) || epNumber < 1) {
    notFound();
  }

  const anime = await AnimeResolver.getDetails(animeId);
  if (!anime) {
    notFound();
  }

  const title = (anime.title.russian && /[а-яё]/i.test(anime.title.russian))
    ? anime.title.russian
    : ensureRussianTitle(anime);
  const subTitle = anime.title.english && anime.title.english !== title ? anime.title.english : anime.title.romaji;
  const totalEpisodes = anime.episodes?.length || anime.episodesTotal || 12;

  // Resolve active stream and sources
  const currentEpItem = anime.episodes?.find((e) => e.episodeNumber === epNumber) || anime.episodes?.[0];
  const sources = currentEpItem?.sources || [];
  const streamUrl = sources[0]?.streamUrl || '';

  const prevEp = epNumber > 1 ? epNumber - 1 : null;
  const nextEp = epNumber < totalEpisodes ? epNumber + 1 : null;
  const progressPercent = Math.min(100, Math.round((epNumber / totalEpisodes) * 100));
  const verticalCover = anime.coverImage?.large || anime.coverImage?.original || anime.coverImage?.medium;
  const horizontalBanner = anime.bannerImage || anime.coverImage?.original;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-2 sm:px-4 pb-12">
      {/* 1. Header Deck: Breadcrumbs, Back Button & Episode Info Pill */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-lg bg-[#0E1118]/80  border border-zinc-800 shadow-sm">
        {/* Left: Back Link & Breadcrumbs */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href={`/anime/${anime.id}`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-300 hover:text-zinc-100 transition-all group shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5 text-zinc-400" />
            <span>Назад к тайтлу</span>
          </Link>

          <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

          {/* Breadcrumb Hierarchy */}
          <nav className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 flex-wrap">
            <Link href="/" className="hover:text-zinc-200 transition-colors">
              Главная
            </Link>
            <span className="text-zinc-600">/</span>
            <Link href="/catalog" className="hover:text-zinc-200 transition-colors">
              Каталог
            </Link>
            <span className="text-zinc-600">/</span>
            <Link
              href={`/anime/${anime.id}`}
              className="hover:text-zinc-200 transition-colors max-w-[200px] sm:max-w-[320px] truncate text-zinc-300 font-medium"
              title={title}
            >
              {title}
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-zinc-400 font-bold">Эпизод {epNumber}</span>
          </nav>
        </div>

        {/* Right: Episode Info Pill */}
        <div className="flex items-center gap-2 flex-wrap self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-mono">
            <div className="w-2 h-2 rounded-lg bg-zinc-800 " />
            <span className="font-semibold text-zinc-100">Серия {epNumber}</span>
            <span className="text-zinc-400">из {totalEpisodes}</span>
            {anime.format && (
              <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] text-zinc-200 font-bold uppercase">
                {anime.format}
              </span>
            )}
          </div>

          {anime.score > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-mono font-bold">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-zinc-400" />
              <span>{anime.score.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Unreleased Anime Warning Banner (if status is 'NOT_YET_RELEASED') */}
      {anime.status === 'NOT_YET_RELEASED' && (
        <div className="relative overflow-hidden p-5 sm:p-6 rounded-lg bg-zinc-800 border border-zinc-800 text-zinc-200 shadow-sm ">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-zinc-800 rounded-lg  pointer-events-none" />
          <div className="flex items-start gap-4 relative z-10">
            <div className="p-2.5 rounded-lg bg-zinc-800 border border-zinc-800 text-zinc-400 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold font-sans text-zinc-100">
                  Этот тайтл находится в статусе «Анонс» (ещё не вышел в эфир)
                </h3>
                <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-800 text-[11px] font-mono font-bold">
                  NOT_YET_RELEASED
                </span>
              </div>
              <p className="text-xs text-zinc-200/80 leading-relaxed font-sans">
                Официальная премьера ещё не состоялась. Видеоплеер и серии станут доступны автоматически после старта трансляции в Японии. Вы можете ознакомиться со связанными сезонами франшизы или добавить тайтл в список отслеживаемых.
              </p>
              {anime.relations && anime.relations.length > 0 && (
                <div className="pt-2">
                  <Link
                    href={`/anime/${anime.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-mono text-zinc-300 hover:text-zinc-100 underline underline-offset-4 transition-colors"
                  >
                    <span>Смотреть предыдущие сезоны в карточке тайтла</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Theater Canvas: VideoPlayerView with Ambient Backlight */}
      <div className="relative group">
        {/* Ambient Backlight Glow Effect */}
        <div className="absolute -inset-4 sm:-inset-6 bg-gradient-to-r from-indigo-600/25 via-purple-600/20 to-cyan-500/20 rounded-lg  opacity-50 -z-10 pointer-events-none transition-all duration-700 group-hover:opacity-75" />

        {/* Ambient Backdrop Poster Glow */}
        {horizontalBanner && (
          <div className="absolute -inset-3 sm:-inset-5 opacity-20 filter  -z-10 overflow-hidden rounded-lg pointer-events-none">
            <Image
              src={horizontalBanner}
              alt=""
              fill
              className="object-cover scale-110"
              priority={false}
            />
          </div>
        )}

        {/* Video Player Stage Frame */}
        <div className="relative rounded-lg overflow-hidden bg-[#0A0D14] border border-zinc-800  transition-all">
          <VideoPlayerView
            animeId={anime.id}
            shikimoriId={anime.shikimoriId}
            malId={anime.malId}
            kinopoiskId={anime.kinopoiskId}
            episodeNumber={epNumber}
            url={streamUrl}
            title={`${title} — Серия ${epNumber}`}
            russianTitle={anime.title.russian}
            englishTitle={anime.title.english}
            romajiTitle={anime.title.romaji}
            poster={horizontalBanner}
            coverImage={verticalCover}
            timecodes={currentEpItem?.timecodes}
            sources={sources}
          />
        </div>
      </div>

      {/* 4. Episode Navigation Deck: Prev/Next Steppers with Glowing Next CTA */}
      <div className="p-4 sm:p-5 rounded-lg bg-[#0E1118]/90 border border-zinc-800  shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Previous Episode Button */}
          <div className="w-full sm:w-auto">
            {prevEp ? (
              <Link
                href={`/watch/${anime.id}/${prevEp}`}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 hover:text-zinc-100 text-xs font-mono font-medium transition-all group cursor-pointer shadow-sm w-full sm:w-auto"
              >
                <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5 text-zinc-400" />
                <span>Предыдущая ({prevEp})</span>
              </Link>
            ) : (
              <div className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-800 border border-zinc-800 text-zinc-600 text-xs font-mono cursor-not-allowed select-none w-full sm:w-auto">
                <ChevronLeft className="w-4 h-4 text-zinc-700" />
                <span>Первая серия</span>
              </div>
            )}
          </div>

          {/* Episode Progress Indicator in Deck Center */}
          <div className="flex flex-col items-center gap-1.5 w-full sm:w-72">
            <div className="flex items-center justify-between w-full text-[11px] font-mono text-zinc-400">
              <span className="font-semibold text-zinc-200">Прогресс сезона:</span>
              <span className="text-zinc-300 font-bold">{progressPercent}%</span>
            </div>
            {/* Visual Progress Bar */}
            <div className="w-full h-1.5 rounded-lg bg-zinc-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-500 rounded-lg"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-zinc-500">
              Серия {epNumber} из {totalEpisodes}
            </span>
          </div>

          {/* Next Episode Glowing CTA Button */}
          <div className="w-full sm:w-auto">
            {nextEp ? (
              <Link
                href={`/watch/${anime.id}/${nextEp}`}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-zinc-100 text-xs font-mono font-bold  hover: transition-all transform hover:scale-[1.02] active:scale-[0.98] group cursor-pointer w-full sm:w-auto"
              >
                <span>Следующая серия ({nextEp})</span>
                <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ) : (
              <div className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-mono font-bold w-full sm:w-auto">
                <CheckCircle2 className="w-4 h-4 text-zinc-400" />
                <span>Финальная серия</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Quick Anime Theater Context Card */}
      <div className="p-6 rounded-lg bg-[#0E1118]/80 border border-zinc-800  shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-mono font-bold">
              {anime.format || 'TV'}
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-mono font-bold">
              {anime.status || 'FINISHED'}
            </span>
            {anime.seasonYear && (
              <span className="px-2.5 py-0.5 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-mono">
                {anime.season} {anime.seasonYear}
              </span>
            )}
          </div>

          <h2 className="text-xl sm:text-2xl font-bold font-sans text-zinc-100 tracking-tight">
            {title}
          </h2>

          {subTitle && (
            <p className="text-xs font-sans text-zinc-400">
              {subTitle}
            </p>
          )}

          {/* Genres Badges */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            {anime.genres?.map((g) => (
              <Link
                key={g}
                href={`/catalog?genre=${encodeURIComponent(g)}`}
                className="px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 text-[11px] font-sans transition-colors"
              >
                {g}
              </Link>
            ))}
          </div>
        </div>

        {/* Action Link to Full Details & Franchise */}
        <div className="flex items-center gap-3 w-full md:w-auto flex-shrink-0">
          <Link
            href={`/anime/${anime.id}`}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-800 border border-zinc-800 text-xs font-mono text-zinc-200 hover:text-zinc-100 transition-all w-full md:w-auto shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-zinc-400" />
            <span>Карточка и сезоны</span>
          </Link>
        </div>
      </div>

      {/* 6. Embedded EpisodeGrid Section */}
      <section className="p-6 rounded-lg bg-[#0E1118]/80 border border-zinc-800  shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <Film className="w-5 h-5 text-zinc-400" />
            <h3 className="text-base sm:text-lg font-bold font-sans text-zinc-100">
              Все доступные серии ({totalEpisodes})
            </h3>
          </div>
          <span className="text-xs font-mono text-zinc-400">
            Текущая серия: <strong className="text-zinc-400">#{epNumber}</strong>
          </span>
        </div>

        <EpisodeGrid animeId={anime.id} totalEpisodes={totalEpisodes} activeEpisode={epNumber} />
      </section>

        <TimecodeComments
          episodeId={`ep-${anime.id}-${epNumber}`}
          animeId={anime.id}
          animeTitle={title}
          animeCover={verticalCover || horizontalBanner || ''}
          episodeNumber={epNumber}
        />
    </div>
  );
}
