'use client';

import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw, ShieldAlert, Sparkles, Layers, Volume2, ShieldCheck, AlertCircle } from 'lucide-react';

interface KinoboxPlayerProps {
  shikimoriId?: number | null;
  malId?: number | null;
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
  animeId,
  episodeNumber,
  title,
  russianTitle,
  englishTitle,
  romajiTitle,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [key, setKey] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Function to initialize Kinobox instance
    const initKinobox = () => {
      if (!containerRef.current || !isMounted) return;

      const KinoboxClass = (window as any).Kinobox;
      if (!KinoboxClass) {
        setError('Не удалось загрузить модуль плеера Kinobox');
        setLoading(false);
        return;
      }

      // Clear container contents before initializing
      containerRef.current.innerHTML = '';

      try {
        const effectiveShikimori = shikimoriId || malId || animeId;
        const searchTitle = russianTitle || title || englishTitle || romajiTitle || '';

        const kinobox = new KinoboxClass(containerRef.current, {
          search: {
            shikimori: effectiveShikimori ? String(effectiveShikimori) : undefined,
            title: searchTitle,
          },
          players: ['kodik', 'alloha', 'collaps', 'videocdn', 'hdvb', 'ashdi', 'lumex'],
          params: {
            all: {
              autoplay: 0,
            },
            kodik: {
              episode: episodeNumber,
            },
            alloha: {
              episode: episodeNumber,
            },
            collaps: {
              episode: episodeNumber,
            },
            videocdn: {
              episode: episodeNumber,
            },
            hdvb: {
              episode: episodeNumber,
            },
          },
          menu: {
            enable: true,
            default: 'players',
            mobile: true,
            format: '{player}',
            limit: 7,
            open: false,
          },
          ui: {
            theme: 'dark',
            primaryColor: '#8B5CF6',
          },
        });

        kinobox.init();
        setLoading(false);
      } catch (err: any) {
        console.error('[Kinobox] Initialization error:', err);
        setError('Ошибка при инициализации источников плеера');
        setLoading(false);
      }
    };

    // Load kinobox.min.js script if not present
    if ((window as any).Kinobox) {
      initKinobox();
    } else {
      const existingScript = document.getElementById('kinobox-script');
      if (existingScript) {
        existingScript.addEventListener('load', initKinobox);
      } else {
        const script = document.createElement('script');
        script.id = 'kinobox-script';
        script.src = 'https://kinobox.tv/kinobox.min.js';
        script.async = true;
        script.onload = () => {
          if (isMounted) initKinobox();
        };
        script.onerror = () => {
          if (isMounted) {
            setError('Не удалось подключиться к серверу Kinobox. Попробуйте другой плеер или обновите страницу.');
            setLoading(false);
          }
        };
        document.body.appendChild(script);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [shikimoriId, malId, animeId, episodeNumber, russianTitle, englishTitle, romajiTitle, key]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-3xl overflow-hidden bg-[#07080B] border border-white/10 flex flex-col justify-center items-center">
      {/* Target Container for Kinobox Player */}
      <div
        ref={containerRef}
        className="kinobox_player w-full h-full flex-1 relative z-10"
        style={{ minHeight: '400px' }}
      />

      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 bg-[#07080B]/90 backdrop-blur-md flex flex-col items-center justify-center gap-3 z-20">
          <div className="w-10 h-10 border-3 border-violet-500/20 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-xs font-mono text-slate-400 animate-pulse">
            Поиск доступных озвучек и плееров (Kodik, Alloha, Collaps, HDVB)...
          </p>
        </div>
      )}

      {/* Error Fallback */}
      {error && (
        <div className="absolute inset-0 bg-[#0E1017] flex flex-col items-center justify-center p-6 text-center gap-4 z-20">
          <AlertCircle className="w-10 h-10 text-amber-400" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">Не удалось автоматически загрузить Kinobox</h4>
            <p className="text-xs font-mono text-slate-400 max-w-md">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setKey((k) => k + 1)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-mono font-bold transition-all shadow-lg shadow-violet-600/30"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Повторить попытку</span>
          </button>
        </div>
      )}
    </div>
  );
};
