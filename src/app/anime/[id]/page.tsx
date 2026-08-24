import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { AnimeResolver } from '@/lib/api/resolver';
import { FranchiseTree } from '@/components/anime/FranchiseTree';
import { EpisodeGrid } from '@/components/anime/EpisodeGrid';
import { TimecodeComments } from '@/components/player/TimecodeComments';
import { AnimeHeroActions } from '@/components/anime/AnimeHeroActions';
import { SynopsisClamp } from '@/components/anime/SynopsisClamp';
import { getRussianGenre } from '@/components/catalog/catalog-data';
import { ensureRussianTitle } from '@/lib/api/russian-titles';
import {
  Star,
  Calendar,
  Tv,
  Clock,
  Film,
  Sparkles,
  ArrowLeft,
  Flame,
  Radio,
  Layers,
  CheckCircle2,
  AlertCircle,
  Hash,
} from 'lucide-react';

interface AnimeDetailsProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: AnimeDetailsProps): Promise<Metadata> {
  const { id } = await params;
  const animeId = parseInt(id, 10);
  if (isNaN(animeId)) return { title: 'Аниме не найдено' };

  const anime = await AnimeResolver.getDetails(animeId);
  if (!anime) return { title: 'Аниме не найдено' };

  const title = (anime.title.russian && /[а-яё]/i.test(anime.title.russian))
    ? anime.title.russian
    : ensureRussianTitle(anime);
  const rawDescription = anime.synopsisRu || anime.synopsisEn || 'Смотрите аниме онлайн в отличном качестве 1080p на KuroNami.';
  const description = rawDescription.replace(/<[^>]+>/g, '').slice(0, 160) + '...';
  const ogImage = anime.bannerImage || anime.coverImage.original;

