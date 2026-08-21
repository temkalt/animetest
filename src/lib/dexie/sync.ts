import { localDB, LocalWatchProgress, LocalBookmarkItem } from './db';

class LocalFirstSyncManager {
  private syncTimer: NodeJS.Timeout | null = null;
  private debounceMs = 3000;

  async saveWatchProgress(data: Omit<LocalWatchProgress, 'id' | 'synced' | 'updatedAt'>) {
    const id = `${data.animeId}-${data.episodeNumber}`;
    const record: LocalWatchProgress = {
      ...data,
      id,
      updatedAt: new Date().toISOString(),
      synced: false,
    };

    await localDB.watchHistory.put(record);
    this.scheduleDebouncedSync();
  }

  async getWatchProgress(animeId: number, episodeNumber: number): Promise<LocalWatchProgress | undefined> {
    const id = `${animeId}-${episodeNumber}`;
    return localDB.watchHistory.get(id);
  }

  async getAllAnimeProgress(animeId: number): Promise<LocalWatchProgress[]> {
    return localDB.watchHistory.where('animeId').equals(animeId).toArray();
  }

  async getRecentHistory(limit = 10): Promise<LocalWatchProgress[]> {
    return localDB.watchHistory.orderBy('updatedAt').reverse().limit(limit).toArray();
  }

  async setBookmark(bookmark: Omit<LocalBookmarkItem, 'synced' | 'updatedAt'>) {
    const record: LocalBookmarkItem = {
      ...bookmark,
      updatedAt: new Date().toISOString(),
      synced: false,
    };

    await localDB.bookmarks.put(record);
    this.scheduleDebouncedSync();
  }

  async getBookmark(animeId: number): Promise<LocalBookmarkItem | undefined> {
    return localDB.bookmarks.get(animeId);
  }

  async getAllBookmarks(): Promise<LocalBookmarkItem[]> {
    return localDB.bookmarks.toArray();
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
    if (typeof window === 'undefined' || !navigator.onLine) return;

    try {
      const unsyncedHistory = await localDB.watchHistory.where('synced').equals(0 as any).toArray();
      const unsyncedBookmarks = await localDB.bookmarks.where('synced').equals(0 as any).toArray();

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
    } catch {
      // Offline mode: silently defer sync
    }
  }
}

export const syncManager = new LocalFirstSyncManager();
