'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { syncManager } from '@/lib/dexie/sync';
import { EpisodeTimecodes, VoiceoverTrack } from '@/types';
import { StreamResolver } from '@/lib/player/stream-resolver';
import { fetchDDBBPlayers } from '@/lib/api/ddbb';
import {
  Layers,
  Zap,
  RefreshCw,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';

interface VideoPlayerProps {
  animeId: number;
  shikimoriId?: number | null;
  malId?: number | null;
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

const PROVIDER_NAMES: Record<string, string> = {
  anilibria: 'ANILIBRIA (1080p HLS)',
  kodik: 'KODIK (Все озвучки)',
  alloha: 'ALLOHA (HD)',
  turbo: 'TURBO (HD)',
  veoveo: 'VEOVEO (HD)',
  collaps: 'COLLAPS (HD)',
  consumet: 'KURONAMI (Full HD)',
};

const PROVIDER_ICONS: Record<string, string> = {
  anilibria: '⚡',
  kodik: '🌌',
  alloha: '✨',
  turbo: '🚀',
  veoveo: '🔮',
  collaps: '⚡',
  consumet: '🌟',
  vibix: '📼',
};

export const VideoPlayerView: React.FC<VideoPlayerProps> = ({
  animeId,
  shikimoriId,
  malId,
  episodeNumber,
  url,
  poster,
  title,
  russianTitle,
  englishTitle,
  romajiTitle,
  timecodes: initialTimecodes,
  sources: initialSources = [],
  onEnded,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const artInstanceRef = useRef<Artplayer | null>(null);
  const playerIframeRef = useRef<HTMLIFrameElement>(null);

  // Client-discovered streams (DDBB live balancers + AniLibria)
  const [clientSources, setClientSources] = useState<VoiceoverTrack[]>([]);
  const [activeTimecodes, setActiveTimecodes] = useState<EpisodeTimecodes | undefined>(initialTimecodes);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [selectedSourceId, setSelectedSourceId] = useState<string>('');

  // 1. Combine and prioritize sources (Kodik / Alloha / AniLibria / Turbo / VeoVeo / Collaps)
  const allSources = useMemo(() => {
    const combined = [...clientSources, ...initialSources];
    const seen = new Set<string>();
    const unique: VoiceoverTrack[] = [];

    for (const s of combined) {
      if (!seen.has(s.id)) {
        seen.add(s.id);
        unique.push(s);
      }
    }

    if (unique.length === 0) {
      return StreamResolver.buildSources({
        animeId,
        malId,
        shikimoriId,
        episodeNumber,
        titles: {
          russian: russianTitle,
          romaji: romajiTitle,
          english: englishTitle,
        },
      });
    }

    // Sort order: Anilibria HLS -> Kodik -> Alloha -> Turbo -> Veoveo -> Collaps -> MultiDub
    const providerPriority: Record<string, number> = {
      anilibria: 1,
      kodik: 2,
      alloha: 3,
      turbo: 4,
      veoveo: 5,
      collaps: 6,
      consumet: 7,
    };

    return unique.sort((a, b) => {
      const pA = providerPriority[a.provider] || 99;
      const pB = providerPriority[b.provider] || 99;
      return pA - pB;
    });
  }, [clientSources, initialSources, animeId, malId, shikimoriId, episodeNumber, russianTitle, romajiTitle, englishTitle]);

  // 2. Fetch live ReYohoho / DDBB balancers & AniLibria on mount and on title change
  useEffect(() => {
    let isMounted = true;
    const searchName = russianTitle || romajiTitle || englishTitle || title || '';

    // Fetch live DDBB balancers (Alloha, Turbo, VeoVeo)
    fetchDDBBPlayers({
      title: searchName,
      shikimoriId: shikimoriId || undefined,
    }).then((ddbbProviders) => {
      if (isMounted && ddbbProviders.length > 0) {
        const ddbbSources = StreamResolver.buildSources({
          animeId,
          malId,
          shikimoriId,
          episodeNumber,
          titles: {
            russian: russianTitle,
            romaji: romajiTitle,
            english: englishTitle,
          },
          ddbbProviders,
        });

        setClientSources((prev) => {
          const map = new Map<string, VoiceoverTrack>();
          [...prev, ...ddbbSources].forEach((s) => map.set(s.id, s));
          return Array.from(map.values());
        });
      }
    });

    // Check direct AniLibria
    StreamResolver.discoverClientHls({
      episodeNumber,
      titles: {
        russian: russianTitle,
        romaji: romajiTitle,
        english: englishTitle,
      },
    }).then((match) => {
      if (isMounted && match?.hlsUrl) {
        const hlsTrack: VoiceoverTrack = {
          id: `client-anilibria-${animeId}-${episodeNumber}`,
          provider: 'anilibria',
          teamName: 'KuroNami Direct (1080p HLS)',
          type: 'dub',
          language: 'ru',
          qualities: match.qualities || ['1080p', '720p', '480p'],
          streamUrl: match.hlsUrl,
          isDirectHls: true,
        };
        setClientSources((prev) => [hlsTrack, ...prev]);
        setSelectedSourceId(hlsTrack.id);
        if (match.timecodes) setActiveTimecodes(match.timecodes);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [animeId, episodeNumber, russianTitle, romajiTitle, englishTitle, title, shikimoriId, malId]);

  // Set initial or matching active source
  useEffect(() => {
    if (allSources.length > 0) {
      const match = allSources.find((s) => s.id === selectedSourceId);
      if (!match) {
        const best =
          allSources.find((s) => s.isDirectHls && s.streamUrl) ||
          allSources.find((s) => s.provider === 'kodik' && s.iframeUrl) ||
          allSources.find((s) => s.provider === 'alloha' && s.iframeUrl) ||
          allSources[0];
        if (best) setSelectedSourceId(best.id);
      }
    }
  }, [allSources, selectedSourceId]);

  const activeSource = allSources.find((s) => s.id === selectedSourceId) || allSources[0];
  const isDirectHls = activeSource?.isDirectHls && !!activeSource?.streamUrl;
  const activeStreamUrl = activeSource?.iframeUrl || activeSource?.streamUrl || url;

  // Initialize ArtPlayer if direct HLS is selected
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

      syncManager.getWatchProgress(animeId, episodeNumber).then((saved) => {
        if (saved && saved.currentTimeSeconds > 5 && !saved.isCompleted) {
          art.on('ready', () => {
            art.currentTime = saved.currentTimeSeconds;
          });
        }
      });

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
      // Fallback silently
    }
  }, [activeStreamUrl, isDirectHls, animeId, episodeNumber, onEnded]);

  // Switch to next mirror helper
  const switchToNextMirror = () => {
    const currentIndex = allSources.findIndex((s) => s.id === selectedSourceId);
    const nextIndex = (currentIndex + 1) % allSources.length;
    const nextSource = allSources[nextIndex];
    if (nextSource) {
      setSelectedSourceId(nextSource.id);
      setIframeKey((k) => k + 1);
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. ReYohoho-Style Top Player Navigation Bar */}
      <div className="p-3.5 rounded-2xl bg-[#0E1017] border border-white/10 shadow-2xl space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400" />
              <span>Плеер:</span>
            </span>
            <span className="text-xs font-mono font-bold text-violet-400 bg-violet-500/10 px-2.5 py-1 rounded-lg border border-violet-500/20">
              {PROVIDER_NAMES[activeSource?.provider] || activeSource?.teamName || 'Онлайн-плеер'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIframeKey((prev) => prev + 1)}
              title="Перезагрузить текущий плеер"
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-mono transition-colors border border-white/5"
            >
              <RefreshCw className="w-3 h-3 text-cyan-400" />
              <span>Обновить</span>
            </button>
          </div>
        </div>

        {/* Player Buttons Matrix (AniLibria, Kodik, Alloha, Turbo, VeoVeo) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {allSources.map((s) => {
            const isSelected = s.id === selectedSourceId;
            const icon = PROVIDER_ICONS[s.provider] || '🎬';

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSelectedSourceId(s.id);
                  setIframeKey((prev) => prev + 1);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.7)] border border-violet-400 scale-[1.02]'
                    : 'bg-[#141722] hover:bg-white/10 text-slate-300 border border-white/10 hover:border-white/20'
                }`}
              >
                <span>{icon}</span>
                <span>{s.teamName}</span>
                {s.isDirectHls && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 font-sans font-bold">
                    1080p HLS
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Video Player Canvas (ReYohoho standard iframe mounting) */}
      <div className="relative w-full aspect-video min-h-[420px] rounded-3xl overflow-hidden bg-[#07080B] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.95)]">
        {isDirectHls ? (
          <div ref={containerRef} className="w-full h-full" />
        ) : (
          <iframe
            ref={playerIframeRef}
            key={`${activeStreamUrl}-${iframeKey}`}
            src={activeStreamUrl}
            title={title ? `Плеер для ${title}` : 'Видео-плеер'}
            frameBorder="0"
            allowFullScreen
            allow="autoplay *; fullscreen *; encrypted-media *; picture-in-picture *; clipboard-write *"
            className="w-full h-full border-0 rounded-3xl"
          />
        )}
      </div>

      {/* 3. Stream Info & Failover Switcher */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-[#0E1017] border border-white/5 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
          <span className="text-slate-300">
            Источник: <strong className="text-white font-bold">{activeSource?.teamName}</strong> • Серия #{episodeNumber}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={switchToNextMirror}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/40 text-[11px] font-bold transition-all shadow-md"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Следующий плеер</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