  return {
    title: `${title} — Смотреть онлайн`,
    description,
    alternates: {
      canonical: `/anime/${animeId}`,
    },
    openGraph: {
      title: `${title} — KuroNami`,
      description,
      type: anime.format === 'MOVIE' ? 'video.movie' : 'video.tv_show',
      url: `/anime/${animeId}`,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} — KuroNami`,
      description,
      images: ogImage ? [ogImage] : [],
    },
  };
}

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

  const title = (anime.title.russian && /[а-яё]/i.test(anime.title.russian))
    ? anime.title.russian
    : ensureRussianTitle(anime);
  const subTitle = anime.title.english && anime.title.english !== title ? anime.title.english : anime.title.romaji;
  const nativeTitle = anime.title.native;
  const episodesCount = anime.episodes?.length || anime.episodesTotal || (anime.episodesAired ? Math.max(anime.episodesAired, 12) : 12);

  // Formatting helpers
  const formatSeason = (season?: string | null, year?: number | null) => {
    if (!season && !year) return null;
    const seasonMap: Record<string, string> = {
      WINTER: 'Зима',
      SPRING: 'Весна',
      SUMMER: 'Лето',
      FALL: 'Осень',
    };
    const sName = season ? seasonMap[season] || season : '';
    return [sName, year].filter(Boolean).join(' ');
  };

  const formatTypeLabel: Record<string, string> = {
    TV: 'ТВ Сериал',
    MOVIE: 'Фильм',
    OVA: 'OVA',
    ONA: 'ONA',
    SPECIAL: 'Спешл',
  };

  const formatType = formatTypeLabel[anime.format] || anime.format || 'ТВ Сериал';

  const statusLabel: Record<string, { label: string; color: string; border: string; bg: string }> = {
    RELEASING: {
      label: 'Онгоинг',
      color: 'text-zinc-300',
      border: 'border-zinc-700',
      bg: 'bg-zinc-800',
    },
    FINISHED: {
      label: 'Вышел',
      color: 'text-zinc-300',
      border: 'border-zinc-700',
      bg: 'bg-zinc-800',
    },
    NOT_YET_RELEASED: {
      label: 'Анонс',
      color: 'text-zinc-300',
      border: 'border-zinc-700',
      bg: 'bg-zinc-800',
    },
  };

  const currentStatus = statusLabel[anime.status] || statusLabel.FINISHED;
  const seasonString = formatSeason(anime.season, anime.seasonYear);
  const studioName = anime.studios && anime.studios.length > 0 ? anime.studios.join(', ') : 'Не указана';
  const ratingValue = anime.score > 0 ? anime.score.toFixed(1) : '—';
  const durationStr = anime.durationMinutes ? `${anime.durationMinutes} мин / сер` : '24 мин / сер';
  const bannerBg = anime.bannerImage || anime.coverImage.original;

  // Schema.org JSON-LD Structured Data
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
    : 'https://kuronami.app';
  const cleanSynopsis = (anime.synopsisRu || anime.synopsisEn || 'Смотрите аниме онлайн в 1080p качестве на KuroNami.').replace(/<[^>]+>/g, '');
  const isMovie = anime.format === 'MOVIE';

  const breadcrumbJsonLd = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Главная',
        item: `${siteUrl}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Каталог',
        item: `${siteUrl}/catalog`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: title,
        item: `${siteUrl}/anime/${anime.id}`,
      },
    ],
  };

  const mainEntityJsonLd = {
    '@type': isMovie ? 'Movie' : 'TVSeries',
    '@id': `${siteUrl}/anime/${anime.id}#schema`,
    url: `${siteUrl}/anime/${anime.id}`,
    name: title,
    alternateName: [subTitle, nativeTitle, ...(anime.synonyms || [])].filter(Boolean),
    description: cleanSynopsis,
    image: [bannerBg, anime.coverImage?.original, anime.coverImage?.medium].filter(Boolean),
    genre: anime.genres && anime.genres.length > 0 ? anime.genres : ['Аниме'],
    inLanguage: ['ja', 'ru'],
    ...(anime.seasonYear ? { dateCreated: `${anime.seasonYear}`, startDate: `${anime.seasonYear}` } : {}),
    ...(anime.durationMinutes ? { duration: `PT${anime.durationMinutes}M` } : {}),
    productionCompany: (anime.studios || []).map((studio) => ({
      '@type': 'Organization',
      name: studio,
    })),
    ...(anime.score > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: anime.score.toFixed(1),
            bestRating: '10',
            worstRating: '1',
            ratingCount: Math.max(anime.popularity || 1, 100),
          },
        }
      : {}),
    ...(!isMovie
      ? {
          numberOfEpisodes: episodesCount,
          numberOfSeasons: 1,
          containsSeason: {
            '@type': 'TVSeason',
            name: title,
            numberOfEpisodes: episodesCount,
            episode:
              anime.episodes && anime.episodes.length > 0
                ? anime.episodes.slice(0, 50).map((ep) => ({
                    '@type': 'TVEpisode',
                    episodeNumber: ep.episodeNumber,
                    name: ep.title || `${title} — Серия ${ep.episodeNumber}`,
                    url: `${siteUrl}/watch/${anime.id}/${ep.episodeNumber}`,
                  }))
                : Array.from({ length: Math.min(episodesCount, 24) }, (_, i) => ({
                    '@type': 'TVEpisode',
                    episodeNumber: i + 1,
                    name: `${title} — Серия ${i + 1}`,
                    url: `${siteUrl}/watch/${anime.id}/${i + 1}`,
                  })),
          },
        }
      : {}),
    potentialAction: {
      '@type': 'WatchAction',
      target: `${siteUrl}/watch/${anime.id}/1`,
    },
  };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [breadcrumbJsonLd, mainEntityJsonLd],
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Schema.org JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 0. Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
        <Link href="/catalog" className="flex items-center gap-1.5 hover:text-white transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Каталог</span>
        </Link>
        <span>/</span>
        <span className="text-zinc-200 font-semibold truncate max-w-xs sm:max-w-md">{title}</span>
      </div>

      {/* 1. Luxury Ambient Blurred Backdrop Banner & Hero Header */}
      <div className="relative z-20 w-full rounded-lg bg-zinc-900 border border-zinc-800 shadow-sm">
        {/* High-res Banner Layer */}
        {bannerBg && (
          <div className="absolute inset-0 rounded-lg overflow-hidden opacity-40 mix-blend-screen pointer-events-none">
            <Image
              src={bannerBg}
              alt={title}
              fill
              priority
              className="object-cover object-top"
            />
          </div>
        )}

        

        {/* Hero Content Section */}
        <div className="relative z-10 p-6 sm:p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start">
          {/* Poster Column */}
          <div className="flex flex-col items-center gap-4 flex-shrink-0 w-full sm:w-64 md:w-64">
            <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden shadow-sm border border border-zinc-800 bg-zinc-900 group">
              {anime.coverImage.original && (
                <Image
                  src={anime.coverImage.original}
                  alt={title}
                  fill
                  priority
                  sizes="(max-width: 640px) 100vw, 256px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}

              {/* Status Badge on Poster */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                <span
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider backdrop-blur-md border ${currentStatus.bg} ${currentStatus.color} ${currentStatus.border} shadow-lg`}
                >
                  {currentStatus.label}
                </span>
              </div>

              {/* Rating Badge on Poster */}
              {anime.score > 0 && (
                <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono font-bold text-xs shadow-lg">
                  <Star className="w-3.5 h-3.5 fill-zinc-300 text-zinc-300" />
                  <span>{ratingValue}</span>
                </div>
              )}

              {/* Quality Watermark */}
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border-zinc-800 text-[10px] font-mono text-zinc-300">
                <span className="font-bold text-white">1080p FHD</span>
                <span className="text-zinc-400">Мульти-озвучка</span>
              </div>
            </div>
          </div>

          {/* Details Column */}
          <div className="flex-1 space-y-5">
            {/* Format & Status Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
                <Film className="w-3 h-3 text-zinc-300" />
                <span>{formatType}</span>
              </span>

              <span
                className={`px-3 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 border shadow-sm ${currentStatus.bg} ${currentStatus.color} ${currentStatus.border}`}
              >
                {anime.status === 'RELEASING' ? (
                  <Radio className="w-3 h-3 " />
                ) : (
                  <CheckCircle2 className="w-3 h-3" />
                )}
                <span>{currentStatus.label}</span>
              </span>

              {anime.popularity > 0 && (
                <span className="px-3 py-1 rounded-lg bg-zinc-800 text-zinc-300 border border-zinc-700 text-xs font-mono flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-zinc-300" />
                  <span>Популярно #{anime.popularity}</span>
                </span>
              )}
            </div>

            {/* Title & Subtitles */}
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-sans text-white tracking-tight leading-tight">
                {title}
              </h1>

              {subTitle && (
                <p className="text-xs sm:text-sm font-sans text-zinc-400 font-medium">
                  {subTitle}
                  {nativeTitle && nativeTitle !== subTitle && (
                    <span className="text-zinc-500 ml-2 font-normal">({nativeTitle})</span>
                  )}
                </p>
              )}
            </div>

            {/* Glassmorphic Meta Stats Panel (Year, Studio, Episodes, Duration, Rating) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-1">
              {/* Rating Metric */}
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all flex flex-col justify-between">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Star className="w-3 h-3 text-zinc-300" />
                  Рейтинг
                </span>
                <span className="text-sm font-bold font-mono text-white mt-1">
                  {ratingValue} <span className="text-[10px] text-zinc-500">/ 10</span>
                </span>
              </div>

              {/* Year & Season Metric */}
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all flex flex-col justify-between">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-zinc-300" />
                  Сезон / Год
                </span>
                <span className="text-xs font-bold font-mono text-zinc-200 mt-1 truncate">
                  {seasonString || (anime.seasonYear ? `${anime.seasonYear} год` : 'Неизвестно')}
                </span>
              </div>

              {/* Episodes Metric */}
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all flex flex-col justify-between">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3 h-3 text-zinc-300" />
                  Эпизоды
                </span>
                <span className="text-xs font-bold font-mono text-white mt-1">
                  {anime.episodesAired ? `${anime.episodesAired} из ` : ''}
                  {episodesCount} эп.
                </span>
              </div>

              {/* Duration Metric */}
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all flex flex-col justify-between">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3 h-3 text-zinc-300" />
                  Длительность
                </span>
                <span className="text-xs font-bold font-mono text-zinc-200 mt-1 truncate">
                  {durationStr}
                </span>
              </div>

              {/* Studio Metric */}
              <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all flex flex-col justify-between col-span-2 sm:col-span-1">
                <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1">
                  <Tv className="w-3 h-3 text-zinc-300" />
                  Студия
                </span>
                <span className="text-xs font-bold font-mono text-zinc-200 mt-1 truncate" title={studioName}>
                  {studioName}
                </span>
              </div>
            </div>

            {/* Genre Pill Tags */}
            {anime.genres && anime.genres.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">Жанры:</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {anime.genres.map((g) => (
                    <Link
                      key={g}
                      href={`/catalog?genre=${encodeURIComponent(g)}`}
                      className="px-3 py-1 rounded-lg bg-zinc-800 hover:bg-indigo-500/20 text-zinc-300 hover:text-white border-zinc-800 hover:border-indigo-500/40 text-xs font-sans transition-all duration-200 shadow-sm"
                    >
                      {getRussianGenre(g)}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Synopsis with Clamp */}
            <div className="pt-1">
              <SynopsisClamp synopsisRu={anime.synopsisRu} synopsisEn={anime.synopsisEn} />
            </div>

            {/* Next Airing Episode Banner if Releasing */}
            {anime.nextAiringEpisode && (
              <div className="p-3.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center gap-3 text-xs font-mono text-white">
                <Radio className="w-4 h-4 text-zinc-300  flex-shrink-0" />
                <div>
                  <strong>Следующая {anime.nextAiringEpisode.episode} серия</strong> выйдет{' '}
                  <span className="text-white font-semibold">
                    {new Date(anime.nextAiringEpisode.airingAt * 1000).toLocaleDateString('ru-RU', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            )}

            {/* Unreleased Anime Notice */}
            {anime.status === 'NOT_YET_RELEASED' && (
              <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-xs font-mono text-white">
                <AlertCircle className="w-4 h-4 text-zinc-300 flex-shrink-0" />
                <span>
                  Тайтл находится в статусе «Анонс». Серии станут доступны сразу после официальной премьеры.
                </span>
              </div>
            )}

            {/* Quick Actions Bar (Watch / Resume + Quick Bookmark Selector + Collection + Share) */}
            <AnimeHeroActions
              animeId={anime.id}
              totalEpisodes={episodesCount}
              animeTitle={title}
              animeCover={anime.coverImage.original}
              animeFormat={formatType}
              animeScore={anime.score}
            />
          </div>
        </div>
      </div>

      {/* 2. Episode Selection Section (EpisodeGrid) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-zinc-300">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-sans text-white">Список серий</h2>
              <p className="text-xs font-mono text-zinc-400">Всего доступно {episodesCount} эпизодов</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-white/[0.05] border-zinc-800 text-xs font-mono text-zinc-300">
            1080p / 720p
          </span>
        </div>

        <div className="p-6 rounded-lg bg-zinc-900 border border-zinc-800 shadow-sm">
          <EpisodeGrid animeId={anime.id} totalEpisodes={episodesCount} />
        </div>
      </section>

      {/* 3. Franchise Timeline Tree Section */}
      {anime.relations && anime.relations.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20 text-zinc-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-sans text-white">Хронология франшизы</h2>
              <p className="text-xs font-mono text-zinc-400">Связанные сезоны, фильмы и ответвления</p>
            </div>
          </div>

          <FranchiseTree
            currentAnimeId={anime.id}
            relations={anime.relations}
            currentAnime={anime}
          />
        </section>
      )}

      {/* 4. Timecode Comments Section */}
      <section className="space-y-4">
        <TimecodeComments animeId={anime.id} episodeId={`${anime.id}-1`} />
      </section>
    </div>
  );
}
