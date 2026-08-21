'use client';

import React, { useEffect, useRef, useState } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { syncManager } from '@/lib/dexie/sync';
import { EpisodeTimecodes, VoiceoverTrack } from '@/types';
import { useBalancerProbe } from '@/lib/balancer/client/use-balancer-probe';
import { BalancerId } from '@/types/balancer';
import {
  RefreshCw,
  SlidersHorizontal,
  Volume2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Zap,
  Info,
} from 'lucide-react';

interface VideoPlayerProps {
  animeId: number;
  shikimoriId?: number | null;
  malId?: number | null;
  kinopoiskId?: number | null;
  episodeNumber: number;
  url: string;
  poster?: string;
  title: string;
  russianTitle?: string | null;
  englishTitle?: string | null;
  romajiTitle?: string;
  timecodes?: EpisodeTimecodes;
  sources?: VoiceoverTrack[];
  onEnded?: () => void;
}

const BALANCER_NAMES: Record<string, string> = {
  anilibria: '⚡ ANILIBRIA (1080p HLS)',
  kodik: '🌌 KODIK (Все озвучки)',
  alloha: '✨ ALLOHA (HD Мульти-озвучка)',
  collaps: '⚡ COLLAPS (Full HD)',
  multidub: '🌐 МУЛЬТИ-ДУБ',
};

