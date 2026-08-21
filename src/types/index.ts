export interface AnimeImageSet {
  original: string;
  medium?: string;
  small?: string;
  banner?: string;
  color?: string;
}

export interface AnimeRelationItem {
  id: number;
  malId?: number;
  relationType: string;
  title: string;
  format: string;
  coverImage: string;
  year?: number;
}

export interface TimecodeRange {
  start: number;
  end: number;
}

export interface EpisodeTimecodes {
  intro?: TimecodeRange;
  outro?: TimecodeRange;
}

export interface VoiceoverTrack {
  id: string;
  provider: 'anilibria' | 'kinobox' | 'kodik' | 'alloha' | 'collaps' | 'turbo' | 'veoveo' | 'vibix' | 'sibnet' | 'lumex' | 'consumet';
  teamName: string;
  type: 'dub' | 'sub' | 'raw';
  language: 'ru' | 'ja' | 'en';
  qualities: ('1080p' | '720p' | '480p')[];
  streamUrl: string;
  isDirectHls: boolean;
  isKinobox?: boolean;
  iframeUrl?: string;
}

export interface EpisodeItem {
  id: string;
  episodeNumber: number;
  title?: string;
  thumbnail?: string;
  durationSeconds?: number;
  isFiller: boolean;
  timecodes: EpisodeTimecodes;
  sources: VoiceoverTrack[];
}

export interface UnifiedAnime {
  id: number; // AniList ID as master key
  malId?: number | null;
  shikimoriId?: number | null;
  kinopoiskId?: number | null;
  anilibriaId?: number | null;
  anilibriaAlias?: string | null;
  slug: string;
  title: {
    romaji: string;
    english: string | null;
    native: string | null;
    russian: string | null;
  };
  synonyms: string[];
  format: 'TV' | 'MOVIE' | 'OVA' | 'ONA' | 'SPECIAL';
  status: 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED';
  season?: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL' | null;
  seasonYear?: number | null;
  episodesTotal?: number | null;
  episodesAired?: number;
  durationMinutes?: number | null;
  coverImage: AnimeImageSet;
  bannerImage?: string | null;
  synopsisRu?: string | null;
  synopsisEn?: string | null;
  score: number; // 0.0 - 10.0
  popularity: number;
  genres: string[];
  studios: string[];
  tags: { id: number; name: string; rank: number }[];
  relations: AnimeRelationItem[];
  nextAiringEpisode?: {
    episode: number;
    airingAt: number;
  } | null;
  episodes?: EpisodeItem[];
}

export interface UserBookmark {
  animeId: number;
  status: 'watching' | 'planned' | 'completed' | 'dropped' | 'on_hold';
  score?: number;
  isFavorite: boolean;
  customFolder?: string;
  updatedAt: string;
}

export interface WatchProgress {
  animeId: number;
  episodeNumber: number;
  currentTimeSeconds: number;
  durationSeconds: number;
  progressPercentage: number;
  isCompleted: boolean;
  teamName?: string;
  updatedAt: string;
}

export interface EpisodeComment {
  id: string;
  episodeId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  parentId?: string | null;
  timecodeSeconds?: number | null;
  content: string;
  isSpoiler: boolean;
  likesCount: number;
  createdAt: string;
  replies?: EpisodeComment[];
}
