import { AnimeProbeRequest, AnimeProbeResponse } from '@/types/balancer';
import { balancerCache } from './balancer-cache';

export class ClientBalancerProber {
  static async probe(req: AnimeProbeRequest, forceRefresh = false): Promise<AnimeProbeResponse> {
    if (!forceRefresh) {
      const cached = balancerCache.get(req.animeId, req.episodeNumber);
      if (cached) {
        return cached;
      }
    }

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 6000);

      const res = await fetch('/api/balancer/probe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok) {
        const data: AnimeProbeResponse = await res.json();
        balancerCache.set(req.animeId, req.episodeNumber, data, 1800000);
        return data;
      }
    } catch (err) {
      console.warn('[ClientBalancerProber] Server probe failed:', err);
    }

    return {
      animeId: req.animeId,
      episodeNumber: req.episodeNumber,
      results: {
        anilibria: { balancerId: 'anilibria', name: 'AniLibria', icon: '⚡', available: false, latencyMs: 0, translations: [], probedAt: Date.now() },
        kodik: { balancerId: 'kodik', name: 'Kodik', icon: '🌌', available: false, latencyMs: 0, translations: [], probedAt: Date.now() },
        alloha: { balancerId: 'alloha', name: 'Alloha', icon: '✨', available: false, latencyMs: 0, translations: [], probedAt: Date.now() },
        collaps: { balancerId: 'collaps', name: 'Collaps', icon: '⚡', available: false, latencyMs: 0, translations: [], probedAt: Date.now() },
        sibnet: { balancerId: 'sibnet', name: 'Sibnet', icon: '📼', available: false, latencyMs: 0, translations: [], probedAt: Date.now() },
        lumex: { balancerId: 'lumex', name: 'Lumex', icon: '🔮', available: false, latencyMs: 0, translations: [], probedAt: Date.now() },
        turbo: { balancerId: 'turbo', name: 'Turbo', icon: '🚀', available: false, latencyMs: 0, translations: [], probedAt: Date.now() },
        veoveo: { balancerId: 'veoveo', name: 'VeoVeo', icon: '🔮', available: false, latencyMs: 0, translations: [], probedAt: Date.now() },
        vibix: { balancerId: 'vibix', name: 'Vibix', icon: '📼', available: false, latencyMs: 0, translations: [], probedAt: Date.now() },
      },
      availableBalancers: [],
      totalTranslationsCount: 0,
      cachedAt: Date.now(),
      ttlMs: 0,
    };
  }
}
