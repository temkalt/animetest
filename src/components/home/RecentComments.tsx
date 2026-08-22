'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { authStore } from '@/lib/auth/user-store';
import { GlobalComment } from '@/types';

export const RecentComments: React.FC = () => {
  const [comments, setComments] = useState<GlobalComment[]>([]);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(new Set());

  const toggleSpoiler = (id: string) => {
    setRevealedSpoilers(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  useEffect(() => {
    return authStore.subscribeComments((c) => setComments(c));
  }, []);

  if (comments.length === 0) return null;

  return (
    <section className='space-y-4'>
      <div className='flex items-center gap-2'>
        <MessageSquare className='w-4 h-4 text-zinc-400' />
        <h2 className='text-lg font-semibold text-zinc-100'>Последние комментарии</h2>
      </div>

      <div className='space-y-2'>
        <AnimatePresence initial={false}>
          {comments.map((comment, index) => {
            const isRevealed = revealedSpoilers.has(comment.id);
            return (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: -12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 }}
                className='flex gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/50 transition-colors'
              >
                {/* User avatar */}
                <Link href={`/user/${comment.username}`} className='shrink-0'>
                  <div className='w-8 h-8 rounded-full overflow-hidden bg-zinc-800'>
                    <Image
                      src={comment.userAvatar}
                      alt={comment.username}
                      width={32}
                      height={32}
                      className='object-cover w-full h-full'
                    />
                  </div>
                </Link>

                <div className='flex-1 min-w-0 space-y-1'>
                  <div className='flex items-center gap-2 text-xs'>
                    <Link
                      href={`/user/${comment.username}`}
                      className='font-medium text-zinc-200 hover:text-white transition-colors'
                    >
                      @{comment.username}
                    </Link>
                    <span className='text-zinc-600'>·</span>
                    <span className='text-zinc-500'>{comment.createdAt}</span>
                  </div>

                  <p 
                    onClick={() => comment.isSpoiler && toggleSpoiler(comment.id)}
                    className={`text-sm text-zinc-300 line-clamp-2 ${comment.isSpoiler ? (isRevealed ? '' : 'blur-sm hover:blur-[2px]') + ' transition-all duration-300 cursor-pointer' : ''}`}
                  >
                    {comment.content}
                  </p>

                  <Link
                    href={`/anime/${comment.animeId}`}
                    className='inline-flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors'
                  >
                    <div className='w-4 h-5 rounded-sm overflow-hidden bg-zinc-800 shrink-0'>
                      <Image
                        src={comment.animeCover}
                        alt={comment.animeTitle}
                        width={16}
                        height={20}
                        className='object-cover w-full h-full'
                      />
                    </div>
                    <span className='truncate'>{comment.animeTitle}</span>
                    {comment.episodeNumber && (
                      <span>· Серия {comment.episodeNumber}</span>
                    )}
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </section>
  );
};
