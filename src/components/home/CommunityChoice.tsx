'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Users, Eye, Star, ArrowRight, Play, Sparkles, Tv } from 'lucide-react';
import { motion } from 'framer-motion';
import { userActivity, AnimeViewStat } from '@/lib/auth/user-activity';

export const CommunityChoice: React.FC = () => {
  const [mostWatched, setMostWatched] = useState<AnimeViewStat[]>([]);

  useEffect(() => {
    return userActivity.subscribe((stats) => {
      setMostWatched(stats);
    });
  }, []);

  return (
    <section aria-label="Выбор пользователей" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-bold font-sans tracking-tight text-white">
                Выбор пользователей
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700 text-[10px] font-mono font-bold">
                ТОП ПРОСМОТРОВ
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-sans">
              Тайтлы, которые чаще всего смотрят пользователи платформы прямо сейчас
            </p>
          </div>
        </div>

        <Link
          href="/catalog?sort=POPULARITY_DESC"
          className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 hover:text-zinc-100 transition-colors group self-start sm:self-auto bg-zinc-900 hover:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-800"
        >
          <span>В популярное</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {mostWatched.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-lg bg-zinc-900 border border-zinc-800 text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-200">Рейтинг просмотров формируется</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            Здесь появятся тайтлы, которые чаще всего смотрят пользователи KuroNami. Начните просмотр любой серии, чтобы сформировать рейтинг сообщества.
          </p>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white hover:bg-zinc-200 text-zinc-900 text-xs font-medium transition-colors"
          >
            <span>Перейти к просмотру в каталог</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-5"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { staggerChildren: 0.1 }
            }
          }}
        >
          {mostWatched.map((anime, index) => (
            <motion.div 
              key={anime.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
              }}
              whileHover={{ y: -3, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            >
              <Link
                href={`/anime/${anime.id}`}
                className="group block"
              >
                <div className="relative aspect-[3/4] w-full rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-all">
                  {anime.coverImage ? (
                    <Image
                      src={anime.coverImage}
                      alt={anime.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-zinc-800 flex flex-col items-center justify-center p-3 text-center gap-2">
                      <Tv className="w-6 h-6 text-zinc-600" />
                      <span className="text-zinc-500 text-xs font-semibold line-clamp-2">{anime.title}</span>
                    </div>
                  )}

                  {/* Top badges */}
                  <div className="absolute top-2 inset-x-2 flex items-center justify-between gap-1 z-10">
                    <motion.span 
                      initial={index < 2 ? { opacity: 0, scale: 0.8 } : false}
                      animate={index < 2 ? { opacity: 1, scale: 1 } : false}
                      transition={{ duration: 0.4, delay: 0.2 + index * 0.1, ease: 'easeOut' }}
                      className="px-1.5 py-0.5 rounded bg-zinc-900/90 backdrop-blur-sm text-[10px] font-mono font-bold text-zinc-200 border border-zinc-700"
                    >
                      #{index + 1}
                    </motion.span>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900/90 backdrop-blur-sm text-[10px] font-mono font-bold text-zinc-100 border border-zinc-700">
                      <Eye className="w-3 h-3 text-zinc-400" />
                      <span>{anime.viewsCount}</span>
                    </div>
                  </div>

                  {/* Bottom gradient & info */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-2.5 z-10 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {anime.format || 'TV'}
                      </span>
                      {anime.score && anime.score > 0 ? (
                        <span className="flex items-center gap-0.5 text-[10px] font-mono font-semibold text-amber-300">
                          <Star className="w-2.5 h-2.5 fill-amber-300" />
                          {anime.score.toFixed(1)}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="text-xs sm:text-sm font-semibold text-zinc-100 line-clamp-1 group-hover:text-white transition-colors">
                      {anime.title}
                    </h3>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </section>
  );
};
