import { LRUCache } from '@/lib/utils/lru-cache';
import { AnimeProbeResponse } from '@/types/balancer';

class BalancerCacheManager {
  private memoryCache = new LRUCache<string, AnimeProbeResponse>({
    maxSize: 300,
    ttlMs: 1800000,
  });

  private getKey(animeId: number, episodeNumber: number): string {
    return `${animeId}-${episodeNumber}`;
  }

  get(animeId: number, episodeNumber: number): AnimeProbeResponse | null {
    const key = this.getKey(animeId, episodeNumber);
    return this.memoryCache.get(key) || null;
  }

  set(animeId: number, episodeNumber: number, data: AnimeProbeResponse, ttlMs = 1800000): void {
    const key = this.getKey(animeId, episodeNumber);
    this.memoryCache.set(key, data, ttlMs);
  }
}

export const balancerCache = new BalancerCacheManager();
