import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Zap, Heart, Terminal, Layers } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#06070A] border-t border-white/[0.06] py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Description */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-indigo-500 to-cyan-500 flex items-center justify-center font-mono font-bold text-white text-xs shadow-md shadow-indigo-500/20">
                KN
              </div>
              <span className="text-base font-bold font-display tracking-wider text-white">KURONAMI</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed font-sans">
              Премиальная стриминговая платформа аниме нового поколения: честное воспроизведение 1080p, мульти-балансеры, синхронизация закладок и чистый интерфейс.
            </p>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200 mb-3">Навигация</h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li><Link href="/catalog" className="hover:text-indigo-400 transition-colors">Полный каталог</Link></li>
              <li><Link href="/catalog?status=RELEASING" className="hover:text-indigo-400 transition-colors">Онгоинги сезона</Link></li>
              <li><Link href="/collections" className="hover:text-indigo-400 transition-colors">Тематические коллекции</Link></li>
              <li><Link href="/profile" className="hover:text-indigo-400 transition-colors">Личный кабинет</Link></li>
            </ul>
          </div>

          {/* Infrastructure & Status */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200 mb-3">Инфраструктура</h4>
            <ul className="space-y-2 text-xs text-zinc-400 font-mono">
              <li className="flex items-center gap-1.5 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Zero-Ad Shield Active</span>
              </li>
              <li className="flex items-center gap-1.5 text-cyan-400">
                <Zap className="w-3.5 h-3.5" />
                <span>Edge Caching &lt; 20ms</span>
              </li>
              <li className="flex items-center gap-1.5 text-indigo-400">
                <Terminal className="w-3.5 h-3.5" />
                <span>Local-First Dexie.js v4</span>
              </li>
            </ul>
          </div>

          {/* Legal Disclaimer */}
          <div>
            <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-200 mb-3">Дисклеймер</h4>
            <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
              Сервис является поисковым агрегатором метаданных и плееров из открытых API. Все материалы принадлежат их правообладателям.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 font-mono">
          <div>© {new Date().getFullYear()} KuroNami Nexus. All rights reserved.</div>
          <div className="flex items-center gap-1.5">
            <span>Powered by Next.js 15 & HLS Streaming</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline ml-1" />
          </div>
        </div>
      </div>
    </footer>
  );
};
