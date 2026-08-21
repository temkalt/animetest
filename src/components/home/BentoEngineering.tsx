'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Zap, 
  Database, 
  Activity, 
  Layers, 
  FastForward, 
  Headphones, 
  Cpu, 
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  Server,
  Lock
} from 'lucide-react';

export const BentoEngineering: React.FC = () => {
  return (
    <section className="w-full space-y-6 select-none">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-mono font-semibold">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="tracking-wider uppercase">АРХИТЕКТУРА И ИНЖЕНЕРИЯ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display tracking-tight text-white">
            Создано для искушённых зрителей
          </h2>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl font-sans">
            Передовые веб-технологии, граничные серверы и децентрализованные балансеры для бескомпромиссного качества.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 self-start sm:self-auto bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Все балансеры в сети: 99.98%</span>
        </div>
      </div>

      {/* Bento Grid Architecture */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* 1. Large Feature Card: Multi-Balancer HD (Spans 2 cols on lg) */}
        <div className="md:col-span-2 lg:col-span-2 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0C0F1A] via-[#090C14] to-[#06070A] border border-indigo-500/30 hover:border-indigo-500/60 shadow-[0_10px_40px_rgba(99,102,241,0.1)] transition-all duration-300 group flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono font-bold">
                HD 1080P ENGINE
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-bold font-display text-white group-hover:text-indigo-300 transition-colors">
                Мульти-балансеры & Агрегация потоков
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans">
                Интеллектуальный пробинг и динамическое переключение между провайдерами видео без перезагрузки плеера. AniLibria 1080p Direct HLS, Kodik, Alloha, Collaps, Turbo и Sibnet в едином интерфейсе.
              </p>
            </div>
          </div>

          {/* Mini Interactive Balancer Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 border-t border-white/[0.06]">
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
              <div className="text-[11px] font-mono font-bold text-indigo-300">AniLibria HLS</div>
              <div className="text-[10px] text-emerald-400 font-mono">1080p 60fps</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
              <div className="text-[11px] font-mono font-bold text-cyan-300">Kodik API</div>
              <div className="text-[10px] text-zinc-400 font-mono">10 000+ тайтлов</div>
            </div>
            <div className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-center">
              <div className="text-[11px] font-mono font-bold text-purple-300">Alloha & Collaps</div>
              <div className="text-[10px] text-zinc-400 font-mono">Full HD Дубляж</div>
            </div>
          </div>
        </div>

        {/* 2. Feature Card: Zero-Ad Shield (Spans 1 col) */}
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#0C151A] via-[#091014] to-[#06070A] border border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_10px_40px_rgba(16,185,129,0.1)] transition-all duration-300 group flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-mono font-bold">
                100% CLEAN
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold font-display text-white group-hover:text-emerald-300 transition-colors">
                Zero-Ad Shield
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                Никаких всплывающих окон, баннеров 1xBet, кликандеров и майнинга. Чистый видеопоток напрямую в HTML5 Canvas/Video.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 pt-2 border-t border-white/[0.06]">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>Блокировка 100% трекеров</span>
          </div>
        </div>

        {/* 3. Feature Card: Dexie.js Client Cache (Spans 1 col) */}
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#120D1C] via-[#0D0914] to-[#06070A] border border-purple-500/30 hover:border-purple-500/60 shadow-[0_10px_40px_rgba(168,85,247,0.1)] transition-all duration-300 group flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6" />
              </div>
              <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[11px] font-mono font-bold">
                LOCAL-FIRST
              </span>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg sm:text-xl font-bold font-display text-white group-hover:text-purple-300 transition-colors">
                Локальный кэш Dexie.js
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed font-sans">
                История просмотров, точные таймкоды серий и закладки сохраняются в локальную базу данных IndexedDB. Доступно офлайн.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-purple-300 pt-2 border-t border-white/[0.06]">
            <Lock className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <span>Приватность без авторизации</span>
          </div>
        </div>

        {/* 4. Feature Card: Edge Speed CDN */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#0C141C] via-[#080E14] to-[#06070A] border border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300 group flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-cyan-400">
              &lt; 20MS LATENCY
            </span>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-base font-bold font-display text-white group-hover:text-cyan-300 transition-colors">
              Edge Speed CDN
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Мгновенный старт видеопотока через распределённую сеть кэширующих серверов.
            </p>
          </div>
        </div>

        {/* 5. Feature Card: Auto-Skip OP/ED */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#1A0F14] via-[#120A0E] to-[#06070A] border border-rose-500/30 hover:border-rose-500/60 transition-all duration-300 group flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 group-hover:scale-110 transition-transform">
              <FastForward className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-mono font-bold text-rose-400">
              SMART TIMECODES
            </span>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-base font-bold font-display text-white group-hover:text-rose-300 transition-colors">
              Автопропуск OP / ED
            </h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Точные таймкоды опенингов и эндингов для непрерывного просмотра марафонов.
            </p>
          </div>
        </div>

        {/* 6. Feature Card: Multi-Studio Voiceover Hub (Spans 2 cols on md/lg) */}
        <div className="md:col-span-2 lg:col-span-2 p-6 rounded-3xl bg-gradient-to-br from-[#121624] via-[#0A0D17] to-[#06070A] border border-blue-500/30 hover:border-blue-500/60 transition-all duration-300 group flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400">
                <Headphones className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold font-display text-white group-hover:text-blue-300 transition-colors">
                Все топовые студии озвучки
              </h4>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
              AniLibria, Studio Band, Dream Cast, DEEP, Amber, SHIZA Project или оригинальная японская дорожка с субтитрами.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <span className="px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-zinc-300">
              Дубляж
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-zinc-300">
              Субтитры
            </span>
            <span className="px-2.5 py-1 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-zinc-300">
              RAW
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
