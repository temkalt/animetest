'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare } from 'lucide-react';
import { authStore } from '@/lib/auth/user-store';
import { GlobalComment } from '@/types';

export const RecentComments: React.FC = () => {
  const [comments, setComments] = useState<GlobalComment[]>([]);

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
        {comments.map((comment) => (
          <div
            key={comment.id}
            className='flex gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800'
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

              <p className={`text-sm text-zinc-300 line-clamp-2 ${comment.isSpoiler ? 'blur-sm hover:blur-none transition-all cursor-pointer' : ''}`}>
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
          </div>
        ))}
      </div>
    </section>
  );
};
