'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Zap,
  Terminal,
  Heart,
  ArrowUp,
  Sparkles,
  Play,
  Film,
  Flame,
  Layers,
  User,
  Radio,
  Globe,
  Send,
  MessageSquare,
  Code2,
} from 'lucide-react';

interface NavColumn {
  title: string;
  icon: React.ElementType;
  badge?: string;
  links: {
    label: string;
    href: string;
    isExternal?: boolean;
    pill?: string;
  }[];
}

const NAV_COLUMNS: NavColumn[] = [
  {
    title: 'Каталог',
    icon: Film,
    links: [
      { label: 'Все аниме', href: '/catalog' },
      { label: 'Топ по рейтингу', href: '/catalog?sort=SCORE_DESC', pill: 'TOP' },
      { label: 'Полнометражные фильмы', href: '/catalog?format=MOVIE' },
      { label: 'Новинки каталога', href: '/catalog?sort=START_DATE_DESC' },
      { label: 'Жанровый фильтр', href: '/catalog' },
    ],
  },
  {
    title: 'Онгоинги',
    icon: Flame,
    badge: 'LIVE',
    links: [
      { label: 'Релизы сезона', href: '/catalog?status=RELEASING', pill: 'NEW' },
      { label: 'Расписание выхода серий', href: '/' },
      { label: 'Тренды недели', href: '/catalog?sort=POPULARITY_DESC' },
      { label: 'Анонсы и будущие сезоны', href: '/catalog?status=NOT_YET_RELEASED' },
      { label: 'Завершенные шедевры', href: '/catalog?status=FINISHED' },
    ],
  },
  {
    title: 'Коллекции',
    icon: Layers,
    links: [
      { label: 'Тематические подборки', href: '/collections', pill: 'HOT' },
      { label: 'Киберпанк и Sci-Fi', href: '/collections' },
      { label: 'Шедевры анимации', href: '/collections' },
      { label: 'Сёнены и Экшен', href: '/collections' },
      { label: 'Романтика и Драма', href: '/collections' },
    ],
  },
  {
    title: 'Личный кабинет',
    icon: User,
    links: [
      { label: 'Мой профиль и LVL', href: '/profile' },
      { label: 'История просмотров', href: '/profile' },
      { label: 'Закладки и избранное', href: '/profile', pill: 'SYNC' },
      { label: 'Авторизация в Nexus', href: '/auth/signin' },
      { label: 'Локальная база данных', href: '/profile' },
    ],
  },
];

const INFRASTRUCTURE_STATUS = [
  {
    name: 'Zero-Ad Shield',
    status: 'Active',
    description: '100% блокировка рекламы',
    icon: ShieldCheck,
    color: 'text-emerald-400',
    borderColor: 'hover:border-emerald-500/40',
    bgGlow: 'hover:bg-emerald-500/[0.04]',
    dotColor: 'bg-emerald-400',
    pulseColor: 'bg-emerald-500',
  },
  {
    name: 'Edge Caching',
    status: '< 20ms',
    description: 'Ультра-быстрая доставка видео',
    icon: Zap,
    color: 'text-cyan-400',
    borderColor: 'hover:border-cyan-500/40',
    bgGlow: 'hover:bg-cyan-500/[0.04]',
    dotColor: 'bg-cyan-400',
    pulseColor: 'bg-cyan-500',
  },
  {
    name: 'Dexie.js v4',
    status: 'Sync Ready',
    description: 'Local-First хранилище истории',
    icon: Terminal,
    color: 'text-indigo-400',
    borderColor: 'hover:border-indigo-500/40',
    bgGlow: 'hover:bg-indigo-500/[0.04]',
    dotColor: 'bg-indigo-400',
    pulseColor: 'bg-indigo-500',
  },
  {
    name: 'Multi-Source Hub',
    status: 'Operational',
    description: 'Автоматический выбор плеера',
    icon: Radio,
    color: 'text-rose-400',
    borderColor: 'hover:border-rose-500/40',
    bgGlow: 'hover:bg-rose-500/[0.04]',
    dotColor: 'bg-rose-400',
    pulseColor: 'bg-rose-500',
  },
];

