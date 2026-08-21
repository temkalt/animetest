import { SingleBalancerProbeResult, BalancerTranslation } from '@/types/balancer';

export class SibnetProber {
  static async probe(params: {
    title: string;
    episodeNumber: number;
    kinopoiskId?: number | null;
  }): Promise<SingleBalancerProbeResult> {
    const startTime = Date.now();
    const result: SingleBalancerProbeResult = {
      balancerId: 'sibnet',
      name: 'Sibnet',
      icon: '📼',
      available: false,
      latencyMs: 0,
      translations: [],
      probedAt: startTime,
    };

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`https://p2.ddbb.lol/api/players?title=${encodeURIComponent(params.title)}${params.kinopoiskId ? `&kinopoisk=${params.kinopoiskId}` : ''}`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      }).catch(() => null);

      clearTimeout(timeout);
      result.latencyMs = Date.now() - startTime;

      if (!res || !res.ok) return result;

      const json = await res.json().catch(() => ({}));
      const providers: any[] = Array.isArray(json.data) ? json.data : [];
      const sibnetProvider = providers.find((p) => p.type?.toLowerCase() === 'sibnet' || p.type?.toLowerCase() === 'vibix');

      if (sibnetProvider?.iframeUrl) {
        result.available = true;
        result.translations.push({
          id: `sibnet-${params.episodeNumber}`,
          balancerId: 'sibnet',
          teamName: 'Sibnet Storage (HD)',
          type: 'dub',
          quality: ['720p', '480p'],
          iframeUrl: sibnetProvider.iframeUrl,
          isDirectHls: false,
          episodeNumber: params.episodeNumber,
        });
      }

      return result;
    } catch (err: any) {
      result.latencyMs = Date.now() - startTime;
      result.error = err?.message || 'Sibnet probe failed';
      return result;
    }
  }
}

export class LumexProber {
  static async probe(params: {
    title: string;
    episodeNumber: number;
    shikimoriId?: number | null;
    kinopoiskId?: number | null;
  }): Promise<SingleBalancerProbeResult> {
    const startTime = Date.now();
    const result: SingleBalancerProbeResult = {
      balancerId: 'lumex',
      name: 'Lumex',
      icon: '🔮',
      available: false,
      latencyMs: 0,
      translations: [],
      probedAt: startTime,
    };

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const res = await fetch(`https://p2.ddbb.lol/api/players?title=${encodeURIComponent(params.title)}${params.kinopoiskId ? `&kinopoisk=${params.kinopoiskId}` : ''}`, {
        signal: controller.signal,
        headers: { 'Accept': 'application/json' },
      }).catch(() => null);

      clearTimeout(timeout);
      result.latencyMs = Date.now() - startTime;

      if (!res || !res.ok) return result;

      const json = await res.json().catch(() => ({}));
      const providers: any[] = Array.isArray(json.data) ? json.data : [];
      const lumexProvider = providers.find((p) => p.type?.toLowerCase() === 'lumex' || p.type?.toLowerCase() === 'veoveo' || p.type?.toLowerCase() === 'turbo');

      if (lumexProvider?.iframeUrl || (lumexProvider?.translations && lumexProvider.translations.length > 0)) {
        result.available = true;
        if (Array.isArray(lumexProvider.translations) && lumexProvider.translations.length > 0) {
          for (const tr of lumexProvider.translations) {
            result.translations.push({
              id: `lumex-tr-${tr.id || Math.random().toString(36).substring(7)}-${params.episodeNumber}`,
              balancerId: 'lumex',
              teamName: tr.name || 'Lumex FastCDN',
              type: 'dub',
              quality: ['1080p', '720p'],
              iframeUrl: tr.iframeUrl,
              isDirectHls: false,
              episodeNumber: params.episodeNumber,
            });
          }
        } else {
          result.translations.push({
            id: `lumex-main-${params.episodeNumber}`,
            balancerId: 'lumex',
            teamName: 'Lumex FastCDN (1080p)',
            type: 'dub',
            quality: ['1080p', '720p'],
            iframeUrl: lumexProvider.iframeUrl,
            isDirectHls: false,
            episodeNumber: params.episodeNumber,
          });
        }
      }

      return result;
    } catch (err: any) {
      result.latencyMs = Date.now() - startTime;
      result.error = err?.message || 'Lumex probe failed';
      return result;
    }
  }
}
