'use client';

import React, { useState } from 'react';
import { RefreshCw, AlertCircle, Sparkles, ExternalLink } from 'lucide-react';

interface KinoboxPlayerProps {
  shikimoriId?: number | null;
  malId?: number | null;
  kinopoiskId?: number | null;
  animeId: number;
  episodeNumber: number;
  title: string;
  russianTitle?: string | null;
  englishTitle?: string | null;
  romajiTitle?: string;
  onEnded?: () => void;
}

export const KinoboxPlayer: React.FC<KinoboxPlayerProps> = ({
  shikimoriId,
  malId,
  kinopoiskId,
  animeId,
  episodeNumber,
  title,
  russianTitle,
  englishTitle,
  romajiTitle,
}) => {
  const [sourceIndex, setSourceIndex] = useState<number>(0);
  const effectiveShikimori = shikimoriId || malId || animeId;
  const searchTitle = russianTitle || title || englishTitle || romajiTitle || '';

  const sources = [
    {
      name: 'Kodik Player',
      url: `https://kodikplayer.com/find-player?shikimoriID=${effectiveShikimori}&episode=${episodeNumber}`,
    },
    {
      name: 'Kodik Зеркало',
      url: `https://kodik.biz/find-player?shikimoriID=${effectiveShikimori}&episode=${episodeNumber}`,
    },
    {
      name: 'Kodik Поиск',
      url: `https://kodikplayer.com/find-player?title=${encodeURIComponent(searchTitle)}&episode=${episodeNumber}`,
    },
  ];

  const currentSource = sources[sourceIndex] || sources[0];

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-3xl overflow-hidden bg-[#07080B] border border-white/10 flex flex-col justify-center items-center">
      <iframe
        key={currentSource.url}
        src={currentSource.url}
        title={`Плеер для ${searchTitle}`}
        referrerPolicy="no-referrer"
        allow="autoplay *; fullscreen *; encrypted-media *; picture-in-picture *; clipboard-write *"
        frameBorder="0"
        scrolling="no"
        allowFullScreen
        className="w-full h-full flex-1 border-0 rounded-3xl z-10 relative"
      />

      <div className="w-full bg-[#0E1017] px-4 py-2 flex items-center justify-between border-t border-white/5 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>Источник: <strong>{currentSource.name}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          {sources.map((s, idx) => (
            <button
              key={s.name}
              type="button"
              onClick={() => setSourceIndex(idx)}
              className={`px-2 py-1 rounded-md text-[10px] transition-all cursor-pointer ${
                sourceIndex === idx
                  ? 'bg-violet-600 text-white font-bold'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300'
              }`}
            >
              Зеркало {idx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
