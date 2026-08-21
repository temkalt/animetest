import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Zap, Heart, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#040508] border-t border-white/5 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center font-mono font-bold text-white text-xs">
                KN
              </div>
              <span className="text-base font-bold font-display tracking-wider text-white">KURONAMI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Ультимативная стриминговая экосистема нового поколения. Бескомпромиссная защита от рекламы, прямое воспроизведение HLS 1080p, мульти-озвучки и локальный кэш.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-3">Навигация</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/catalog" className="hover:text-violet-400 transition-colors">Полный каталог</Link></li>
              <li><Link href="/catalog?status=RELEASING" className="hover:text-violet-400 transition-colors">Онгоинги сезона</Link></li>
              <li><Link href="/collections" className="hover:text-violet-400 transition-colors">Кураторские подборки</Link></li>
              <li><Link href="/profile" className="hover:text-violet-400 transition-colors">Личный кабинет</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-3">Инженерия & Edge</h4>
            <ul className="space-y-2 text-xs text-slate-400 font-mono">
              <li className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero-Ad Shield Active</span>
              </li>
              <li className="flex items-center gap-1.5 text-cyan-400">
                <Zap className="w-3.5 h-3.5" />
                <span>Edge Caching &lt; 25ms</span>
              </li>
              <li className="flex items-center gap-1.5 text-violet-400">
                <Terminal className="w-3.5 h-3.5" />
                <span>Local-First Dexie.js v4</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200 mb-3">Дисклеймер</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Все видеоматериалы агрегируются из открытых источников и API. Сервис не хранит видеофайлы на собственных серверах.
            </p>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
          <div>© {new Date().getFullYear()} KuroNami Nexus. Built for anime lovers.</div>
          <div className="flex items-center gap-1">
            <span>Powered by Next.js 15 & Neon Postgres</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};
