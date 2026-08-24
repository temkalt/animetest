'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star } from 'lucide-react';
import { UnifiedAnime } from '@/types';
import { motion } from 'framer-motion';
import { ensureRussianTitle } from '@/lib/api/russian-titles';

interface AnimeCardProps {
  anime: UnifiedAnime;
  priority?: boolean;
  className?: string;
}

export const AnimeCard: React.FC<AnimeCardProps> = ({ anime, priority = false, className = '' }) => {
  const primaryTitle = (anime.title.russian && /[а-яё]/i.test(anime.title.russian))
    ? anime.title.russian
    : ensureRussianTitle({
        russian: anime.title.russian,
        english: anime.title.english,
        romaji: anime.title.romaji,
        id: anime.id,
        malId: anime.malId,
        slug: anime.slug,
      });

  const secondaryTitle = anime.title.romaji !== primaryTitle ? anime.title.romaji : (anime.title.english !== primaryTitle ? anime.title.english : null);

  const formatLabel = anime.format === 'TV' ? 'TV'
    : anime.format === 'MOVIE' ? 'Фильм'
    : anime.format === 'OVA' ? 'OVA'
    : anime.format === 'ONA' ? 'ONA'
    : anime.format === 'SPECIAL' ? 'Спешл'
    : anime.format || 'TV';

  return (
    <Link href={`/anime/${anime.id}`} prefetch={true} className={`group block ${className}`}>
      <motion.div 
        whileHover={{ y: -4, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 420, damping: 28, mass: 0.8 }}
        className='relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 transition-colors duration-200'
      >
        {/* Poster */}
        {anime.coverImage?.original ? (
          <Image
            src={anime.coverImage.original}
            alt={primaryTitle}
            fill
            sizes='(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw'
            priority={priority}
            className='object-cover group-hover:scale-105 transition-transform duration-500 ease-out'
          />
        ) : (
          <div className='absolute inset-0 bg-zinc-800 flex items-center justify-center'>
            <span className='text-zinc-600 text-sm'>Нет постера</span>
          </div>
        )}

        {/* Top badges */}
        <div className='absolute top-2 right-2 z-10'>
          {anime.score > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -4 }} 
              animate={{ opacity: 1, y: 0 }}
              className='flex items-center gap-1 px-1.5 py-0.5 rounded bg-zinc-900/80 backdrop-blur-sm text-xs font-medium text-zinc-100'
            >
              <Star className='w-3 h-3 fill-zinc-100 text-zinc-100' />
              {anime.score.toFixed(1)}
            </motion.div>
          )}
        </div>

        {/* Bottom gradient */}
        <div className='absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent' />

        {/* Bottom content */}
        <div className='absolute bottom-0 inset-x-0 p-2.5 z-10 space-y-1'>
          <div className='flex items-center gap-1.5 flex-wrap'>
            <motion.span 
              initial={{ opacity: 0, y: -4 }} 
              animate={{ opacity: 1, y: 0 }}
              className='px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700'
            >
              {formatLabel}
            </motion.span>
            {anime.episodesTotal && (
              <span className='text-[10px] text-zinc-400'>
                {anime.episodesTotal} эп.
              </span>
            )}
          </div>
          <h3 className='text-sm font-semibold text-zinc-100 line-clamp-1 group-hover:text-white transition-colors duration-150'>
            {primaryTitle}
          </h3>
          {secondaryTitle && (
            <p className='text-[11px] text-zinc-500 line-clamp-1'>{secondaryTitle}</p>
          )}
        </div>
      </motion.div>
    </Link>
  );
};
