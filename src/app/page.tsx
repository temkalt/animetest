import React from 'react';
import { AnimeResolver } from '@/lib/api/resolver';
import { HeroShowcase } from '@/components/home/HeroShowcase';
import { CategoryPills } from '@/components/home/CategoryPills';
import { RankedTopList } from '@/components/home/RankedTopList';
import { OngoingSchedule } from '@/components/home/OngoingSchedule';
import { CuratedSpotlight } from '@/components/home/CuratedSpotlight';
import { AnimeCard } from '@/components/anime/AnimeCard';
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.25)]">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white">
                  Популярные онгоинги сезона
                </h2>
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-mono font-bold">
                  <Radio className="w-3 h-3 animate-pulse text-rose-400" />
                  В ЭФИРЕ
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans">
                Свежие серии текущего сезона, выходящие прямо сейчас
              </p>
            </div>
          </div>

          <Link
            href="/catalog?status=RELEASING"
            className="flex items-center gap-1.5 text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-colors group self-start sm:self-auto bg-white/[0.03] hover:bg-white/[0.08] px-3 py-1.5 rounded-xl border border-white/[0.06]"
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight text-white">
                  Культовые шедевры всех времён
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono font-bold">
                  SCORE 9.0+
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-sans">
                Легендарные законченные сериалы и франшизы с наивысшим признанием
              </p>
            </div>
          </div>

          <Link
            href="/catalog?sort=SCORE_DESC"
            className="flex items-center gap-1.5 text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-colors group self-start sm:self-auto bg-white/[0.03] hover:bg-white/[0.08] px-3 py-1.5 rounded-xl border border-white/[0.06]"
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
    </div>
  );
}
