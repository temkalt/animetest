'use client';

import React, { useEffect, useRef, useState } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { syncManager } from '@/lib/dexie/sync';
import { EpisodeTimecodes, VoiceoverTrack } from '@/types';
import { Volume2, Settings2, Sparkles, Cpu, ShieldCheck, Play, Radio, Globe, Layers, Film } from 'lucide-react';

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

type PlayerEngine = 'kuronami' | 'kodik' | 'international';

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

  // Categorize sources by Player Engine
  const directHlsSources = sources.filter((s) => s.isDirectHls);
  const dubSources = sources.filter((s) => !s.isDirectHls && s.type === 'dub' && s.language === 'ru');
  const intlSources = sources.filter((s) => !s.isDirectHls && (s.type === 'sub' || s.language === 'en'));

  const initialEngine: PlayerEngine = directHlsSources.length > 0 ? 'kuronami' : 'kodik';
  const [selectedEngine, setSelectedEngine] = useState<PlayerEngine>(initialEngine);

  const currentEngineSources =
    selectedEngine === 'kuronami'
      ? directHlsSources
      : selectedEngine === 'kodik'
      ? dubSources.length > 0 ? dubSources : sources
      : intlSources.length > 0 ? intlSources : sources;

  const [selectedSourceId, setSelectedSourceId] = useState<string>(
    currentEngineSources[0]?.id || sources[0]?.id || 'default'
  );
  const [selectedCodec, setSelectedCodec] = useState<'h264' | 'h265' | 'av1'>('h264');

  // Keep selection synced on source/engine change
  useEffect(() => {
    if (currentEngineSources.length > 0) {
      const match = currentEngineSources.find((s) => s.id === selectedSourceId);
      if (!match) {
        setSelectedSourceId(currentEngineSources[0].id);
      }
    }
  }, [selectedEngine, episodeNumber, currentEngineSources]);

  const activeSource = sources.find((s) => s.id === selectedSourceId) || currentEngineSources[0] || sources[0];
  const isDirectHls = activeSource?.isDirectHls && selectedEngine === 'kuronami';
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
      settings: [
        {
          html: 'Кодек видео',
          width: 250,
          tooltip: selectedCodec.toUpperCase(),
          selector: [
            {
              default: selectedCodec === 'h264',
              html: 'H.264 (AVC) • Совместимый',
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
      {/* 1. Player Engine Selector Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-2 rounded-2xl bg-[#0E1017] border border-white/5 shadow-md">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto">
          {directHlsSources.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedEngine('kuronami')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
                selectedEngine === 'kuronami'
                  ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] border border-violet-400'
                  : 'bg-white/5 text-slate-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>⚡ KuroNami HLS (FHD 1080p)</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setSelectedEngine('kodik')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
              selectedEngine === 'kodik'
                ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] border border-violet-400'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-rose-400" />
            <span>🎙️ Мульти-Озвучка (Дубляж)</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedEngine('international')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all whitespace-nowrap ${
              selectedEngine === 'international'
                ? 'bg-violet-600 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] border border-violet-400'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-amber-400" />
            <span>🌐 Субтитры & English</span>
          </button>
        </div>

        {/* Codec & Status Badge */}
        <div className="flex items-center gap-2 px-2 self-end sm:self-auto text-xs font-mono">
          <div className="flex items-center gap-1 text-slate-400">
            <Cpu className="w-3.5 h-3.5 text-violet-400" />
            <span>Кодек:</span>
            <span className="px-1.5 py-0.5 rounded bg-white/10 text-cyan-300 font-bold uppercase">
              {selectedCodec}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1 text-emerald-400 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Ad-Shield</span>
          </div>
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
            key={activeSource?.iframeUrl || activeStreamUrl}
            src={activeSource?.iframeUrl || activeStreamUrl}
            className="w-full h-full border-0 rounded-3xl"
            allowFullScreen
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media; accelerometer; gyroscope"
          />
        )}
      </div>

      {/* 3. Voiceovers & Codec Switcher */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[#0E1017] border border-white/5 space-y-3 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
              Выбор озвучки в этом плеере ({currentEngineSources.length}):
            </span>
          </div>

          {/* Quick Codec Switcher */}
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
          {currentEngineSources.map((s) => {
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
                    1080p
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
