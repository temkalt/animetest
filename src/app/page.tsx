import React from 'react';
import { AnimeResolver } from '@/lib/api/resolver';
import { HeroShowcase } from '@/components/home/HeroShowcase';
import { CategoryPills } from '@/components/home/CategoryPills';
import { RankedTopList } from '@/components/home/RankedTopList';
import { OngoingSchedule } from '@/components/home/OngoingSchedule';
import { CuratedSpotlight } from '@/components/home/CuratedSpotlight';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { RecentComments } from '@/components/home/RecentComments';
import { 
  Flame, 
  Trophy, 
  ArrowRight, 
  Radio, 
  Sparkles, 
  Star,
  Film,
  Compass
} from 'lucide-react';
import Link from 'next/link';

export const revalidate = 3600; // ISR 1 hour

export default async function HomePage() {
  // Parallel fetch with resilient fallbacks
  const [
    trendingList,
    topRatedResult,
    ongoingResult,
    scheduleData,
  ] = await Promise.all([
    AnimeResolver.getPopular(1, 24).catch(() => []),
    AnimeResolver.searchCatalog({ sort: ['SCORE_DESC'], perPage: 16 }).catch(() => ({ items: [], pageInfo: { total: 0, currentPage: 1, lastPage: 1, hasNextPage: false } })),
    AnimeResolver.searchCatalog({ status: 'RELEASING', sort: ['POPULARITY_DESC'], perPage: 16 }).catch(() => ({ items: [], pageInfo: { total: 0, currentPage: 1, lastPage: 1, hasNextPage: false } })),
    AnimeResolver.getAiringSchedule().catch(() => ({})),
  ]);

  // Slices & fallback normalization
  const heroItems = trendingList.length > 0 ? trendingList.slice(0, 6) : ongoingResult.items.slice(0, 6);
  const rankedTrending = trendingList.length > 0 ? trendingList.slice(0, 10) : ongoingResult.items.slice(0, 10);
  const rankedTopRated = topRatedResult.items.length > 0 ? topRatedResult.items.slice(0, 10) : trendingList.slice(0, 10);
  const rankedPopular = trendingList.length > 0 ? trendingList.slice(0, 10) : ongoingResult.items.slice(0, 10);

  const seasonalOngoings = ongoingResult.items.length > 0 
    ? ongoingResult.items.slice(0, 8) 
    : trendingList.slice(0, 8);

  const cultMasterpieces = topRatedResult.items.length > 0 
    ? topRatedResult.items.slice(0, 8) 
    : trendingList.slice(8, 16);

  return (
    <div className="space-y-16 sm:space-y-20 pb-12">
      {/* 1. Cinematic Hero Showcase */}
      <section aria-label="Главные тренды аниме">
        <HeroShowcase items={heroItems} />
      </section>

      {/* 2. Quick Category Pills */}
      <section aria-label="Быстрый выбор категорий" className="-mt-6 sm:-mt-8">
        <CategoryPills />
      </section>

      {/* 3. Ranked Top List (#1 - #10) Trending Charts */}
      <section aria-label="Топ 10 чарты аниме" className="pt-2">
        <RankedTopList
          trendingItems={rankedTrending}
          topRatedItems={rankedTopRated}
          popularItems={rankedPopular}
        />
      </section>

      {/* 4. Interactive Ongoing Weekly Airing Schedule */}
      <section aria-label="Расписание выхода серий недели">
        <OngoingSchedule scheduleData={scheduleData} />
      </section>

      {/* 5. Popular Seasonal Ongoings Grid */}
      <section aria-label="Популярные онгоинги сезона" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <div className="flex items-center gap-3">
            <Flame className="w-5 h-5 text-zinc-400" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">
                Популярные онгоинги сезона
              </h2>
              <p className="text-xs text-zinc-400">
                Свежие серии текущего сезона, выходящие прямо сейчас
              </p>
            </div>
          </div>

          <Link
            href="/catalog?status=RELEASING"
            className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-zinc-100 transition-colors group self-start sm:self-auto px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800/50"
          >
            <span>Все онгоинги</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
          {seasonalOngoings.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </section>

      {/* 6. Curated Thematic Spotlight Banner */}
      <section aria-label="Кураторские подборки аниме">
        <CuratedSpotlight />
      </section>

      {/* 7. Cult Masterpieces of All Time Grid */}
      <section aria-label="Кураторские шедевры всех времён" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 text-zinc-400" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">
                Культовые шедевры всех времён
              </h2>
              <p className="text-xs text-zinc-400">
                Легендарные законченные сериалы и франшизы с наивысшим признанием
              </p>
            </div>
          </div>

          <Link
            href="/catalog?sort=SCORE_DESC"
            className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-zinc-100 transition-colors group self-start sm:self-auto px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800/50"
          >
            <span>В каталог шедевров</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5">
          {cultMasterpieces.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </section>

      {/* 8. Recent Community Comments */}
      <section aria-label="Последние комментарии сообщества">
        <RecentComments />
      </section>
    </div>
  );
}
