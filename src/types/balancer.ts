import { EpisodeTimecodes } from './index';

export type BalancerId = 'anilibria' | 'kodik' | 'alloha' | 'collaps' | 'lumex' | 'sibnet' | 'turbo' | 'veoveo' | 'vibix';

export type TranslationType = 'dub' | 'sub' | 'raw';

export interface BalancerTranslation {
  id: string;
  balancerId: BalancerId;
  teamName: string;
  type: TranslationType;
  quality: ('1080p' | '720p' | '480p' | '360p')[];
  streamUrl?: string;
  iframeUrl?: string;
  isDirectHls: boolean;
  episodeNumber: number;
  availableEpisodes?: { min: number; max: number };
  timecodes?: EpisodeTimecodes;
  extra?: Record<string, any>;
}

export interface SingleBalancerProbeResult {
  balancerId: BalancerId;
  name: string;
  icon: string;
  available: boolean;
  latencyMs: number;
  translations: BalancerTranslation[];
  error?: string;
  probedAt: number;
}

export interface AnimeProbeRequest {
  animeId: number;
  shikimoriId?: number | null;
  malId?: number | null;
  kinopoiskId?: number | null;
  episodeNumber: number;
  titles: {
    russian?: string | null;
    english?: string | null;
    romaji?: string | null;
    synonyms?: string[];
  };
}

export interface AnimeProbeResponse {
  animeId: number;
  episodeNumber: number;
  results: Record<BalancerId, SingleBalancerProbeResult>;
  availableBalancers: BalancerId[];
  totalTranslationsCount: number;
  cachedAt: number;
  ttlMs: number;
}

export interface BalancerCacheRecord {
  id: string;
  animeId: number;
  episodeNumber: number;
  data: AnimeProbeResponse;
  expiresAt: number;
  updatedAt: number;
}
