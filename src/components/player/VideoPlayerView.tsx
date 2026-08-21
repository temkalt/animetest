'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { syncManager } from '@/lib/dexie/sync';
import { EpisodeTimecodes, VoiceoverTrack } from '@/types';
import { StreamResolver } from '@/lib/player/stream-resolver';
import { fetchDDBBPlayers } from '@/lib/api/ddbb';
import {
  Sparkles,
  ShieldCheck,
  Play,
  Layers,
  Zap,
  Tv,
  AlertCircle,
  RefreshCw,
  Maximize,
  HelpCircle,
  ChevronRight,
  Radio,
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

const PLAYER_ICONS: Record<string, string> = {
  anilibria: '⚡',
  kodik: '🌌',
  alloha: '✨',
  collaps: '⚡',
  turbo: '🚀',
  veoveo: '🔮',
  vibix: '📼',
  consumet: '🌟',
  sibnet: '📼',
  lumex: '🔮',
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
  const glowRef = useRef<HTMLDivElement>(null);

  // Client-discovered streams (AniLibria + DDBB live tokens)
  const [clientSources, setClientSources] = useState<VoiceoverTrack[]>([]);
  const [activeTimecodes, setActiveTimecodes] = useState<EpisodeTimecodes | undefined>(initialTimecodes);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [hlsFailed, setHlsFailed] = useState<boolean>(false);

  // Build merged sources list
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

    return unique;
  }, [clientSources, initialSources, animeId, malId, shikimoriId, episodeNumber, russianTitle, romajiTitle, englishTitle]);

  // Selected source ID: prefer HLS if available and not failed, else Kodik or Alloha
  const [selectedSourceId, setSelectedSourceId] = useState<string>(() => {
    const hls = allSources.find((s) => s.isDirectHls && s.streamUrl);
    if (hls && !hlsFailed) return hls.id;
    const kodik = allSources.find((s) => s.provider === 'kodik');
    if (kodik) return kodik.id;
    const alloha = allSources.find((s) => s.provider === 'alloha');
    if (alloha) return alloha.id;
    return allSources[0]?.id || 'default';
  });

  // Client-side live discovery (Direct AniLibria HLS + DDBB live balancers)
  useEffect(() => {
    let isMounted = true;

    const titles = {
      russian: russianTitle,
      romaji: romajiTitle,
      english: englishTitle,
    };

    // 1. Discover client-side AniLibria HLS
    const hasInitialHls = initialSources.some((s) => s.isDirectHls && s.streamUrl);
    if (!hasInitialHls) {
      StreamResolver.discoverClientHls({
        episodeNumber,
        titles,
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
          setClientSources((prev) => [hlsTrack, ...prev.filter((p) => !p.isDirectHls)]);
          if (!hlsFailed) {
            setSelectedSourceId(hlsTrack.id);
          }
          if (match.timecodes) {
            setActiveTimecodes(match.timecodes);
          }
        }
      });
    }

    // 2. Discover live DDBB balancers (Alloha, Collaps, Turbo, VeoVeo)
    const searchName = russianTitle || romajiTitle || englishTitle || '';
    if (searchName) {
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
            titles,
            ddbbProviders,
          });
          setClientSources((prev) => {
            const map = new Map<string, VoiceoverTrack>();
            [...prev, ...ddbbSources].forEach((s) => map.set(s.id, s));
            return Array.from(map.values());
          });
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [animeId, episodeNumber, russianTitle, romajiTitle, englishTitle, initialSources, shikimoriId, malId, hlsFailed]);

  // Sync selected source when allSources change
  useEffect(() => {
    if (allSources.length > 0) {
      const match = allSources.find((s) => s.id === selectedSourceId);
      if (!match) {
        const hls = allSources.find((s) => s.isDirectHls && s.streamUrl);
        const kodik = allSources.find((s) => s.provider === 'kodik');
        const alloha = allSources.find((s) => s.provider === 'alloha');
        setSelectedSourceId((!hlsFailed && hls?.id) || kodik?.id || alloha?.id || allSources[0].id);
      }
    }
  }, [allSources, selectedSourceId, hlsFailed]);

  const activeSource = allSources.find((s) => s.id === selectedSourceId) || allSources[0];
  const isDirectHls = activeSource?.isDirectHls && !hlsFailed && !!activeSource?.streamUrl;
  const activeStreamUrl = activeSource?.streamUrl || url;

  // Initialize ArtPlayer for direct HLS (AniLibria)
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
          m3u8: function (video: HTMLVideoElement, url: string, art: any) {
            if (Hls.isSupported()) {
              if (art.hls) art.hls.destroy();
              const hls = new Hls({
                maxBufferLength: 60,
                maxMaxBufferLength: 120,
                enableWorker: true,
                lowLatencyMode: true,
              });
              hls.loadSource(url);
              hls.attachMedia(video);
              art.hls = hls;

              hls.on(Hls.Events.ERROR, function (_event, data) {
                if (data.fatal) {
                  switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                      hls.startLoad();
                      break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                      hls.recoverMediaError();
                      break;
                    default:
                      // Fallback to Kodik/Alloha on unrecoverable HLS error
                      setHlsFailed(true);
                      const fallback = allSources.find((s) => s.provider === 'kodik') || allSources.find((s) => s.provider === 'alloha');
                      if (fallback) setSelectedSourceId(fallback.id);
                      break;
                  }
                }
              });

              art.on('destroy', () => hls.destroy());
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
              video.src = url;
            } else {
              setHlsFailed(true);
            }
          },
        },
        controls: [
          {
            name: 'skip-intro-btn',
            position: 'right',
            html: '<button class="px-3 py-1 bg-violet-600/90 hover:bg-violet-600 text-xs font-semibold rounded-lg backdrop-blur-md transition-all shadow-md">Пропустить интро (S)</button>',
            click: function () {
              if (activeTimecodes?.intro?.end && art.currentTime < activeTimecodes.intro.end) {
                art.currentTime = activeTimecodes.intro.end;
                art.notice.show = 'Интро успешно пропущено';
              }
            },
          },
        ],
      });

      artInstanceRef.current = art;

      syncManager.getWatchProgress(animeId, episodeNumber).then((saved) => {
        if (saved && saved.currentTimeSeconds > 5 && !saved.isCompleted) {
          art.on('ready', () => {
            art.currentTime = saved.currentTimeSeconds;
            art.notice.show = `Продолжение с ${Math.floor(saved.currentTimeSeconds / 60)} мин`;
          });
        }
      });

      let lastSaveTime = 0;
      art.on('video:timeupdate', () => {
        const cur = art.currentTime;
        const dur = art.duration || 1;

        if (activeTimecodes?.intro?.start !== undefined && activeTimecodes?.intro?.end !== undefined) {
          const inIntro = cur >= activeTimecodes.intro.start && cur <= activeTimecodes.intro.end;
          const btn = (art.controls as any)['skip-intro-btn'];
          if (btn) {
            btn.style.display = inIntro ? 'inline-block' : 'none';
          }
        }

        if (Math.abs(cur - lastSaveTime) > 4) {
          lastSaveTime = cur;
          const isCompleted = cur / dur >= 0.9;
          syncManager.saveWatchProgress({
            animeId,
            episodeNumber,
            currentTimeSeconds: cur,
            durationSeconds: dur,
            progressPercentage: (cur / dur) * 100,
            isCompleted,
          });
        }
      });

      const handleKeyDown = (e: KeyboardEvent) => {
        if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
        if (e.key === 's' || e.key === 'S' || e.key === 'ы' || e.key === 'Ы') {
          if (activeTimecodes?.intro?.end && art.currentTime < activeTimecodes.intro.end) {
            art.currentTime = activeTimecodes.intro.end;
            art.notice.show = 'Интро успешно пропущено';
          }
        }
      };
      window.addEventListener('keydown', handleKeyDown);

      art.on('video:ended', () => {
        syncManager.saveWatchProgress({
          animeId,
          episodeNumber,
          currentTimeSeconds: art.duration,
          durationSeconds: art.duration,
          progressPercentage: 100,
          isCompleted: true,
        });
        if (onEnded) onEnded();
      });

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        if (art && art.destroy) {
          art.destroy(false);
        }
      };
    } catch {
      setHlsFailed(true);
    }
  }, [activeStreamUrl, isDirectHls, animeId, episodeNumber, activeTimecodes, allSources]);

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
      {/* 1. Main Player / CDN Switcher Navigation Bar */}
      <div className="p-3.5 rounded-2xl bg-[#0E1017] border border-white/5 shadow-xl space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-violet-400" />
            <span>Плееры & Студии озвучки ({allSources.length}):</span>
          </span>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-mono bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
              <ShieldCheck className="w-3 h-3" />
              <span>Ad-Shield ON</span>
            </div>
            <button
              type="button"
              onClick={() => setIframeKey((prev) => prev + 1)}
              title="Перезагрузить текущий плеер"
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-mono transition-colors border border-white/5"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Обновить</span>
            </button>
          </div>
        </div>

        {/* Player Buttons Matrix */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {allSources.map((s) => {
            const isSelected = s.id === selectedSourceId;
            const icon = PLAYER_ICONS[s.provider] || '🎬';

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSelectedSourceId(s.id);
                  setIframeKey((prev) => prev + 1);
                }}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                  isSelected
                    ? 'bg-violet-600 text-white shadow-[0_0_18px_rgba(139,92,246,0.6)] border border-violet-400 scale-[1.02]'
                    : 'bg-[#141722] hover:bg-white/10 text-slate-300 border border-white/5 hover:border-white/15'
                }`}
              >
                <span>{icon}</span>
                <span>{s.teamName}</span>
                {s.isDirectHls && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 font-sans font-bold">
                    FHD 1080p
                  </span>
                )}
                {s.provider === 'kodik' && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-purple-400/20 text-purple-300 font-sans font-bold">
                    Все озвучки
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Video Player Canvas */}
      <div className="relative w-full aspect-video min-h-[380px] rounded-3xl overflow-hidden bg-[#07080B] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.95)] group">
        {/* Ambient Glow */}
        <div
          ref={glowRef}
          className="absolute -inset-4 bg-violet-600/15 filter blur-3xl -z-10 rounded-3xl pointer-events-none transition-all duration-700"
        />

        {isDirectHls ? (
          <div ref={containerRef} className="w-full h-full" />
        ) : (
          <iframe
            key={`${activeSource?.iframeUrl || activeStreamUrl}-${iframeKey}`}
            src={activeSource?.iframeUrl || activeStreamUrl}
            className="w-full h-full border-0 rounded-3xl"
            referrerPolicy="no-referrer"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
          />
        )}
      </div>

      {/* 3. Active Stream Information Bar & Instant Fallback Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-[#0E1017] border border-white/5 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
          <span className="text-slate-300">
            Активен источник: <strong className="text-white font-bold">{activeSource?.teamName}</strong> • Серия #{episodeNumber}
          </span>
        </div>

        {/* Quick fallback switch button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={switchToNextMirror}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600 text-violet-300 hover:text-white border border-violet-500/40 text-[11px] font-bold transition-all shadow-md"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>Переключить на следующее зеркало</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
