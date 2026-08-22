'use client';

type RealTimeEventName =
  | 'comments_updated'
  | 'collections_updated'
  | 'views_updated'
  | 'bookmarks_updated'
  | 'user_updated'
  | 'history_updated';

class RealTimeSyncHub {
  private channel: BroadcastChannel | null = null;
  private listeners: Map<RealTimeEventName, Set<() => void>> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        if ('BroadcastChannel' in window) {
          this.channel = new BroadcastChannel('kuronami_realtime_hub');
          this.channel.onmessage = (event) => {
            const { type } = event.data || {};
            if (type && typeof type === 'string') {
              this.notifyLocal(type as RealTimeEventName);
            }
          };
        }
      } catch (err) {
        console.warn('BroadcastChannel not supported or error:', err);
      }

      // Storage event fallback for cross-tab sync
      window.addEventListener('storage', (e) => {
        if (e.key === 'kuronami_comments') this.notifyLocal('comments_updated');
        else if (e.key === 'kuronami_collections') this.notifyLocal('collections_updated');
        else if (e.key === 'kuronami_anime_views') this.notifyLocal('views_updated');
        else if (e.key === 'kuronami_current_user') this.notifyLocal('user_updated');
      });
    }
  }

  emit(type: RealTimeEventName) {
    this.notifyLocal(type);
    if (this.channel) {
      try {
        this.channel.postMessage({ type, timestamp: Date.now() });
      } catch {}
    }
  }

  on(type: RealTimeEventName, callback: () => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);

    return () => {
      this.listeners.get(type)?.delete(callback);
    };
  }

  private notifyLocal(type: RealTimeEventName) {
    const set = this.listeners.get(type);
    if (set) {
      set.forEach((cb) => {
        try {
          cb();
        } catch (e) {
          console.error(`Error in realtime listener [${type}]:`, e);
        }
      });
    }
  }
}

export const realtimeHub = new RealTimeSyncHub();
