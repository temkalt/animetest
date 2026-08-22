// Re-export all Balancer engine types
export * from './balancer';

export interface AnimeImageSet {
  original: string;
  extraLarge?: string;
  large?: string;
  medium?: string;
  small?: string;
  preview?: string;
  banner?: string;
  color?: string;
}

export type AnimeRelationType =
  | 'ADAPTATION'
  | 'PREQUEL'
  | 'SEQUEL'
  | 'PARENT'
  | 'SIDE_STORY'
  | 'CHARACTER'
  | 'SUMMARY'
  | 'ALTERNATIVE'
  | 'SPIN_OFF'
  | 'OTHER'
  | string;

export interface AnimeRelationItem {
  id: number;
  malId?: number;
  relationType: AnimeRelationType;
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

export type VoiceoverProvider =
  | 'anilibria'
  | 'kinobox'
  | 'kodik'
  | 'alloha'
  | 'collaps'
  | 'turbo'
  | 'veoveo'
  | 'vibix'
  | 'sibnet'
  | 'lumex'
  | 'consumet';

export type VoiceoverType = 'dub' | 'sub' | 'raw';
export type VoiceoverLanguage = 'ru' | 'ja' | 'en';
export type VideoQuality = '1080p' | '720p' | '480p' | '360p';

export interface VoiceoverTrack {
  id: string;
  provider: VoiceoverProvider;
  teamName: string;
  type: VoiceoverType;
  language: VoiceoverLanguage;
  qualities: VideoQuality[];
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

export type AnimeFormat = 'TV' | 'TV_SHORT' | 'MOVIE' | 'SPECIAL' | 'OVA' | 'ONA' | 'MUSIC' | string;
export type AnimeStatus = 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS' | string;
export type AnimeSeason = 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL';

export interface AnimeTag {
  id: number;
  name: string;
  rank?: number;
  category?: string;
  isGeneralSpoiler?: boolean;
  isMediaSpoiler?: boolean;
  isAdult?: boolean;
}

export interface NextAiringEpisode {
  episode: number;
  airingAt: number;
  timeUntilAiring?: number;
}

export interface UnifiedAnimeTitle {
  romaji: string;
  english: string | null;
  native: string | null;
  russian: string | null;
  userPreferred?: string | null;
}

export interface UnifiedAnime {
  id: number; // AniList ID as master key
  malId?: number | null;
  shikimoriId?: number | null;
  kinopoiskId?: number | null;
  anilibriaId?: number | null;
  anilibriaAlias?: string | null;
  slug: string;
  title: UnifiedAnimeTitle;
  synonyms: string[];
  format: AnimeFormat;
  status: AnimeStatus;
  season?: AnimeSeason | null;
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
  tags: AnimeTag[];
  relations: AnimeRelationItem[];
  nextAiringEpisode?: NextAiringEpisode | null;
  episodes?: EpisodeItem[];
}

export type BookmarkStatus = 'watching' | 'planned' | 'completed' | 'dropped' | 'on_hold';

export interface UserBookmark {
  animeId: number;
  status: BookmarkStatus;
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

export interface ScheduleItem {
  id: number;
  title: string;
  episode: number;
  airingAt: number;
  timeStr: string;
  coverImage: string;
  format: string;
  studio?: string;
}

export type WeeklySchedule = {
  [dayOfWeek: number]: ScheduleItem[];
};

export interface CatalogPaginationInfo {
  total: number;
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  perPage?: number;
}

export interface CatalogSearchResult {
  items: UnifiedAnime[];
  pageInfo: CatalogPaginationInfo;
}

export interface CatalogFilterParams {
  page?: number;
  perPage?: number;
  genre?: string;
  status?: string;
  format?: string;
  season?: AnimeSeason | string;
  seasonYear?: number;
  search?: string;
  sort?: string[];
}

export interface UserCollection {
  id: string;
  userId: string;
  username: string;
  title: string;
  description: string;
  coverImage?: string;
  isPublic: boolean;
  animeIds: number[];
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface GlobalComment {
  id: string;
  animeId: number;
  animeTitle: string;
  animeCover: string;
  episodeNumber?: number;
  userId: string;
  username: string;
  userAvatar: string;
  content: string;
  timecodeSeconds?: number | null;
  isSpoiler: boolean;
  likesCount: number;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  username: string; // unique slug
  name: string;
  email: string; // private, never displayed in public profile
  avatar: string;
  banner?: string;
  bio?: string;
  role: string;
  level: number;
  joinedAt: string;
  collectionsCount?: number;
}
