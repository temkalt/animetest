import {
  AnimeProbeRequest,
  AnimeProbeResponse,
  BalancerId,
  SingleBalancerProbeResult,
} from '@/types/balancer';
import { KodikProber } from './kodik-prober';
import { AllohaProber } from './alloha-prober';
import { CollapsProber } from './collaps-prober';
import { AniLibriaProber } from './anilibria-prober';
import { SibnetProber, LumexProber } from './sibnet-prober';

// In-Memory Server Cache with 30-min TTL
const serverCache = new Map<string, { data: AnimeProbeResponse; expiresAt: number }>();

export class BalancerProbeEngine {
  static async probeAll(req: AnimeProbeRequest): Promise<AnimeProbeResponse> {
    const cacheKey = `${req.animeId}-${req.episodeNumber}`;
    const cached = serverCache.get(cacheKey);

    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const mainTitle = req.titles.russian || req.titles.romaji || req.titles.english || '';

    // Run all balancer probers concurrently with isolated try-catches
    const [kodikRes, allohaRes, collapsRes, anilibriaRes, sibnetRes, lumexRes] =
      await Promise.allSettled([
        KodikProber.probe({
          shikimoriId: req.shikimoriId,
          malId: req.malId,
          kinopoiskId: req.kinopoiskId,
          episodeNumber: req.episodeNumber,
          title: mainTitle,
        }),
        AllohaProber.probe({
          shikimoriId: req.shikimoriId,
          kinopoiskId: req.kinopoiskId,
          title: mainTitle,
          episodeNumber: req.episodeNumber,
        }),
        CollapsProber.probe({
          shikimoriId: req.shikimoriId,
          kinopoiskId: req.kinopoiskId,
          title: mainTitle,
          episodeNumber: req.episodeNumber,
        }),
        AniLibriaProber.probe({
          episodeNumber: req.episodeNumber,
          titles: req.titles,
        }),
        SibnetProber.probe({
          title: mainTitle,
          episodeNumber: req.episodeNumber,
          kinopoiskId: req.kinopoiskId,
        }),
        LumexProber.probe({
          title: mainTitle,
          episodeNumber: req.episodeNumber,
          shikimoriId: req.shikimoriId,
          kinopoiskId: req.kinopoiskId,
        }),
      ]);

    const defaultResult = (id: BalancerId, name: string, icon: string): SingleBalancerProbeResult => ({
      balancerId: id,
      name,
      icon,
      available: false,
      latencyMs: 0,
      translations: [],
      probedAt: Date.now(),
    });

    const results: Record<BalancerId, SingleBalancerProbeResult> = {
      anilibria: anilibriaRes.status === 'fulfilled' ? anilibriaRes.value : defaultResult('anilibria', 'AniLibria', '⚡'),
      kodik: kodikRes.status === 'fulfilled' ? kodikRes.value : defaultResult('kodik', 'Kodik', '🌌'),
      alloha: allohaRes.status === 'fulfilled' ? allohaRes.value : defaultResult('alloha', 'Alloha', '✨'),
      collaps: collapsRes.status === 'fulfilled' ? collapsRes.value : defaultResult('collaps', 'Collaps', '⚡'),
      sibnet: sibnetRes.status === 'fulfilled' ? sibnetRes.value : defaultResult('sibnet', 'Sibnet', '📼'),
      lumex: lumexRes.status === 'fulfilled' ? lumexRes.value : defaultResult('lumex', 'Lumex', '🔮'),
      turbo: defaultResult('turbo', 'Turbo', '🚀'),
      veoveo: defaultResult('veoveo', 'VeoVeo', '🔮'),
      vibix: defaultResult('vibix', 'Vibix', '📼'),
    };

    // Filter to strictly available balancers with non-empty translation streams
    const availableBalancers = (Object.keys(results) as BalancerId[]).filter(
      (id) => results[id].available && results[id].translations.length > 0
    );

    let totalTranslationsCount = 0;
    for (const id of availableBalancers) {
      totalTranslationsCount += results[id].translations.length;
    }

    const response: AnimeProbeResponse = {
      animeId: req.animeId,
      episodeNumber: req.episodeNumber,
      results,
      availableBalancers,
      totalTranslationsCount,
      cachedAt: Date.now(),
      ttlMs: 30 * 60 * 1000,
    };

    serverCache.set(cacheKey, {
      data: response,
      expiresAt: Date.now() + response.ttlMs,
    });

    return response;
  }
}
