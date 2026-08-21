'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { syncManager } from '@/lib/dexie/sync';
import { EpisodeTimecodes, VoiceoverTrack } from '@/types';
import { useBalancerProbe } from '@/lib/balancer/client/use-balancer-probe';
import { BalancerId } from '@/types/balancer';
import {
  Zap,
  Play,
  Sparkles,
  Layers,
  RefreshCw,
  Maximize2,
  Minimize2,
  Keyboard,
  Info,
  X,
  Volume2,
  Tv,
  CheckCircle2,
  Activity,
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

const BALANCER_CONFIG: Record<
  string,
  { label: string; badge: string; color: string; icon: React.FC<{ className?: string }> }
> = {
  anilibria: { label: 'AniLibria', badge: '1080p FHD Direct', color: 'text-cyan-400', icon: Zap },
  kodik: { label: 'Kodik', badge: '1080p Multi-Dub', color: 'text-indigo-400', icon: Play },
  alloha: { label: 'Alloha', badge: '1080p HD', color: 'text-amber-400', icon: Sparkles },
  collaps: { label: 'Collaps', badge: 'Full HD Edge', color: 'text-emerald-400', icon: Layers },
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
  const [selectedMirror, setSelectedMirror] = useState<number>(0);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [showHotkeys, setShowHotkeys] = useState<boolean>(false);

  const effectiveShikimoriId = shikimoriId || malId || animeId;

  // Dynamic Balancer Availability Probe
  const {
    loading,
    probeData,
    activeBalancer,
    activeTranslation,
    setActiveBalancer,
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

  // Effective Engine determination
  const effectiveEngine = selectedEngine === 'auto' ? activeBalancer || 'kodik' : selectedEngine;

  // Decide direct HLS vs Iframe stream
  const isDirectHls =
    effectiveEngine === 'anilibria' &&
    activeTranslation?.isDirectHls &&
    !!activeTranslation?.streamUrl;

  // Compute the current active stream URL
  const activeStreamUrl = useMemo(() => {
    // 1. AniLibria Direct HLS
    if (effectiveEngine === 'anilibria' && activeTranslation?.streamUrl) {
      return activeTranslation.streamUrl;
    }

    // 2. Kodik Engine (loads full multi-voiceover player with in-player selector)
    if (effectiveEngine === 'kodik') {
      const mirrorDomain = selectedMirror === 1 ? 'kodik.biz' : 'kodikplayer.com';
      return `https://${mirrorDomain}/find-player?shikimoriID=${effectiveShikimoriId}&episode=${episodeNumber}&min_quality=720`;
    }

    // 3. Alloha Engine
    if (effectiveEngine === 'alloha') {
      const allohaTr = probeData?.results?.alloha?.translations?.[0];
      if (allohaTr?.iframeUrl) return allohaTr.iframeUrl;
      return `https://theatre.stravers.live/?token_movie=9ceb642cd6ce5e013fe7a9922430a9&token=5009a7a2d05cb714cc53c8408471e3`;
    }

    // 4. Collaps Engine fallback
    if (effectiveEngine === 'collaps') {
      const collapsTr = probeData?.results?.collaps?.translations?.[0];
      if (collapsTr?.iframeUrl) return collapsTr.iframeUrl;
      return `https://api.collapse.to/embed/anime/${effectiveShikimoriId}?episode=${episodeNumber}`;
    }

    return `https://kodikplayer.com/find-player?shikimoriID=${effectiveShikimoriId}&episode=${episodeNumber}&min_quality=720`;
  }, [
    effectiveEngine,
    activeTranslation,
    selectedMirror,
    effectiveShikimoriId,
    episodeNumber,
    probeData,
  ]);

  // Handle balancer switch
  const handleEngineSelect = (engineKey: string) => {
    setSelectedEngine(engineKey);
    setActiveBalancer(engineKey as BalancerId);
    setIframeKey((k) => k + 1);
  };

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 't' || e.key === 'T' || e.key === 'е' || e.key === 'Е') {
        setIsTheaterMode((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsTheaterMode(false);
        setShowHotkeys(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTheaterMode]);

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
        theme: '#6366F1',
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
    <div className={`space-y-4 ${isTheaterMode ? 'fixed inset-0 z-50 bg-[#050609] p-4 sm:p-8 flex flex-col justify-between overflow-y-auto' : ''}`}>
      {/* 1. Header Control Deck */}
      <div className="p-3 sm:p-4 rounded-3xl bg-[#090C15]/90 border border-white/[0.08] backdrop-blur-2xl shadow-2xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Balancer Switcher Tabs */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#06080F] border border-white/[0.06] overflow-x-auto scrollbar-none max-w-full">
            {/* AniLibria Direct Tab */}
            {probeData?.results?.anilibria?.available && (
              <button
                type="button"
                onClick={() => handleEngineSelect('anilibria')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  effectiveEngine === 'anilibria'
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-cyan-300" />
                <span>AniLibria</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/20 text-cyan-200 font-mono font-bold">
                  1080p Direct
                </span>
              </button>
            )}

            {/* Kodik Tab */}
            <button
              type="button"
              onClick={() => handleEngineSelect('kodik')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                effectiveEngine === 'kodik'
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Play className="w-3.5 h-3.5 text-indigo-300 fill-indigo-300/30" />
              <span>Kodik</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-zinc-300 font-mono">
                Мульти-озвучка
              </span>
            </button>

            {/* Alloha Tab */}
            <button
              type="button"
              onClick={() => handleEngineSelect('alloha')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                effectiveEngine === 'alloha'
                  ? 'bg-gradient-to-r from-indigo-600 to-amber-600 text-white shadow-lg shadow-amber-600/30'
                  : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Alloha</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-amber-200 font-mono">
                1080p HD
              </span>
            </button>

            {/* Collaps Tab */}
            {probeData?.results?.collaps?.available && (
              <button
                type="button"
                onClick={() => handleEngineSelect('collaps')}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                  effectiveEngine === 'collaps'
                    ? 'bg-gradient-to-r from-indigo-600 to-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-emerald-300" />
                <span>Collaps</span>
              </button>
            )}
          </div>

          {/* Right: Quick Player Controls */}
          <div className="flex items-center gap-2">
            {/* Mirror Switcher for Kodik */}
            {effectiveEngine === 'kodik' && (
              <div className="hidden sm:flex items-center gap-1 bg-[#06080F] p-1 rounded-xl border border-white/[0.06] text-xs font-mono">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMirror(0);
                    setIframeKey((k) => k + 1);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedMirror === 0
                      ? 'bg-white/15 text-white font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Сервер 1
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMirror(1);
                    setIframeKey((k) => k + 1);
                  }}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    selectedMirror === 1
                      ? 'bg-white/15 text-white font-bold'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Сервер 2
                </button>
              </div>
            )}

            {/* Hotkeys Modal Trigger */}
            <button
              type="button"
              onClick={() => setShowHotkeys((prev) => !prev)}
              title="Горячие клавиши (хоткеи)"
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-all border border-white/[0.06] cursor-pointer"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Refresh Player */}
            <button
              type="button"
              onClick={() => {
                refresh();
                setIframeKey((k) => k + 1);
              }}
              title="Перезагрузить плеер"
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-white transition-all border border-white/[0.06] cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>

            {/* Theater Mode Button */}
            <button
              type="button"
              onClick={() => setIsTheaterMode((prev) => !prev)}
              title={isTheaterMode ? 'Выйти из режима кинотеатра (Esc)' : 'Режим кинотеатра (T)'}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all border cursor-pointer ${
                isTheaterMode
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40 shadow-lg shadow-indigo-500/20'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border-white/[0.06]'
              }`}
            >
              {isTheaterMode ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Свернуть</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Театр</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Cinema Stage with Ambient Backlight Glow */}
      <div className="relative group">
        {/* Ambient Backlight Glow Filter Layer */}
        <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500/20 via-cyan-500/15 to-purple-500/20 rounded-3xl blur-2xl opacity-60 group-hover:opacity-80 transition-opacity pointer-events-none" />

        <div className={`relative w-full aspect-video min-h-[380px] sm:min-h-[480px] md:min-h-[540px] rounded-3xl overflow-hidden bg-[#040508] border border-white/[0.1] shadow-[0_25px_60px_rgba(0,0,0,0.9)] transition-all ${isTheaterMode ? 'flex-1 max-h-[85vh]' : ''}`}>
          {isDirectHls ? (
            <div ref={containerRef} className="w-full h-full" />
          ) : (
            <iframe
              ref={playerIframeRef}
              key={`${activeStreamUrl}-${iframeKey}`}
              src={activeStreamUrl || ''}
              title={title ? `Плеер: ${title}` : 'Плеер аниме'}
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-same-origin allow-forms allow-presentation"
              allow="autoplay *; fullscreen *; encrypted-media *; picture-in-picture *; clipboard-write *"
              frameBorder="0"
              scrolling="no"
              allowFullScreen
              className="w-full h-full border-0 rounded-3xl z-10 relative"
            />
          )}
        </div>
      </div>

      {/* 3. Telemetry Info Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-3.5 rounded-2xl bg-[#090C15]/90 border border-white/[0.06] text-xs backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="text-zinc-300 font-medium">
            Балансер:{' '}
            <strong className="text-white font-bold">{BALANCER_CONFIG[effectiveEngine]?.label || 'HD Stream'}</strong> • Серия #{episodeNumber}
          </span>
        </div>

        <div className="flex items-center gap-4 text-zinc-400 text-[11px] font-mono">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>Выбор серий и озвучек доступен в меню плеера</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-zinc-500 text-[10px]">
            <span className="bg-white/[0.05] px-2 py-0.5 rounded border border-white/[0.05]">T: Театр</span>
            <span className="bg-white/[0.05] px-2 py-0.5 rounded border border-white/[0.05]">F: Fullscreen</span>
          </div>
        </div>
      </div>

      {/* 4. Hotkeys Modal */}
      {showHotkeys && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B0E17] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-5 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Keyboard className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold font-display text-white text-base">Горячие клавиши</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHotkeys(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-300 font-sans">
              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                <span>Пауза / Плей</span>
                <kbd className="px-2.5 py-0.5 rounded-lg bg-white/10 font-mono text-[11px] text-white">Space / K</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                <span>Полный экран</span>
                <kbd className="px-2.5 py-0.5 rounded-lg bg-white/10 font-mono text-[11px] text-white">F</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                <span>Режим кинотеатра</span>
                <kbd className="px-2.5 py-0.5 rounded-lg bg-white/10 font-mono text-[11px] text-white">T</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                <span>Выключить / Включить звук</span>
                <kbd className="px-2.5 py-0.5 rounded-lg bg-white/10 font-mono text-[11px] text-white">M</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-white/[0.06]">
                <span>Перемотка ± 5 сек</span>
                <kbd className="px-2.5 py-0.5 rounded-lg bg-white/10 font-mono text-[11px] text-white">← / →</kbd>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span>Громкость ± 10%</span>
                <kbd className="px-2.5 py-0.5 rounded-lg bg-white/10 font-mono text-[11px] text-white">↑ / ↓</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
