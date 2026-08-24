import React from 'react';
import Link from 'next/link';
import { Compass, Home, Film } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center bg-zinc-900/60 border border-zinc-800/80 backdrop-blur-xl p-8 rounded-2xl shadow-2xl">
        <div className="w-16 h-16 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mx-auto mb-6">
          <Compass className="w-8 h-8 animate-pulse" />
        </div>

        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-300 to-cyan-400 mb-2">
          404
        </h1>
        <h2 className="text-xl font-bold text-zinc-100 mb-2">Страница не найдена</h2>
        <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
          Запрашиваемый тайтл, коллекция или страница была удалена либо никогда не существовала во вселенной KuroNami.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors shadow-lg shadow-violet-600/20"
          >
            <Home className="w-4 h-4" />
            На главную
          </Link>
          <Link
            href="/catalog"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium transition-colors border border-zinc-700/50"
          >
            <Film className="w-4 h-4" />
            Каталог аниме
          </Link>
        </div>
      </div>
    </div>
  );
}
