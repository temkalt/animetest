'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { syncManager } from '@/lib/dexie/sync';
import { EpisodeTimecodes, VoiceoverTrack } from '@/types';
import { useBalancerProbe } from '@/lib/balancer/client/use-balancer-probe';
import { BalancerId, BalancerTranslation } from '@/types/balancer';
import {
  Zap,
  Play,
  Sparkles,
  Layers,
  Globe,
  RefreshCw,
  Maximize2,
  Minimize2,
  Keyboard,
  Info,
  Check,
  ChevronDown,
  Volume2,
  X,
  Search,
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
  { label: string; badge: string; icon: React.FC<{ className?: string }> }
> = {
  anilibria: { label: 'AniLibria', badge: '1080p FHD', icon: Zap },
  kodik: { label: 'Kodik', badge: '720p / 1080p', icon: Play },
  alloha: { label: 'Alloha', badge: '1080p HD', icon: Sparkles },
  collaps: { label: 'Collaps', badge: 'Full HD', icon: Layers },
  multidub: { label: 'Multi-Dub', badge: 'Eng / Sub', icon: Globe },
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [selectedEngine, setSelectedEngine] = useState<string>('auto');
  const [selectedMirror, setSelectedMirror] = useState<number>(0);
  const [iframeKey, setIframeKey] = useState<number>(0);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const [showHotkeys, setShowHotkeys] = useState<boolean>(false);
  const [showVoiceoverDropdown, setShowVoiceoverDropdown] = useState<boolean>(false);
  const [voiceoverSearch, setVoiceoverSearch] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'dub' | 'sub'>('all');

  const effectiveShikimoriId = shikimoriId || malId || animeId;

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

  // Effective Engine determination
  const effectiveEngine = selectedEngine === 'auto' ? activeBalancer || 'kodik' : selectedEngine;

  // Active Translations list for the current balancer
  const currentTranslations = useMemo(() => {
    if (!probeData) return [];
    return probeData.results[effectiveEngine as BalancerId]?.translations || [];
  }, [probeData, effectiveEngine]);

  // Filtered translations by type and search query
  const filteredTranslations = useMemo(() => {
    return currentTranslations.filter((t) => {
      const matchesType = filterType === 'all' ? true : filterType === 'sub' ? t.type === 'sub' : t.type !== 'sub';
      const matchesSearch = voiceoverSearch.trim() === '' || t.teamName.toLowerCase().includes(voiceoverSearch.toLowerCase());
      return matchesType && matchesSearch;
    });
  }, [currentTranslations, filterType, voiceoverSearch]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowVoiceoverDropdown(false);
      }
    };
    if (showVoiceoverDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showVoiceoverDropdown]);

  // Decide direct HLS vs Iframe stream
  const isDirectHls =
    effectiveEngine === 'anilibria' &&
    activeTranslation?.isDirectHls &&
    !!activeTranslation?.streamUrl;

  // Compute the current active stream URL
  const activeStreamUrl = useMemo(() => {
    // 1. Multi-Dub engine
    if (effectiveEngine === 'multidub') {
      return `https://vidsrc.me/embed/anime?id=${effectiveShikimoriId}&ep=${episodeNumber}`;
    }

    // 2. Active translation stream or iframe
    if (activeTranslation && activeTranslation.balancerId === effectiveEngine) {
      if (activeTranslation.streamUrl) return activeTranslation.streamUrl;
      if (activeTranslation.iframeUrl) return activeTranslation.iframeUrl;
    }

    // 3. Kodik Engine (with mirrors)
    if (effectiveEngine === 'kodik') {
      const mirrorDomain = selectedMirror === 1 ? 'kodik.biz' : 'kodikplayer.com';
      return `https://${mirrorDomain}/find-player?shikimoriID=${effectiveShikimoriId}&episode=${episodeNumber}&min_quality=720`;
    }

    // 4. Alloha Engine fallback
    if (effectiveEngine === 'alloha') {
      const allohaTr = probeData?.results?.alloha?.translations?.[0];
      if (allohaTr?.iframeUrl) return allohaTr.iframeUrl;
      return `https://theatre.stravers.live/?token_movie=9ceb642cd6ce5e013fe7a9922430a9&token=5009a7a2d05cb714cc53c8408471e3&episode=${episodeNumber}`;
    }

    // 5. Collaps Engine fallback
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

  // Handle balancer switch with auto-selection of its first voiceover
  const handleEngineSelect = (engineKey: string) => {
    setSelectedEngine(engineKey);
    setActiveBalancer(engineKey as BalancerId);
    setShowVoiceoverDropdown(false);
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
        setShowVoiceoverDropdown(false);
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
    <div className={`space-y-4 ${isTheaterMode ? 'fixed inset-0 z-50 bg-[#07080B] p-4 sm:p-8 flex flex-col justify-between overflow-y-auto' : ''}`}>
      {/* 1. Integrated Header Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-[#0F1117] border border-white/[0.07] shadow-xl backdrop-blur-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Left: Engine Switcher & Voiceover Quick Selector */}
          <div className="flex flex-wrap items-center gap-2 max-w-full">
            {/* Engine Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#090A0E] border border-white/[0.05] overflow-x-auto scrollbar-none">
              {/* AniLibria Tab */}
              {probeData?.results?.anilibria?.available && (
                <button
                  type="button"
                  onClick={() => handleEngineSelect('anilibria')}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    effectiveEngine === 'anilibria'
                      ? 'bg-indigo-600 text-white shadow-md font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5 text-cyan-300" />
                  <span>AniLibria</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-cyan-200 font-mono">
                    1080p FHD
                  </span>
                </button>
              )}

              {/* Kodik Tab */}
              <button
                type="button"
                onClick={() => handleEngineSelect('kodik')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  effectiveEngine === 'kodik'
                    ? 'bg-indigo-600 text-white shadow-md font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <Play className="w-3.5 h-3.5 text-indigo-300 fill-indigo-300/30" />
                <span>Kodik</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/10 text-zinc-300 font-mono">
                  720p / 1080p
                </span>
              </button>

              {/* Alloha Tab */}
              <button
                type="button"
                onClick={() => handleEngineSelect('alloha')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  effectiveEngine === 'alloha'
                    ? 'bg-indigo-600 text-white shadow-md font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
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
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    effectiveEngine === 'collaps'
                      ? 'bg-indigo-600 text-white shadow-md font-semibold'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Collaps</span>
                </button>
              )}

              {/* Multi-Dub Tab */}
              <button
                type="button"
                onClick={() => handleEngineSelect('multidub')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  effectiveEngine === 'multidub'
                    ? 'bg-indigo-600 text-white shadow-md font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]'
                }`}
              >
                <Globe className="w-3.5 h-3.5 text-slate-300" />
                <span>Multi-Dub</span>
              </button>
            </div>

            {/* Compact Voiceover Dropdown Selector (Unified Inside Player Bar) */}
            {currentTranslations.length > 0 && effectiveEngine !== 'multidub' && (
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setShowVoiceoverDropdown((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#090A0E] hover:bg-white/[0.06] border border-white/[0.08] text-xs font-medium text-zinc-200 transition-all shadow-sm cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-zinc-400 hidden sm:inline">Озвучка:</span>
                  <span className="max-w-[140px] sm:max-w-[180px] truncate text-white font-semibold">
                    {activeTranslation?.teamName || 'По умолчанию'}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${showVoiceoverDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Floating Studio Selection Popover */}
                {showVoiceoverDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 p-3 rounded-2xl bg-[#12141C] border border-white/10 shadow-2xl z-50 space-y-2.5 backdrop-blur-xl animate-in fade-in zoom-in-95">
                    <div className="flex items-center justify-between gap-2 border-b border-white/[0.06] pb-2">
                      <span className="text-xs font-semibold text-white">Выбор студии озвучки</span>
                      <div className="flex items-center gap-1 bg-[#090A0E] p-0.5 rounded-lg border border-white/[0.05] text-[10px]">
                        <button
                          type="button"
                          onClick={() => setFilterType('all')}
                          className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                            filterType === 'all' ? 'bg-white/15 text-white font-medium' : 'text-zinc-400'
                          }`}
                        >
                          Все ({currentTranslations.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilterType('dub')}
                          className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                            filterType === 'dub' ? 'bg-white/15 text-white font-medium' : 'text-zinc-400'
                          }`}
                        >
                          Дубляж
                        </button>
                        <button
                          type="button"
                          onClick={() => setFilterType('sub')}
                          className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                            filterType === 'sub' ? 'bg-white/15 text-white font-medium' : 'text-zinc-400'
                          }`}
                        >
                          Субтитры
                        </button>
                      </div>
                    </div>

                    {/* Search Field if many translations */}
                    {currentTranslations.length > 6 && (
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="text"
                          placeholder="Поиск студии..."
                          value={voiceoverSearch}
                          onChange={(e) => setVoiceoverSearch(e.target.value)}
                          className="w-full bg-[#090A0E] border border-white/[0.08] rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/60"
                        />
                      </div>
                    )}

                    {/* Studio Items List */}
                    <div className="max-h-56 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                      {filteredTranslations.length === 0 ? (
                        <p className="text-center text-xs text-zinc-500 py-3">Студии не найдены</p>
                      ) : (
                        filteredTranslations.map((tr) => {
                          const isSelected = tr.id === activeTranslation?.id;
                          return (
                            <button
                              key={tr.id}
                              type="button"
                              onClick={() => {
                                setActiveTranslation(tr);
                                setShowVoiceoverDropdown(false);
                                setIframeKey((k) => k + 1);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-600/20 text-white font-semibold border border-indigo-500/40'
                                  : 'text-zinc-300 hover:bg-white/[0.06] hover:text-white'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                {isSelected ? (
                                  <Check className="w-3.5 h-3.5 text-indigo-400" />
                                ) : (
                                  <div className="w-3.5 h-3.5 rounded-full border border-zinc-700" />
                                )}
                                <span className="truncate max-w-[180px]">{tr.teamName}</span>
                              </div>
                              {tr.type === 'sub' && (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                                  SUB
                                </span>
                              )}
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Quick Action Controls */}
          <div className="flex items-center gap-2">
            {/* Mirror Switcher for Kodik */}
            {effectiveEngine === 'kodik' && (
              <div className="hidden sm:flex items-center gap-1 bg-[#090A0E] p-1 rounded-lg border border-white/[0.05] text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMirror(0);
                    setIframeKey((k) => k + 1);
                  }}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    selectedMirror === 0
                      ? 'bg-white/15 text-white font-medium'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Зеркало 1
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMirror(1);
                    setIframeKey((k) => k + 1);
                  }}
                  className={`px-2 py-1 rounded-md transition-all cursor-pointer ${
                    selectedMirror === 1
                      ? 'bg-white/15 text-white font-medium'
                      : 'text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  Зеркало 2
                </button>
              </div>
            )}

            {/* Keyboard Hotkeys Popover Toggle */}
            <button
              type="button"
              onClick={() => setShowHotkeys((prev) => !prev)}
              title="Горячие клавиши (хоткеи)"
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 transition-all border border-white/[0.05] cursor-pointer"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Refresh Probes Button */}
            <button
              type="button"
              onClick={() => {
                refresh();
                setIframeKey((k) => k + 1);
              }}
              title="Обновить плеер"
              className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-zinc-400 hover:text-zinc-200 transition-all border border-white/[0.05] cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>

            {/* Theater Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsTheaterMode((prev) => !prev)}
              title={isTheaterMode ? 'Выйти из режима кинотеатра (Esc)' : 'Режим кинотеатра (T)'}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                isTheaterMode
                  ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border-white/[0.05]'
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

      {/* 2. Main Cinema Player Stage */}
      <div className={`relative w-full aspect-video min-h-[400px] sm:min-h-[460px] rounded-2xl overflow-hidden bg-[#07080B] border border-white/[0.08] shadow-2xl transition-all ${isTheaterMode ? 'flex-1 max-h-[85vh]' : ''}`}>
        {isDirectHls ? (
          <div ref={containerRef} className="w-full h-full" />
        ) : (
          <iframe
            ref={playerIframeRef}
            key={`${activeStreamUrl}-${iframeKey}`}
            src={activeStreamUrl || ''}
            title={title ? `Плеер для ${title}` : 'Видео-плеер'}
            referrerPolicy="no-referrer-when-downgrade"
            allow="autoplay *; fullscreen *; encrypted-media *; picture-in-picture *; clipboard-write *"
            frameBorder="0"
            scrolling="no"
            allowFullScreen
            className="w-full h-full border-0 rounded-2xl z-10 relative"
          />
        )}
      </div>

      {/* 3. Bottom Info & Shortcuts Helper */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#0F1117] border border-white/[0.05] text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-zinc-300 font-medium">
            Плеер: <strong className="text-white">{BALANCER_CONFIG[effectiveEngine]?.label || 'Full HD Stream'}</strong> • Серия #{episodeNumber}
          </span>
          {activeTranslation && (
            <span className="hidden md:inline-block text-zinc-400 font-medium">
              • Озвучка: <span className="text-indigo-300">{activeTranslation.teamName}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-zinc-400 text-[11px]">
          <div className="flex items-center gap-1.5 text-zinc-400">
            <Info className="w-3.5 h-3.5 text-indigo-400" />
            <span>Озвучку и сезон можно менять как в меню выше, так и внутри самого плеера</span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-zinc-500 font-mono text-[10px]">
            <span className="bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.05]">T: Театр</span>
            <span className="bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.05]">F: Экран</span>
            <span className="bg-white/[0.05] px-1.5 py-0.5 rounded border border-white/[0.05]">M: Звук</span>
          </div>
        </div>
      </div>

      {/* 4. Hotkeys Modal */}
      {showHotkeys && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#12141C] border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Keyboard className="w-4 h-4 text-indigo-400" />
                <h3 className="font-semibold text-white text-sm">Горячие клавиши</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHotkeys(false)}
                className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-zinc-300">
              <div className="flex items-center justify-between py-1 border-b border-white/[0.05]">
                <span>Пауза / Воспроизведение</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-white">Space / K</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/[0.05]">
                <span>Полный экран</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-white">F</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/[0.05]">
                <span>Режим кинотеатра</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-white">T</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/[0.05]">
                <span>Выключить / Включить звук</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-white">M</kbd>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-white/[0.05]">
                <span>Перемотка ± 5 сек</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-white">← / →</kbd>
              </div>
              <div className="flex items-center justify-between py-1">
                <span>Громкость ± 10%</span>
                <kbd className="px-2 py-0.5 rounded bg-white/10 font-mono text-[11px] text-white">↑ / ↓</kbd>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
