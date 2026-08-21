import { SingleBalancerProbeResult, BalancerTranslation } from '@/types/balancer';

export class CollapsProber {
  static async probe(params: {
    shikimoriId?: number | null;
    kinopoiskId?: number | null;
    title: string;
    episodeNumber: number;
  }): Promise<SingleBalancerProbeResult> {
    const startTime = Date.now();
    const result: SingleBalancerProbeResult = {
      balancerId: 'collaps',
      name: 'Collaps',
      icon: '⚡',
      available: false,
      latencyMs: 0,
      translations: [],
      probedAt: startTime,
    };

    try {
      const searchQueries: string[] = [];
      if (params.kinopoiskId) {
        searchQueries.push(`kinopoisk=${params.kinopoiskId}`);
      }
      if (params.title) {
        searchQueries.push(`title=${encodeURIComponent(params.title)}`);
      }

      for (const query of searchQueries) {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(`https://p2.ddbb.lol/api/players?${query}`, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        }).catch(() => null);

        clearTimeout(timeout);

        if (!res || !res.ok) continue;

        const json = await res.json().catch(() => ({}));
        const providers: any[] = Array.isArray(json.data) ? json.data : [];
        const collapsProvider = providers.find((p) => p.type?.toLowerCase() === 'collaps');

        if (collapsProvider) {
          if (Array.isArray(collapsProvider.translations) && collapsProvider.translations.length > 0) {
            for (const tr of collapsProvider.translations) {
              if (!tr.iframeUrl) continue;
              let iframe = tr.iframeUrl.startsWith('http') ? tr.iframeUrl : `https:${tr.iframeUrl}`;
              if (!iframe.includes('episode=')) {
                const delimiter = iframe.includes('?') ? '&' : '?';
                iframe = `${iframe}${delimiter}episode=${params.episodeNumber}`;
              }
              const cleanName = String(tr.name || 'Collaps HD').replace(/^русский\.\s*/i, '').trim();

              result.translations.push({
                id: `collaps-${tr.id || Math.random().toString(36).substring(7)}-${params.episodeNumber}`,
                balancerId: 'collaps',
                teamName: cleanName || 'Collaps Dub',
                type: /субтитр/i.test(cleanName) ? 'sub' : 'dub',
                quality: ['1080p', '720p', '480p'],
                iframeUrl: iframe,
                isDirectHls: false,
                episodeNumber: params.episodeNumber,
              });
            }
          } else if (collapsProvider.iframeUrl) {
            let iframe = collapsProvider.iframeUrl.startsWith('http')
              ? collapsProvider.iframeUrl
              : `https:${collapsProvider.iframeUrl}`;

            if (!iframe.includes('episode=')) {
              const delimiter = iframe.includes('?') ? '&' : '?';
              iframe = `${iframe}${delimiter}episode=${params.episodeNumber}`;
            }

            result.translations.push({
              id: `collaps-main-${params.episodeNumber}`,
              balancerId: 'collaps',
              teamName: 'Collaps (Full HD)',
              type: 'dub',
              quality: ['1080p', '720p', '480p'],
              iframeUrl: iframe,
              isDirectHls: false,
              episodeNumber: params.episodeNumber,
            });
          }

          if (result.translations.length > 0) {
            result.available = true;
            break;
          }
        }
      }

      result.latencyMs = Date.now() - startTime;
      return result;
    } catch (err: any) {
      result.latencyMs = Date.now() - startTime;
      result.error = err?.message || 'Collaps probe failed';
      return result;
    }
  }
}