const SOCIAL_LINKS = [
  {
    name: 'Telegram',
    href: 'https://t.me',
    icon: Send,
    tooltip: 'Telegram канал и комьюнити',
    color: 'hover:text-sky-400 hover:border-sky-500/40 hover:bg-sky-500/10',
  },
  {
    name: 'Discord',
    href: 'https://discord.gg',
    icon: MessageSquare,
    tooltip: 'Discord сервер и голосовые комнаты',
    color: 'hover:text-indigo-400 hover:border-indigo-500/40 hover:bg-indigo-500/10',
  },
  {
    name: 'GitHub',
    href: 'https://github.com',
    icon: Code2,
    tooltip: 'Исходный код и документация',
    color: 'hover:text-purple-400 hover:border-purple-500/40 hover:bg-purple-500/10',
  },
  {
    name: 'Nexus Net',
    href: '/',
    icon: Globe,
    tooltip: 'Зеркала и статус серверов',
    color: 'hover:text-cyan-400 hover:border-cyan-500/40 hover:bg-cyan-500/10',
  },
];

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative w-full bg-[#050609] border-t border-white/[0.08] mt-24 pt-16 pb-12 overflow-hidden select-none">
      {/* Background Ambient Glows */}
      <div
        aria-hidden="true"
        className="absolute -top-32 left-1/4 w-[500px] h-[300px] bg-indigo-600/[0.07] rounded-full blur-[120px] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -top-32 right-1/4 w-[500px] h-[300px] bg-cyan-500/[0.05] rounded-full blur-[120px] pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/50 via-cyan-400/50 to-transparent"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Live Infrastructure Telemetry Bar */}
        <section
          aria-label="Статус инфраструктуры"
          className="mb-14 p-5 sm:p-6 rounded-3xl bg-[#090C14]/80 border border-white/[0.08] backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-white/[0.06]">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-zinc-300">
                Nexus Infrastructure Telemetry // 2026.08
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>Все системы функционируют в штатном режиме</span>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {INFRASTRUCTURE_STATUS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.name}
                  className={`p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] ${item.borderColor} ${item.bgGlow} transition-all duration-300 group flex items-start gap-3`}
                >
                  <div
                    className={`p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] ${item.color} group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-xs font-bold text-zinc-200 font-sans truncate">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor}`} />
                        <span className={`text-[10px] font-mono font-bold ${item.color}`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-zinc-400 font-sans truncate mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Main Footer Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 mb-14">
          {/* Brand & Mission Statement (Spans 4 columns) */}
          <div className="lg:col-span-4 space-y-6">
            <Link href="/" className="inline-flex items-center gap-3.5 group">
              {/* Bespoke Geometric Logo Icon */}
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 p-[1px] shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/45 transition-all duration-300">
                <div className="w-full h-full bg-[#090C14] rounded-[15px] flex items-center justify-center overflow-hidden">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-5 h-5 transition-transform duration-500 group-hover:scale-110"
                    fill="none"
                  >
                    <path
                      d="M4 14C8 10 12 18 16 12C18 9 20 10 20 10"
                      stroke="url(#footer-logo-1)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M7 7L17 17M17 7L7 17"
                      stroke="url(#footer-logo-2)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      opacity="0.5"
                    />
                    <circle cx="17" cy="7" r="2.5" fill="#06B6D4" />
                    <defs>
                      <linearGradient
                        id="footer-logo-1"
                        x1="4"
                        y1="10"
                        x2="20"
                        y2="18"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#818CF8" />
                        <stop offset="1" stopColor="#06B6D4" />
                      </linearGradient>
                      <linearGradient
                        id="footer-logo-2"
                        x1="7"
                        y1="7"
                        x2="17"
                        y2="17"
                        gradientUnits="userSpaceOnUse"
                      >
                        <stop stopColor="#6366F1" />
                        <stop offset="1" stopColor="#EC4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Brand Wordmark with Glowing Cyan Dot */}
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg sm:text-xl font-black tracking-widest font-display text-white">
                    KURONAMI
                  </span>
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_#06B6D4]" />
                </div>
                <span className="text-[9px] font-mono tracking-[0.25em] text-indigo-400 uppercase -mt-0.5 font-bold">
                  NEXUS ANIME STREAMING
                </span>
              </div>
            </Link>

            {/* Mission Statement */}
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-sans pr-2">
              Премиальная стриминговая экосистема нового поколения. Честное воспроизведение 1080p без рекламы, децентрализованные балансеры источников, локальная синхронизация истории и сверхбыстрый отклик интерфейса.
            </p>

            {/* Social / Community Links */}
            <div className="space-y-3 pt-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">
                Сообщество & Каналы
              </span>
              <div className="flex items-center gap-2.5 flex-wrap">
                {SOCIAL_LINKS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={item.tooltip}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] text-xs text-zinc-400 ${item.color} transition-all duration-200 group`}
                    >
                      <Icon className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
                      <span className="font-sans font-medium">{item.name}</span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Structured Navigation Columns (Spans 8 columns, 4 equal sub-columns) */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-4">
            {NAV_COLUMNS.map((col) => {
              const ColumnIcon = col.icon;
              return (
                <div key={col.title} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <ColumnIcon className="w-3.5 h-3.5 text-indigo-400" />
                    <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200">
                      {col.title}
                    </h3>
                    {col.badge && (
                      <span className="px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[9px] font-mono font-bold leading-none">
                        {col.badge}
                      </span>
                    )}
                  </div>

                  <ul className="space-y-2.5 text-xs font-sans">
                    {col.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-zinc-400 hover:text-white transition-colors duration-150 inline-flex items-center gap-1.5 group"
                        >
                          <span className="w-1 h-1 rounded-full bg-zinc-600 group-hover:bg-indigo-400 group-hover:scale-125 transition-all" />
                          <span className="group-hover:translate-x-0.5 transition-transform">
                            {link.label}
                          </span>
                          {link.pill && (
                            <span className="px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 text-[9px] font-mono font-bold leading-tight">
                              {link.pill}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Bar: Badges, Legal Disclaimer & Back to Top */}
        <div className="pt-8 border-t border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright & Disclaimer */}
          <div className="space-y-1.5 text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs text-zinc-400 font-mono">
              <span className="text-zinc-300 font-semibold">
                © {new Date().getFullYear()} KuroNami Nexus.
              </span>
              <span>Все права защищены.</span>
              <span className="hidden sm:inline text-zinc-600">•</span>
              <span className="text-zinc-400">Next-Gen Anime Portal</span>
            </div>
            <p className="text-[11px] text-zinc-400 max-w-2xl font-sans leading-relaxed">
              Сервис является поисковым агрегатором метаданных и свободных видеопотоков из публичных API. Все материалы принадлежат их законным правообладателям.
            </p>
          </div>

          {/* Next.js 15 & HLS Streaming Tech Badges + Scroll to Top */}
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {/* Tech Badges */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-zinc-300 shadow-sm">
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Next.js 15</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-[11px] font-mono text-zinc-300 shadow-sm">
                <Play className="w-3 h-3 text-indigo-400 fill-indigo-400/40" />
                <span>HLS v7 Engine</span>
              </div>
            </div>

            {/* Back to Top Button */}
            <button
              type="button"
              onClick={scrollToTop}
              aria-label="Вернуться наверх страницы"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0E121E] hover:bg-[#161B2E] border border-white/[0.08] hover:border-indigo-500/40 text-xs font-mono text-zinc-300 hover:text-white transition-all duration-200 cursor-pointer shadow-md group active:scale-95"
            >
              <span>Наверх</span>
              <ArrowUp className="w-3.5 h-3.5 text-indigo-400 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
