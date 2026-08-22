'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MessageSquare, Clock, Send, EyeOff, Heart } from 'lucide-react';
import { EpisodeComment } from '@/types';
import { authStore, DEFAULT_AVATARS } from '@/lib/auth/user-store';

interface TimecodeCommentsProps {
  episodeId: string;
  animeId: number;
  animeTitle?: string;
  animeCover?: string;
  episodeNumber?: number;
  currentVideoTime?: number;
  initialComments?: EpisodeComment[];
}

export const TimecodeComments: React.FC<TimecodeCommentsProps> = ({
  episodeId,
  animeId,
  animeTitle = 'Аниме',
  animeCover = '',
  episodeNumber = 1,
  currentVideoTime = 0,
  initialComments = [],
}) => {
  const storageKey = `kuronami_ep_comments_${animeId}_${episodeNumber}`;
  const [comments, setComments] = useState<EpisodeComment[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(storageKey) || localStorage.getItem(`kuronami_ep_comments_${episodeId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) return parsed;
        }
      } catch {}
    }
    return initialComments;
  });

  const [content, setContent] = useState('');
  const [attachTimecode, setAttachTimecode] = useState(false);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});

  // Sync across tabs & reloads
  useEffect(() => {
    const loadComments = () => {
      try {
        const saved = localStorage.getItem(storageKey) || localStorage.getItem(`kuronami_ep_comments_${episodeId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setComments(parsed);
          }
        }
      } catch {}
    };

    loadComments();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === storageKey || e.key === `kuronami_ep_comments_${episodeId}`) {
        loadComments();
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [storageKey, episodeId]);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const user = authStore.getUser();
    const resolvedUsername =
      user?.username ||
      (user?.name ? authStore.normalizeUsername(user.name) : '') ||
      'kuronami';
    const resolvedName = user?.name || user?.username || 'KuroNami';
    const resolvedAvatar = user?.avatar || DEFAULT_AVATARS[0];
    const resolvedUserId = user?.id || `usr_${Date.now()}`;

    const newComment: EpisodeComment = {
      id: `ep_comm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      episodeId,
      userId: resolvedUserId,
      userName: resolvedName,
      userAvatar: resolvedAvatar,
      content: content.trim(),
      timecodeSeconds: attachTimecode ? Math.floor(currentVideoTime) : null,
      isSpoiler,
      likesCount: 0,
      createdAt: 'Только что',
    };

    const updated = [newComment, ...comments];
    setComments(updated);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
        localStorage.setItem(`kuronami_ep_comments_${episodeId}`, JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving episode comments:', err);
      }
    }

    try {
      authStore.addGlobalComment({
        animeId,
        animeTitle,
        animeCover:
          animeCover ||
          'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg',
        episodeNumber,
        content: content.trim(),
        timecodeSeconds: attachTimecode ? Math.floor(currentVideoTime) : null,
        isSpoiler,
        author: {
          id: resolvedUserId,
          username: resolvedUsername,
          name: resolvedName,
          avatar: resolvedAvatar,
        },
      });
    } catch (err) {
      console.error('Error adding global comment:', err);
    }

    setContent('');
    setAttachTimecode(false);
    setIsSpoiler(false);
  };

  const toggleSpoiler = (id: string) => {
    setRevealedSpoilers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleLike = (id: string) => {
    setLikedComments((prev) => {
      const current = !!prev[id];
      const updated = comments.map((c) =>
        c.id === id ? { ...c, likesCount: c.likesCount + (current ? -1 : 1) } : c
      );
      setComments(updated);
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {}
      return { ...prev, [id]: !current };
    });
  };

  return (
    <div className="p-6 sm:p-8 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 flex items-center justify-center border border-zinc-800">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold font-sans text-zinc-100">Таймкод-комментарии</h3>
            <p className="text-xs text-zinc-400 font-sans">Обсуждайте яркие моменты серии в реальном времени</p>
          </div>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded-lg bg-zinc-800 border border-zinc-800 text-zinc-400">
          {comments.length} сообщений
        </span>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAddComment} className="p-4 sm:p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3 shadow-inner">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Поделитесь эмоциями от момента (нажмите таймкод для привязки)..."
          className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 text-xs font-sans focus:outline-none resize-none h-20 leading-relaxed"
        />

        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-zinc-800">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setAttachTimecode(!attachTimecode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                attachTimecode
                  ? 'bg-zinc-800 text-zinc-200 border border-zinc-700 shadow-sm'
                  : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 border border-zinc-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Таймкод: {formatSeconds(currentVideoTime)}</span>
            </button>

            <label className="flex items-center gap-2 text-xs text-zinc-400 hover:text-zinc-200 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isSpoiler}
                onChange={(e) => setIsSpoiler(e.target.checked)}
                className="rounded bg-zinc-800 border-zinc-700 text-zinc-400 focus:ring-0 cursor-pointer"
              />
              <span className={isSpoiler ? 'text-zinc-200 font-semibold' : ''}>Спойлер</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={!content.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-white hover:bg-zinc-200 disabled:opacity-40 text-zinc-900 rounded-lg text-xs font-bold font-sans shadow-sm transition-all cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Опубликовать</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      {comments.length === 0 ? (
        <div className="py-12 text-center text-xs text-zinc-500 font-mono space-y-2">
          <MessageSquare className="w-7 h-7 text-zinc-600 mx-auto" />
          <p>Будьте первым, кто оставит комментарий к этой серии!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => {
            const isRevealed = revealedSpoilers[c.id];
            const isLiked = likedComments[c.id];
            const authorSlug = authStore.normalizeUsername(c.userName) || 'kuronami';

            return (
              <div key={c.id} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5 hover:border-zinc-750 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Link href={`/user/${authorSlug}`} className="shrink-0 group">
                      {c.userAvatar ? (
                        <div className="relative w-7 h-7 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-800">
                          <Image src={c.userAvatar} alt={c.userName} fill sizes="28px" className="object-cover" />
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-100 text-[11px] font-bold font-mono shadow-sm border border-zinc-700 group-hover:border-zinc-500 transition-colors">
                          {c.userName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </Link>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link href={`/user/${authorSlug}`} className="text-xs font-bold text-zinc-200 hover:text-white transition-colors">
                          {c.userName}
                        </Link>
                        {c.timecodeSeconds !== null && c.timecodeSeconds !== undefined && (
                          <button
                            type="button"
                            onClick={() => {
                              const video = document.querySelector('video');
                              if (video) video.currentTime = c.timecodeSeconds!;
                            }}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 text-[10px] font-mono transition-all cursor-pointer"
                          >
                            <Clock className="w-3 h-3" />
                            <span>{formatSeconds(c.timecodeSeconds)}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono">{c.createdAt}</span>
                </div>

                {/* Comment Body with Spoiler Protection */}
                {c.isSpoiler && !isRevealed ? (
                  <button
                    type="button"
                    onClick={() => toggleSpoiler(c.id)}
                    className="w-full py-2.5 px-4 rounded-lg bg-zinc-800/80 border border-zinc-750 text-zinc-300 hover:bg-zinc-800 text-xs font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Содержит спойлер (нажмите, чтобы открыть)</span>
                  </button>
                ) : (
                  <p className="text-xs text-zinc-200 leading-relaxed font-sans pl-9">{c.content}</p>
                )}

                {/* Bottom Actions */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => toggleLike(c.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-mono transition-all cursor-pointer ${
                      isLiked
                        ? 'bg-zinc-800 text-zinc-200 border border-zinc-700'
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
                    <span>{c.likesCount || 0}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
