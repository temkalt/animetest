import React from 'react';
import { AnimeResolver } from '@/lib/api/resolver';
import { HeroShowcase } from '@/components/home/HeroShowcase';
import { OngoingSchedule } from '@/components/home/OngoingSchedule';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { Sparkles, Flame, Trophy, ShieldCheck, Zap, Layers } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 3600; // ISR 1 hour

export default async function HomePage() {
  // Fetch popular anime and real airing schedule from AniList/Shikimori
  const [trendingList, scheduleData] = await Promise.all([
    AnimeResolver.getPopular(1, 16),
    AnimeResolver.getAiringSchedule(),
  ]);
  const heroItems = trendingList.slice(0, 5);
  const ongoingItems = trendingList.slice(0, 8);
  const topRatedItems = trendingList.slice(8, 16);

  return (
    <div className="space-y-12">
      {/* 1. Cinematic Hero Showcase */}
      <HeroShowcase items={heroItems} />

      {/* 2. Interactive Ongoing Schedule */}
      <OngoingSchedule scheduleData={scheduleData} />

      {/* 3. Trending On-Air Releases */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Flame className="w-5 h-5 text-rose-500" />
            <h2 className="text-xl font-bold font-display tracking-tight text-white">
              Популярные онгоинги сезона
            </h2>
          </div>
          <Link
            href="/catalog?status=RELEASING"
            className="text-xs font-mono text-violet-400 hover:text-violet-300 transition-colors"
          >
            Смотреть все →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {ongoingItems.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </section>

      {/* 4. Top Rated Masterpieces */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold font-display tracking-tight text-white">
              Культовые шедевры
            </h2>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-mono text-violet-400 hover:text-violet-300 transition-colors"
          >
            В каталог →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {topRatedItems.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </section>

      {/* 5. Bento Grid Features Architecture */}
      <section className="p-8 rounded-3xl bg-[#0E1017] border border-white/5 space-y-6">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-mono">
            <Zap className="w-3.5 h-3.5" />
            <span>ИНЖЕНЕРИЯ СТРИМИНГА</span>
          </div>
          <h3 className="text-2xl font-bold font-display text-white">
            Создано фанатами. Без компромиссов.
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed font-sans">
            Передовые технологии веб-плеера и граничных серверов Vercel Edge для максимального погружения в просмотр.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#141722] border border-white/5 space-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Zero-Ad Shield Layer</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Edge-прокси автоматически очищает манифесты HLS от рекламных вставок и всплывающих окон.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#141722] border border-white/5 space-y-2">
            <Zap className="w-6 h-6 text-cyan-400" />
            <h4 className="text-sm font-bold text-white">Smart Auto-Skip</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Автоматический пропуск опенингов и эндингов по точным таймкодам без ручной перемотки.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#141722] border border-white/5 space-y-2">
            <Layers className="w-6 h-6 text-violet-400" />
            <h4 className="text-sm font-bold text-white">Local-First IndexedDB</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Секунда просмотра сохраняется мгновенно в вашем браузере и синхронизируется в фоне.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
