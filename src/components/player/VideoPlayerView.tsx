'use client';

import React, { useEffect, useRef, useState } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { syncManager } from '@/lib/dexie/sync';
import { EpisodeTimecodes, VoiceoverTrack } from '@/types';
import { Sparkles, ShieldCheck, Play, Radio, Film, Layers, Zap, Tv, Eye, AlertCircle, RefreshCw } from 'lucide-react';

interface VideoPlayerProps {
  animeId: number;
  episodeNumber: number;
  url: string;
  poster?: string;
  title: string;
  timecodes?: EpisodeTimecodes;
  sources?: VoiceoverTrack[];
  onEnded?: () => void;
}

const PLAYER_ICONS: Record<string, string> = {
  anilibria: '⚡',
  consumet: '🌟',
  kodik: '🎬',
  alloha: '🌌',
  collaps: '⚡',
  sibnet: '📼',
  lumex: '✨',
};

export const VideoPlayerView: React.FC<VideoPlayerProps> = ({
  animeId,
  episodeNumber,
  url,
  poster,
  title,
  timecodes,
  sources = [],
  onEnded,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const artInstanceRef = useRef<Artplayer | null>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  const [selectedSourceId, setSelectedSourceId] = useState<string>(
    sources[0]?.id || 'default'
  );
  const [iframeKey, setIframeKey] = useState<number>(0);

  // Sync selected source when episode or sources update
  useEffect(() => {
    if (sources.length > 0) {
      const match = sources.find((s) => s.id === selectedSourceId);
      if (!match) {
        setSelectedSourceId(sources[0].id);
      }
    }
  }, [sources, episodeNumber]);

  const activeSource = sources.find((s) => s.id === selectedSourceId) || sources[0];
  const isDirectHls = activeSource?.isDirectHls;
  const activeStreamUrl = activeSource?.streamUrl || url;

  useEffect(() => {
    if (!isDirectHls || !containerRef.current || !activeStreamUrl) return;

    const art = new Artplayer({
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
                    art.notice.show = 'Восстановление видеопотока...';
                    break;
                }
              }
            });

            art.on('destroy', () => hls.destroy());
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
          } else {
            art.notice.show = 'HLS не поддерживается в этом браузере';
          }
        },
      },
      controls: [
        {
          name: 'skip-intro-btn',
          position: 'right',
          html: '<button class="px-3 py-1 bg-violet-600/90 hover:bg-violet-600 text-xs font-semibold rounded-lg backdrop-blur-md transition-all shadow-md">Пропустить интро (S)</button>',
          click: function () {
            if (timecodes?.intro?.end && art.currentTime < timecodes.intro.end) {
              art.currentTime = timecodes.intro.end;
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

      if (timecodes?.intro?.start !== undefined && timecodes?.intro?.end !== undefined) {
        const inIntro = cur >= timecodes.intro.start && cur <= timecodes.intro.end;
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
        if (timecodes?.intro?.end && art.currentTime < timecodes.intro.end) {
          art.currentTime = timecodes.intro.end;
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
  }, [activeStreamUrl, isDirectHls, animeId, episodeNumber]);

  return (
    <div className="space-y-4">
      {/* 1. Main Player / CDN Switcher Navigation Bar */}
      <div className="p-3 rounded-2xl bg-[#0E1017] border border-white/5 shadow-lg space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-violet-400" />
            <span>Выберите видеоплеер ({sources.length}):</span>
          </span>
          <div className="flex items-center gap-1 text-emerald-400 text-[11px] font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ad-Shield ON</span>
          </div>
        </div>

        {/* Player Buttons Matrix */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {sources.map((s) => {
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
                    ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.6)] border border-violet-400 scale-[1.02]'
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
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Main Video Player Canvas */}
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-[#07080B] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.95)] group">
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
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
          />
        )}
      </div>

      {/* 3. Active Stream Information Bar & Instant Fallback */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-5 py-3 rounded-2xl bg-[#0E1017] border border-white/5 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
          <span className="text-slate-300">
            Активен: <strong className="text-white font-bold">{activeSource?.teamName}</strong> • Серия #{episodeNumber}
          </span>
        </div>

        {/* Quick fallback button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const fallback = sources.find((s) => s.isDirectHls) || sources.find((s) => s.provider === 'consumet') || sources[0];
              if (fallback) {
                setSelectedSourceId(fallback.id);
                setIframeKey((prev) => prev + 1);
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/5 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 text-[11px] transition-colors"
          >
            <Zap className="w-3 h-3 text-cyan-400" />
            <span>100% Проверенный Full HD</span>
          </button>
        </div>
      </div>
    </div>
  );
};
