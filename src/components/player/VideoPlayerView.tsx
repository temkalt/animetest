'use client';

import React, { useEffect, useRef, useState } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { syncManager } from '@/lib/dexie/sync';
import { EpisodeTimecodes, VoiceoverTrack } from '@/types';
import {
  useBalancerProbe,
} from '@/lib/balancer/client/use-balancer-probe';
import { BalancerId, BalancerTranslation } from '@/types/balancer';
import {
  Zap,
  RefreshCw,
  SlidersHorizontal,
  Volume2,
  AlertCircle,
  Sparkles,
  Layers,
  ChevronRight,
  ShieldCheck,
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
  anilibria: 'ANILIBRIA',
  kodik: 'KODIK',
  alloha: 'ALLOHA',
  collaps: 'COLLAPS',
  lumex: 'LUMEX',
  sibnet: 'SIBNET',
  turbo: 'TURBO',
  veoveo: 'VEOVEO',
  vibix: 'VIBIX',
};

const BALANCER_ICONS: Record<string, string> = {
  anilibria: '⚡',
  kodik: '🌌',
  alloha: '✨',
  collaps: '⚡',
  lumex: '🔮',
  sibnet: '📼',
  turbo: '🚀',
  veoveo: '🔮',
  vibix: '📼',
};

export const VideoPlayerView: React.FC<VideoPlayerProps> = ({
  animeId,
  shikimoriId,
  malId,
  kinopoiskId,
  episodeNumber,
  url,
  poster,
  title,
  russianTitle,
  englishTitle,
  romajiTitle,
  timecodes: initialTimecodes,
  onEnded,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const artInstanceRef = useRef<Artplayer | null>(null);
  const playerIframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeKey, setIframeKey] = useState<number>(0);

  // Dynamic Balancer Availability Probe (Strictly hides non-existent balancers)
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
    shikimoriId,
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
  const isDirectHls = activeTranslation?.isDirectHls && !!activeTranslation?.streamUrl;
  const activeStreamUrl =
    activeTranslation?.streamUrl ||
    activeTranslation?.iframeUrl ||
    (shikimoriId ? `https://vidsrc.me/embed/anime?id=${shikimoriId}&ep=${episodeNumber}` : url);

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

  // Failover: switch to next available verified balancer
  const switchToNextBalancer = () => {
    if (availableBalancers.length <= 1) return;
    const currentIndex = activeBalancer ? availableBalancers.indexOf(activeBalancer) : -1;
    const nextIndex = (currentIndex + 1) % availableBalancers.length;
    const nextBalancer = availableBalancers[nextIndex];
    if (nextBalancer) {
      setActiveBalancer(nextBalancer);
      setIframeKey((k) => k + 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. Verified Dynamic Balancer Bar */}
      <div className="p-4 rounded-3xl bg-[#0E1017] border border-white/10 shadow-2xl space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />
              <span>Доступные плееры:</span>
            </span>

            {loading ? (
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20 animate-pulse">
                Синхронизация баз...
              </span>
            ) : (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{availableBalancers.length} онлайн</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => refresh()}
              title="Перепроверить доступность плееров"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono transition-all border border-white/5 shadow-sm"
            >
              <RefreshCw className={`w-3 h-3 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
              <span>Обновить базы</span>
            </button>
          </div>
        </div>

        {/* Dynamic Verified Buttons (Zero Dead Links) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {loading && availableBalancers.length === 0 ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-10 w-32 rounded-xl bg-white/5 animate-pulse border border-white/5"
              />
            ))
          ) : availableBalancers.length === 0 ? (
            <div className="w-full p-3 text-xs font-mono text-amber-400 bg-amber-500/10 rounded-2xl border border-amber-500/20 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>Для данной серии плееры обновляются в сети. Задействован резервный Full HD плеер.</span>
            </div>
          ) : (
            availableBalancers.map((bId) => {
              const res = probeData?.results[bId];
              const isSelected = bId === activeBalancer;
              if (!res || !res.available) return null;

              const icon = BALANCER_ICONS[bId] || res.icon || '🎬';
              const name = BALANCER_NAMES[bId] || res.name;

              return (
                <button
                  key={bId}
                  type="button"
                  onClick={() => {
                    setActiveBalancer(bId);
                    setIframeKey((k) => k + 1);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isSelected
                      ? 'bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.7)] border border-violet-400 scale-[1.02]'
                      : 'bg-[#141722] hover:bg-white/10 text-slate-300 border border-white/10 hover:border-white/20'
                  }`}
                >
                  <span>{icon}</span>
                  <span>{name}</span>
                  {bId === 'anilibria' && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-400/20 text-cyan-300 font-sans font-bold">
                      1080p HLS
                    </span>
                  )}
                  <span className="text-[10px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                    {res.translations.length}
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* 2. Real Translation Selector (Studio Band, AniDUB, SHIZA, Wakanim, etc.) */}
        {activeTranslations.length > 0 && (
          <div className="pt-2.5 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
              <div className="flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Озвучки для текущего плеера:</span>
              </div>
              <span className="text-slate-500">
                Активно: <strong className="text-violet-300">{activeTranslation?.teamName}</strong>
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

      {/* 3. Main Player Canvas with Sandbox & no-referrer Protection */}
      <div className="relative w-full aspect-video min-h-[420px] rounded-3xl overflow-hidden bg-[#07080B] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.95)]">
        {isDirectHls ? (
          <div ref={containerRef} className="w-full h-full" />
        ) : (
          <iframe
            ref={playerIframeRef}
            key={`${activeStreamUrl}-${iframeKey}`}
            src={activeStreamUrl}
            title={title ? `Плеер для ${title}` : 'Видео-плеер'}
            referrerPolicy="no-referrer"
            sandbox="allow-scripts allow-same-origin allow-forms allow-presentation allow-popups allow-popups-to-escape-sandbox"
            allow="autoplay *; fullscreen *; encrypted-media *; picture-in-picture *; clipboard-write *"
            frameBorder="0"
            scrolling="no"
            allowFullScreen
            className="w-full h-full border-0 rounded-3xl z-10 relative"
          />
        )}
      </div>

      {/* 4. Stream Info & Next Balancer Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-[#0E1017] border border-white/5 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
          <span className="text-slate-300">
            Источник: <strong className="text-white font-bold">{activeTranslation?.teamName || activeBalancer?.toUpperCase() || 'Full HD Stream'}</strong> • Серия #{episodeNumber}
          </span>
        </div>

        {availableBalancers.length > 1 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={switchToNextBalancer}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/40 text-[11px] font-bold transition-all shadow-md cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Следующий плеер</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
