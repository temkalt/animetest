import Dexie, { type EntityTable } from 'dexie';

export interface LocalWatchProgress {
  id: string; // [animeId-episodeNumber]
  animeId: number;
  episodeNumber: number;
  currentTimeSeconds: number;
  durationSeconds: number;
  progressPercentage: number;
  isCompleted: boolean;
  teamName?: string;
  updatedAt: string;
  synced: boolean;
}

export interface LocalBookmarkItem {
  animeId: number;
  status: 'watching' | 'planned' | 'completed' | 'dropped' | 'on_hold';
  score?: number;
  isFavorite: boolean;
  customFolder?: string;
  updatedAt: string;
  synced: boolean;
}

export class AnimeLocalDatabase extends Dexie {
  watchHistory!: EntityTable<LocalWatchProgress, 'id'>;
  bookmarks!: EntityTable<LocalBookmarkItem, 'animeId'>;

  constructor() {
    super('KuroNamiLocalDB');
    this.version(1).stores({
      watchHistory: '&id, animeId, episodeNumber, synced, updatedAt',
      bookmarks: '&animeId, status, isFavorite, synced, updatedAt',
    });
  }
}

export const localDB = new AnimeLocalDatabase();