export const VideoPlayerView: React.FC<VideoPlayerProps> = ({
  animeId,
  shikimoriId,
  malId,
  kinopoiskId,
  episodeNumber,
  poster,
  title,
  russianTitle,
  englishTitle,
  romajiTitle,
  onEnded,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const artInstanceRef = useRef<Artplayer | null>(null);
  const playerIframeRef = useRef<HTMLIFrameElement>(null);

  const [selectedEngine, setSelectedEngine] = useState<string>('auto');
  const [iframeKey, setIframeKey] = useState<number>(0);

  const effectiveShikimoriId = shikimoriId || malId || animeId;
  const searchTitle = russianTitle || title || englishTitle || romajiTitle || '';

  // Dynamic Balancer Availability Probe
  const {
    loading,
    probeData,
    availableBalancers,
    activeBalancer,
    activeTranslation,
    setActiveBalancer,
    setActiveTranslation,
    refresh,
  } = useBalancerProbe({
    animeId,
    shikimoriId: effectiveShikimoriId,
    malId,
    kinopoiskId,
    episodeNumber,
    titles: {
      russian: russianTitle,
      english: englishTitle,
      romaji: romajiTitle,
    },
  });

  const activeTranslations =
    activeBalancer && probeData ? probeData.results[activeBalancer]?.translations || [] : [];

  // Effective Engine determination
  const effectiveEngine = selectedEngine === 'auto' ? activeBalancer || 'kodik' : selectedEngine;

  // Decide direct HLS vs Iframe stream
  const isDirectHls =
    effectiveEngine === 'anilibria' &&
    activeTranslation?.isDirectHls &&
    !!activeTranslation?.streamUrl;

  // Compute the current active stream URL
  const activeStreamUrl = React.useMemo(() => {
    if (selectedEngine === 'multidub') {
      return `https://vidsrc.me/embed/anime?id=${effectiveShikimoriId}&ep=${episodeNumber}`;
    }
    if (selectedEngine === 'kodik') {
      return `https://kodikplayer.com/find-player?shikimoriID=${effectiveShikimoriId}&episode=${episodeNumber}`;
    }
    if (selectedEngine === 'collaps') {
      return `https://api.collapse.to/embed/anime/${effectiveShikimoriId}?episode=${episodeNumber}`;
    }

    if (activeTranslation?.streamUrl) return activeTranslation.streamUrl;
    if (activeTranslation?.iframeUrl) return activeTranslation.iframeUrl;

    // Fallback to active balancer iframe
    if (activeBalancer === 'kodik') {
      return `https://kodikplayer.com/find-player?shikimoriID=${effectiveShikimoriId}&episode=${episodeNumber}`;
    }
    if (activeBalancer === 'alloha' && probeData?.results?.alloha?.translations?.[0]?.iframeUrl) {
      return probeData.results.alloha.translations[0].iframeUrl;
    }

    return `https://kodikplayer.com/find-player?shikimoriID=${effectiveShikimoriId}&episode=${episodeNumber}`;
  }, [selectedEngine, effectiveShikimoriId, episodeNumber, activeTranslation, activeBalancer, probeData]);

  // 1. Initialize Artplayer for Direct HLS streams (AniLibria 1080p)
  useEffect(() => {
    if (!isDirectHls || !containerRef.current || !activeStreamUrl) return;

    let art: any = null;
    try {
      art = new Artplayer({
        container: containerRef.current,
        url: activeStreamUrl,
        poster: poster || '',
        volume: 0.8,
        isLive: false,
        muted: false,
        autoplay: false,
        pip: true,
        autoSize: false,
        autoMini: true,
        screenshot: true,
        setting: true,
        loop: false,
        flip: true,
        playbackRate: true,
        aspectRatio: true,
        fullscreen: true,
        fullscreenWeb: true,
        subtitleOffset: true,
        miniProgressBar: true,
        theme: '#8B5CF6',
        customType: {
          m3u8: function (video: HTMLVideoElement, streamUrl: string, artInstance: any) {
            if (Hls.isSupported()) {
              if (artInstance.hls) artInstance.hls.destroy();
              const hls = new Hls({
                maxBufferLength: 60,
                maxMaxBufferLength: 120,
                enableWorker: true,
                lowLatencyMode: true,
              });
              hls.loadSource(streamUrl);
              hls.attachMedia(video);
              artInstance.hls = hls;
              artInstance.on('destroy', () => hls.destroy());
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
              video.src = streamUrl;
            }
          },
        },
      });

      artInstanceRef.current = art;

      // Restore saved progress
      syncManager.getWatchProgress(animeId, episodeNumber).then((saved) => {
        if (saved && saved.currentTimeSeconds > 5 && !saved.isCompleted) {
          art.on('ready', () => {
            art.currentTime = saved.currentTimeSeconds;
          });
        }
      });

      // Save watch progress periodically
      let lastSaveTime = 0;
      art.on('video:timeupdate', () => {
        const cur = art.currentTime;
        const dur = art.duration || 1;
        if (Math.abs(cur - lastSaveTime) > 4) {
          lastSaveTime = cur;
          syncManager.saveWatchProgress({
            animeId,
            episodeNumber,
            currentTimeSeconds: cur,
            durationSeconds: dur,
            progressPercentage: (cur / dur) * 100,
            isCompleted: cur / dur >= 0.9,
          });
        }
      });

      art.on('video:ended', () => {
        if (onEnded) onEnded();
      });

      return () => {
        if (art && art.destroy) art.destroy(false);
      };
    } catch {
      // Fallback
    }
  }, [activeStreamUrl, isDirectHls, animeId, episodeNumber, poster, onEnded]);

  return (
    <div className="space-y-4">
      {/* 1. Verified Multi-Balancer Control Bar */}
      <div className="p-4 rounded-3xl bg-[#0E1017] border border-white/10 shadow-2xl space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />
              <span>Выберите плеер:</span>
            </span>

            {loading ? (
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20 animate-pulse">
                Синхронизация источников...
              </span>
            ) : availableBalancers.length > 0 ? (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Источники активны ({availableBalancers.length})</span>
              </span>
            ) : (
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                Резервный режим Kodik
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                refresh();
                setIframeKey((k) => k + 1);
              }}
              title="Перепроверить доступность плееров"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono transition-all border border-white/5 shadow-sm cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Обновить</span>
            </button>
          </div>
        </div>

        {/* Dynamic Player Buttons Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {/* 1. AniLibria Direct 1080p Tab */}
          {probeData?.results?.anilibria?.available && (
            <button
              type="button"
              onClick={() => {
                setSelectedEngine('anilibria');
                setActiveBalancer('anilibria');
                setIframeKey((k) => k + 1);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                effectiveEngine === 'anilibria'
                  ? 'bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.7)] border border-violet-400 scale-[1.02]'
                  : 'bg-[#141722] hover:bg-white/10 text-slate-300 border border-white/10 hover:border-white/20'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>ANILIBRIA</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 font-sans font-bold">
                1080p HLS
              </span>
            </button>
          )}

          {/* 2. Kodik Standalone Tab */}
          <button
            type="button"
            onClick={() => {
              setSelectedEngine('kodik');
              setActiveBalancer('kodik');
              setIframeKey((k) => k + 1);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
              effectiveEngine === 'kodik'
                ? 'bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.7)] border border-violet-400 scale-[1.02]'
                : 'bg-[#141722] hover:bg-white/10 text-slate-300 border border-white/10 hover:border-white/20'
            }`}
          >
            <span>🌌</span>
            <span>KODIK</span>
            <span className="text-[10px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
              Все озвучки
            </span>
          </button>

          {/* 3. Alloha Standalone Tab */}
          <button
            type="button"
            onClick={() => {
              setSelectedEngine('alloha');
              setActiveBalancer('alloha');
              setIframeKey((k) => k + 1);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
              effectiveEngine === 'alloha'
                ? 'bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.7)] border border-violet-400 scale-[1.02]'
                : 'bg-[#141722] hover:bg-white/10 text-slate-300 border border-white/10 hover:border-white/20'
            }`}
          >
            <span>✨</span>
            <span>ALLOHA</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-400/20 text-emerald-300 font-sans font-bold">
              HD
            </span>
          </button>

          {/* 4. Collaps Standalone Tab */}
          <button
            type="button"
            onClick={() => {
              setSelectedEngine('collaps');
              setActiveBalancer('collaps');
              setIframeKey((k) => k + 1);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
              effectiveEngine === 'collaps'
                ? 'bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.7)] border border-violet-400 scale-[1.02]'
                : 'bg-[#141722] hover:bg-white/10 text-slate-300 border border-white/10 hover:border-white/20'
            }`}
          >
            <span>⚡</span>
            <span>COLLAPS</span>
          </button>

          {/* 5. KuroNami Multi-Dub Global Tab */}
          <button
            type="button"
            onClick={() => {
              setSelectedEngine('multidub');
              setIframeKey((k) => k + 1);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
              selectedEngine === 'multidub'
                ? 'bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.7)] border border-violet-400 scale-[1.02]'
                : 'bg-[#141722] hover:bg-white/10 text-slate-300 border border-white/10 hover:border-white/20'
            }`}
          >
            <span>🌐</span>
            <span>МУЛЬТИ-ДУБ</span>
          </button>
        </div>

        {/* 2. Real Translation Selector for active balancer */}
        {selectedEngine !== 'multidub' && activeTranslations.length > 1 && (
          <div className="pt-2.5 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
              <div className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Озвучки для выбранного плеера:</span>
              </div>
              <span className="text-slate-500">
                Активно: <strong className="text-violet-300">{activeTranslation?.teamName || 'По умолчанию'}</strong>
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 max-h-36 overflow-y-auto pr-1">
              {activeTranslations.map((tr) => {
                const isTrSelected = tr.id === activeTranslation?.id;
                return (
                  <button
                    key={tr.id}
                    type="button"
                    onClick={() => {
                      setActiveTranslation(tr);
                      setIframeKey((k) => k + 1);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      isTrSelected
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.4)] font-bold'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5 hover:border-white/10'
                    }`}
                  >
                    <span>{tr.teamName}</span>
                    {tr.type === 'sub' && (
                      <span className="ml-1 text-[9px] text-amber-400 bg-amber-400/10 px-1 py-0.5 rounded">
                        SUB
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 3. Main Player Canvas */}
      <div className="relative w-full aspect-video min-h-[420px] rounded-3xl overflow-hidden bg-[#07080B] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.95)]">
        {isDirectHls ? (
          <div ref={containerRef} className="w-full h-full" />
        ) : (
          <iframe
            ref={playerIframeRef}
            key={`${activeStreamUrl}-${iframeKey}`}
            src={activeStreamUrl || ''}
            title={title ? `Плеер для ${title}` : 'Видео-плеер'}
            referrerPolicy="no-referrer"
            allow="autoplay *; fullscreen *; encrypted-media *; picture-in-picture *; clipboard-write *"
            frameBorder="0"
            scrolling="no"
            allowFullScreen
            className="w-full h-full border-0 rounded-3xl z-10 relative"
          />
        )}
      </div>

      {/* 4. Stream Info & Quick Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-[#0E1017] border border-white/5 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
          <span className="text-slate-300">
            Плеер: <strong className="text-white font-bold">{BALANCER_NAMES[effectiveEngine] || 'Full HD Stream'}</strong> • Серия #{episodeNumber}
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <Info className="w-3.5 h-3.5" />
            <span>Если плеер не грузится, переключите источник (Kodik / Alloha)</span>
          </div>
          <div className="flex items-center gap-1 text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>1080p HD</span>
          </div>
        </div>
      </div>
    </div>
  );
};
