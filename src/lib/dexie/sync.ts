import { localDB, LocalWatchProgress, LocalBookmarkItem } from './db';
import { realtimeHub } from '@/lib/utils/realtime';

class LocalFirstSyncManager {
  private syncTimer: NodeJS.Timeout | null = null;
  private debounceMs = 3000;
  private isSyncing = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.flushToServer();
      });
    }
  }

  async saveWatchProgress(data: Omit<LocalWatchProgress, 'id' | 'synced' | 'updatedAt'>) {
    try {
      const id = `${data.animeId}-${data.episodeNumber}`;
      const record: LocalWatchProgress = {
        ...data,
        id,
        updatedAt: new Date().toISOString(),
        synced: false,
      };

      await localDB.watchHistory.put(record);
      realtimeHub.emit('history_updated');
      this.scheduleDebouncedSync();
    } catch (err) {
      console.warn('[SyncManager] Failed to save watch progress locally:', err);
    }
  }

  async getWatchProgress(animeId: number, episodeNumber: number): Promise<LocalWatchProgress | undefined> {
    try {
      const id = `${animeId}-${episodeNumber}`;
      return await localDB.watchHistory.get(id);
    } catch (err) {
      console.warn('[SyncManager] Failed to get watch progress:', err);
      return undefined;
    }
  }

  async getAllAnimeProgress(animeId: number): Promise<LocalWatchProgress[]> {
    try {
      return await localDB.watchHistory.where('animeId').equals(animeId).toArray();
    } catch (err) {
      console.warn('[SyncManager] Failed to get anime progress:', err);
      return [];
    }
  }

  async getRecentHistory(limit = 10): Promise<LocalWatchProgress[]> {
    try {
      return await localDB.watchHistory.orderBy('updatedAt').reverse().limit(limit).toArray();
    } catch (err) {
      console.warn('[SyncManager] Failed to get recent history:', err);
      return [];
    }
  }

  async setBookmark(bookmark: Omit<LocalBookmarkItem, 'synced' | 'updatedAt'>) {
    try {
      const record: LocalBookmarkItem = {
        ...bookmark,
        updatedAt: new Date().toISOString(),
        synced: false,
      };

      await localDB.bookmarks.put(record);
      realtimeHub.emit('bookmarks_updated');
      this.scheduleDebouncedSync();
    } catch (err) {
      console.warn('[SyncManager] Failed to set bookmark locally:', err);
    }
  }

  async getBookmark(animeId: number): Promise<LocalBookmarkItem | undefined> {
    try {
      return await localDB.bookmarks.get(animeId);
    } catch (err) {
      console.warn('[SyncManager] Failed to get bookmark:', err);
      return undefined;
    }
  }

  async removeBookmark(animeId: number) {
    try {
      await localDB.bookmarks.delete(animeId);
      realtimeHub.emit('bookmarks_updated');
      this.scheduleDebouncedSync();
    } catch (err) {
      console.warn('[SyncManager] Failed to remove bookmark locally:', err);
    }
  }

  async getAllBookmarks(): Promise<LocalBookmarkItem[]> {
    try {
      return await localDB.bookmarks.toArray();
    } catch (err) {
      console.warn('[SyncManager] Failed to get all bookmarks:', err);
      return [];
    }
  }

  private scheduleDebouncedSync() {
    if (this.syncTimer) {
      clearTimeout(this.syncTimer);
    }

    this.syncTimer = setTimeout(() => {
      this.flushToServer();
    }, this.debounceMs);
  }

  async flushToServer() {
    if (typeof window === 'undefined') return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;
    if (this.isSyncing) return;

    this.isSyncing = true;

    try {
      const unsyncedHistory = await localDB.watchHistory.filter((x) => !x.synced).toArray();
      const unsyncedBookmarks = await localDB.bookmarks.filter((x) => !x.synced).toArray();

      if (unsyncedHistory.length === 0 && unsyncedBookmarks.length === 0) return;

      const res = await fetch('/api/user/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: unsyncedHistory,
          bookmarks: unsyncedBookmarks,
        }),
      });

      if (res.ok) {
        await localDB.transaction('rw', [localDB.watchHistory, localDB.bookmarks], async () => {
          for (const item of unsyncedHistory) {
            await localDB.watchHistory.update(item.id, { synced: true });
          }
          for (const item of unsyncedBookmarks) {
            await localDB.bookmarks.update(item.animeId, { synced: true });
          }
        });
      }
    } catch (err) {
      // Offline mode or network disruption: silently defer sync without throwing unhandled exceptions
      console.warn('[SyncManager] Deferring sync to server:', err);
    } finally {
      this.isSyncing = false;
    }
  }

  async pullFromServer() {
    if (typeof window === 'undefined') return;
    if (typeof navigator !== 'undefined' && !navigator.onLine) return;

    try {
      const res = await fetch('/api/user/sync');
      if (!res.ok) return;

      const data = await res.json();
      const { history = [], bookmarks = [] } = data;

      await localDB.transaction('rw', [localDB.watchHistory, localDB.bookmarks], async () => {
        for (const item of history) {
          await localDB.watchHistory.put({
            ...item,
            synced: true,
          });
        }
        for (const item of bookmarks) {
          await localDB.bookmarks.put({
            ...item,
            synced: true,
          });
        }
      });
      realtimeHub.emit('history_updated');
      realtimeHub.emit('bookmarks_updated');
    } catch (err) {
      console.warn('[SyncManager] Pull from server skipped / failed:', err);
    }
  }
}

export const syncManager = new LocalFirstSyncManager();
