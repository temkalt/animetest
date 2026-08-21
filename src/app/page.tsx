import React from 'react';
import { AnimeResolver } from '@/lib/api/resolver';
import { HeroShowcase } from '@/components/home/HeroShowcase';
import { OngoingSchedule } from '@/components/home/OngoingSchedule';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { Flame, Trophy, ShieldCheck, Zap, ArrowRight, Layers, Smartphone, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export const revalidate = 3600; // ISR 1 hour

export default async function HomePage() {
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
            <div className="w-2 h-2 rounded-full bg-rose-500" />
            <h2 className="text-lg sm:text-xl font-bold font-display tracking-tight text-white">
              Популярные онгоинги сезона
            </h2>
          </div>
          <Link
            href="/catalog?status=RELEASING"
            className="flex items-center gap-1 text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-colors group"
          >
            <span>Смотреть все</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
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
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <h2 className="text-lg sm:text-xl font-bold font-display tracking-tight text-white">
              Культовые шедевры всех времён
            </h2>
          </div>
          <Link
            href="/catalog"
            className="flex items-center gap-1 text-xs font-mono text-indigo-400 hover:text-indigo-300 transition-colors group"
          >
            <span>В каталог</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {topRatedItems.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      </section>

      {/* 5. Bento Grid Features Architecture */}
      <section className="p-6 sm:p-10 rounded-3xl bg-[#0E1118] border border-white/[0.08] space-y-6 shadow-xl">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-mono font-semibold">
            <Zap className="w-3.5 h-3.5 text-indigo-400" />
            <span>ИНЖЕНЕРИЯ СТРИМИНГА</span>
          </div>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Создано фанатами. Без компромиссов.
          </h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
            Передовые технологии веб-плеера и граничных серверов для максимального качества картинки и моментальной загрузки серий.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#131722] border border-white/[0.06] space-y-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <h4 className="text-sm font-bold text-white">Zero-Ad Shield</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Чистое воспроизведение без всплывающих баннеров, кликандеров и навязчивых вставок.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#131722] border border-white/[0.06] space-y-2">
            <Layers className="w-6 h-6 text-indigo-400" />
            <h4 className="text-sm font-bold text-white">Мульти-балансеры HD</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Мгновенное переключение между AniLibria 1080p, Kodik, Alloha и Collaps прямо во время просмотра.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#131722] border border-white/[0.06] space-y-2">
            <RefreshCw className="w-6 h-6 text-cyan-400" />
            <h4 className="text-sm font-bold text-white">Локальный кэш Dexie.js</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              История просмотров, закладки и таймкоды сохраняются офлайн в вашем браузере.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
