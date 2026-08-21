import { AnimeProbeResponse } from '@/types/balancer';

class BalancerCacheManager {
  private memoryCache = new Map<string, { data: AnimeProbeResponse; expiresAt: number }>();

  private getKey(animeId: number, episodeNumber: number): string {
    return `${animeId}-${episodeNumber}`;
  }

  get(animeId: number, episodeNumber: number): AnimeProbeResponse | null {
    const key = this.getKey(animeId, episodeNumber);
    const now = Date.now();
    const mem = this.memoryCache.get(key);
    if (mem && mem.expiresAt > now) {
      return mem.data;
    }
    return null;
  }

  set(animeId: number, episodeNumber: number, data: AnimeProbeResponse, ttlMs = 1800000): void {
    const key = this.getKey(animeId, episodeNumber);
    const now = Date.now();
    this.memoryCache.set(key, { data, expiresAt: now + ttlMs });
  }
}

export const balancerCache = new BalancerCacheManager();
