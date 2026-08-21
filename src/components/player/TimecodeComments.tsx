'use client';

import React, { useState } from 'react';
import { MessageSquare, Clock, Send, EyeOff, Eye, ThumbsUp, Sparkles, Heart, AlertCircle } from 'lucide-react';
import { EpisodeComment } from '@/types';

interface TimecodeCommentsProps {
  episodeId: string;
  animeId: number;
  currentVideoTime?: number;
  initialComments?: EpisodeComment[];
}

export const TimecodeComments: React.FC<TimecodeCommentsProps> = ({
  episodeId,
  animeId,
  currentVideoTime = 0,
  initialComments = [],
}) => {
  const [comments, setComments] = useState<EpisodeComment[]>(initialComments);
  const [content, setContent] = useState('');
  const [attachTimecode, setAttachTimecode] = useState(false);
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Record<string, boolean>>({});
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    const newComment: EpisodeComment = {
      id: crypto.randomUUID(),
      episodeId,
      userId: 'guest-user',
      userName: 'Гость Отаку',
      content: content.trim(),
      timecodeSeconds: attachTimecode ? Math.floor(currentVideoTime) : null,
      isSpoiler,
      likesCount: 0,
      createdAt: 'Только что',
    };

    setComments([newComment, ...comments]);
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
      setComments((all) =>
        all.map((c) => (c.id === id ? { ...c, likesCount: c.likesCount + (current ? -1 : 1) } : c))
      );
      return { ...prev, [id]: !current };
    });
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-[#090C15]/90 border border-white/[0.08] backdrop-blur-2xl shadow-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-white">Таймкод-комментарии</h3>
            <p className="text-xs text-zinc-400 font-sans">Обсуждайте яркие моменты серии в реальном времени</p>
          </div>
        </div>
        <span className="text-xs font-mono px-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.06] text-zinc-400">
          {comments.length} сообщений
        </span>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAddComment} className="p-4 sm:p-5 rounded-2xl bg-[#06080F] border border-white/[0.06] space-y-3 shadow-inner">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Поделитесь эмоциями от момента (нажмите таймкод для привязки)..."
          className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 text-xs font-sans focus:outline-none resize-none h-20 leading-relaxed"
        />

        <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-white/[0.05]">
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              onClick={() => setAttachTimecode(!attachTimecode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                attachTimecode
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white border border-white/[0.06]'
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
                className="rounded bg-white/10 border-white/20 text-rose-500 focus:ring-0 cursor-pointer"
              />
              <span className={isSpoiler ? 'text-rose-400 font-semibold' : ''}>Спойлер</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={!content.trim()}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 text-white rounded-xl text-xs font-semibold font-display shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
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

            return (
              <div key={c.id} className="p-4 rounded-2xl bg-[#06080F]/80 border border-white/[0.06] space-y-2.5 hover:border-white/[0.12] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white text-[11px] font-bold font-mono shadow-md">
                      {c.userName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{c.userName}</span>
                        {c.timecodeSeconds !== null && c.timecodeSeconds !== undefined && (
                          <button
                            type="button"
                            onClick={() => {
                              const video = document.querySelector('video');
                              if (video) video.currentTime = c.timecodeSeconds!;
                            }}
                            className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono transition-all cursor-pointer"
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
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 hover:bg-rose-500/15 text-xs font-mono flex items-center justify-center gap-2 transition-colors cursor-pointer"
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
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-rose-400 text-rose-400' : ''}`} />
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
