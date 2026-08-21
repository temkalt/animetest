'use client';

import React, { useEffect, useRef, useState } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { syncManager } from '@/lib/dexie/sync';
import { EpisodeTimecodes } from '@/types';

interface VideoPlayerProps {
  animeId: number;
  episodeNumber: number;
  url: string;
  poster?: string;
  title: string;
  timecodes?: EpisodeTimecodes;
  onEnded?: () => void;
}

export const VideoPlayerView: React.FC<VideoPlayerProps> = ({
  animeId,
  episodeNumber,
  url,
  poster,
  title,
  timecodes,
  onEnded,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const artInstanceRef = useRef<Artplayer | null>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const art = new Artplayer({
      container: containerRef.current,
      url: url,
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
            });
            hls.loadSource(url);
            hls.attachMedia(video);
            art.hls = hls;
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
          html: '<button class="px-3 py-1 bg-violet-600/90 hover:bg-violet-600 text-xs font-semibold rounded-lg backdrop-blur-md transition-all">Пропустить интро (S)</button>',
          click: function () {
            if (timecodes?.intro?.end && art.currentTime < timecodes.intro.end) {
              art.currentTime = timecodes.intro.end;
              art.notice.show = 'Интро пропущено';
            }
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

      // Show/Hide Skip Intro Button via DOM or control update
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
          art.notice.show = 'Интро пропущено';
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
  }, [url, animeId, episodeNumber]);

  return (
    <div className="relative w-full aspect-video rounded-3xl overflow-hidden bg-[#07080B] border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.9)] group">
      {/* Ambient Ambilight Glow */}
      <div
        ref={glowRef}
        className="absolute -inset-4 bg-violet-600/15 filter blur-3xl -z-10 rounded-3xl pointer-events-none transition-all duration-700"
      />
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};
