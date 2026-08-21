'use client';

import React, { useState } from 'react';
import { MessageSquare, Clock, Send, EyeOff, ThumbsUp, Sparkles } from 'lucide-react';
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

  return (
    <div className="p-6 rounded-3xl bg-[#0E1017] border border-white/5 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-violet-400" />
          <span>Таймкод-комментарии</span>
        </h3>
        <span className="text-xs font-mono text-slate-400">{comments.length} сообщений</span>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAddComment} className="p-4 rounded-2xl bg-[#141722] border border-white/5 space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Поделитесь впечатлениями о серии..."
          className="w-full bg-[#0E1017] text-gray-200 placeholder-slate-500 rounded-xl p-3 text-xs focus:outline-none focus:ring-1 focus:ring-violet-500 border border-white/5 resize-none h-20"
        />

        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setAttachTimecode(!attachTimecode)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${
                attachTimecode
                  ? 'bg-violet-600/30 text-violet-300 border border-violet-500/40'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{formatSeconds(currentVideoTime)}</span>
            </button>

            <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isSpoiler}
                onChange={(e) => setIsSpoiler(e.target.checked)}
                className="rounded bg-white/5 border-white/10 text-violet-600 focus:ring-0"
              />
              <span>Спойлер</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={!content.trim()}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold transition-all shadow-[0_0_15px_rgba(139,92,246,0.3)]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Отправить</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-3">
        {comments.map((c) => {
          const isRevealed = revealedSpoilers[c.id];
          return (
            <div key={c.id} className="p-3.5 rounded-2xl bg-[#141722]/60 border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-[10px] font-bold font-mono">
                    {c.userName.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs font-semibold text-white">{c.userName}</span>
                  {c.timecodeSeconds !== null && c.timecodeSeconds !== undefined && (
                    <button
                      onClick={() => {
                        const video = document.querySelector('video');
                        if (video) video.currentTime = c.timecodeSeconds!;
                      }}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-mono hover:bg-cyan-500/30 transition-colors"
                    >
                      <Clock className="w-3 h-3" />
                      <span>{formatSeconds(c.timecodeSeconds)}</span>
                    </button>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">{c.createdAt}</span>
              </div>

              {/* Comment Body with Spoiler Protection */}
              {c.isSpoiler && !isRevealed ? (
                <button
                  onClick={() => toggleSpoiler(c.id)}
                  className="w-full py-2 px-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-mono flex items-center justify-center gap-1.5 hover:bg-rose-500/20 transition-colors"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Содержит спойлер (нажмите для просмотра)</span>
                </button>
              ) : (
                <p className="text-xs text-slate-300 leading-relaxed font-sans">{c.content}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
