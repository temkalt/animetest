'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';

const FOOTER_LINKS = [
  {
    title: 'Каталог',
    links: [
      { label: 'Все аниме', href: '/catalog' },
      { label: 'Топ по рейтингу', href: '/catalog?sort=SCORE_DESC' },
      { label: 'Онгоинги', href: '/catalog?status=RELEASING' },
      { label: 'Фильмы', href: '/catalog?format=MOVIE' },
    ],
  },
  {
    title: 'Сообщество',
    links: [
      { label: 'Коллекции', href: '/collections' },
      { label: 'Расписание', href: '/' },
      { label: 'Анонсы', href: '/catalog?status=NOT_YET_RELEASED' },
    ],
  },
  {
    title: 'Аккаунт',
    links: [
      { label: 'Профиль', href: '/profile' },
      { label: 'Войти', href: '/auth/signin' },
      { label: 'Регистрация', href: '/auth/signup' },
    ],
  },
];

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer className='border-t border-zinc-800 mt-16 pt-12 pb-24 md:pb-8'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        {/* Links grid */}
        <div className='grid grid-cols-2 sm:grid-cols-3 gap-8 mb-12'>
          {FOOTER_LINKS.map((col) => (
            <div key={col.title} className='space-y-3'>
              <h3 className='text-sm font-semibold text-zinc-100'>{col.title}</h3>
              <ul className='space-y-2'>
                {col.links.map((link) => (
                  <li key={link.label} className="group">
                    <Link href={link.href} className='inline-block text-sm text-zinc-400 group-hover:text-zinc-100 group-hover:translate-x-1 transition-all duration-150'>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className='flex items-center justify-between pt-8 border-t border-zinc-800'>
          <div className='space-y-1'>
            <p className='text-sm font-medium text-zinc-300'>KuroNami</p>
            <p className='text-xs text-zinc-500'>© {new Date().getFullYear()} Все права защищены. Аниме-портал.</p>
          </div>
          <motion.button
            type='button'
            onClick={scrollToTop}
            aria-label='Вернуться наверх'
            whileHover={{ y: -2, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className='p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-colors cursor-pointer'
          >
            <ArrowUp className='w-4 h-4' />
          </motion.button>
        </div>
      </div>
    </footer>
  );
};
