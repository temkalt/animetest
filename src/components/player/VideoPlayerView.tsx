'use client';

import React, { useEffect, useRef, useState } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { syncManager } from '@/lib/dexie/sync';
import { EpisodeTimecodes, VoiceoverTrack } from '@/types';
import { Volume2, Settings2, Sparkles, Cpu, ShieldCheck, CheckCircle2, Play } from 'lucide-react';

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
  const [selectedCodec, setSelectedCodec] = useState<'h264' | 'h265' | 'av1'>('h264');

  // Keep selectedSourceId valid when episode changes
  useEffect(() => {
    if (sources.length > 0) {
      const match = sources.find((s) => s.id === selectedSourceId);
      if (!match) {
        setSelectedSourceId(sources[0].id);
      }
    }
  }, [sources, episodeNumber]);

  const activeSource = sources.find((s) => s.id === selectedSourceId) || sources[0];
  const activeStreamUrl = activeSource?.streamUrl || url;
  const isIframeMode = activeSource ? !activeSource.isDirectHls && !!activeSource.iframeUrl : false;

  useEffect(() => {
    if (isIframeMode || !containerRef.current || !activeStreamUrl) return;

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
                    art.notice.show = 'Ошибка воспроизведения потока';
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
      settings: [
        {
          html: 'Кодек видео',
          width: 250,
          tooltip: selectedCodec.toUpperCase(),
          selector: [
            {
              default: selectedCodec === 'h264',
              html: 'H.264 (AVC) • Высокая совместимость',
              value: 'h264',
            },
            {
              default: selectedCodec === 'h265',
              html: 'H.265 (HEVC) • Повышенная четкость',
              value: 'h265',
            },
            {
              default: selectedCodec === 'av1',
              html: 'AV1 (Next-Gen) • 4K Сжатие',
              value: 'av1',
            },
          ],
          onSelect: function (item: any) {
            setSelectedCodec(item.value);
            art.notice.show = `Кодек: ${item.html}`;
            return item.html;
          },
        },
      ],
    });

    artInstanceRef.current = art;

    // Load saved progress from Local-First DB
    syncManager.getWatchProgress(animeId, episodeNumber).then((saved) => {
      if (saved && saved.currentTimeSeconds > 5 && !saved.isCompleted) {
        art.on('ready', () => {
          art.currentTime = saved.currentTimeSeconds;
          art.notice.show = `Продолжение с ${Math.floor(saved.currentTimeSeconds / 60)} мин`;
        });
      }
    });

    // Timeupdate listener for Intro skip button and Local-First progress persistence
    let lastSaveTime = 0;
    art.on('video:timeupdate', () => {
      const cur = art.currentTime;
      const dur = art.duration || 1;

      // Show/Hide Skip Intro Button via DOM
      if (timecodes?.intro?.start !== undefined && timecodes?.intro?.end !== undefined) {
        const inIntro = cur >= timecodes.intro.start && cur <= timecodes.intro.end;
        const btn = (art.controls as any)['skip-intro-btn'];
        if (btn) {
          btn.style.display = inIntro ? 'inline-block' : 'none';
        }
      }

      // Save watch progress to Local IndexedDB every 4 seconds
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

    // Hotkey handler (S for skip intro)
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
  }, [activeStreamUrl, isIframeMode, animeId, episodeNumber]);

  return (
    <div className="space-y-4">
      {/* Active Stream Indicator Bar */}
      <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-[#0E1017] border border-white/5 text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]" />
          <span className="text-slate-300">
            Озвучка: <strong className="text-white font-bold">{activeSource?.teamName || 'Основная'}</strong>
          </span>
          {activeSource?.isDirectHls && (
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px]">
              Прямой HLS 1080p
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-violet-400" />
            <span>Кодек:</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-cyan-300 font-bold uppercase">
              {selectedCodec}
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-emerald-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ad-Shield</span>
          </div>
        </div>
      </div>

      {/* Main Video Canvas */}
      <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-[#07080B] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.95)] group">
        {/* Ambient Glow */}
        <div
          ref={glowRef}
          className="absolute -inset-4 bg-violet-600/15 filter blur-3xl -z-10 rounded-3xl pointer-events-none transition-all duration-700"
        />

        {isIframeMode && activeSource?.iframeUrl ? (
          <iframe
            key={activeSource.iframeUrl}
            src={activeSource.iframeUrl}
            className="w-full h-full border-0 rounded-3xl"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
          />
        ) : (
          <div ref={containerRef} className="w-full h-full" />
        )}
      </div>

      {/* Interactive Voiceovers & Codec Switcher */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#0E1017] border border-white/5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Доступные озвучки и переводы ({sources.length}):
            </span>
          </div>

          {/* Codec Switcher Pills */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[#07080B] border border-white/10">
            <span className="text-[10px] font-mono text-slate-400 px-1.5">Кодек:</span>
            {(['h264', 'h265', 'av1'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setSelectedCodec(c)}
                className={`px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-bold uppercase transition-all ${
                  selectedCodec === c
                    ? 'bg-violet-600 text-white shadow-[0_0_8px_rgba(139,92,246,0.5)]'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Voiceover Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {sources.map((s) => {
            const isSelected = s.id === selectedSourceId;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedSourceId(s.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-violet-600 text-white font-bold shadow-[0_0_15px_rgba(139,92,246,0.6)] border border-violet-400 scale-[1.02]'
                    : 'bg-[#141722] hover:bg-white/10 text-slate-300 border border-white/5 hover:border-white/15'
                }`}
              >
                <span>{s.teamName}</span>
                {s.isDirectHls && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-400/20 text-cyan-300 font-sans font-bold">
                    HLS
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
