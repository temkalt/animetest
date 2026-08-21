import { SingleBalancerProbeResult, BalancerTranslation } from '@/types/balancer';

export class AllohaProber {
  static async probe(params: {
    shikimoriId?: number | null;
    kinopoiskId?: number | null;
    title: string;
    episodeNumber: number;
  }): Promise<SingleBalancerProbeResult> {
    const startTime = Date.now();
    const result: SingleBalancerProbeResult = {
      balancerId: 'alloha',
      name: 'Alloha',
      icon: '✨',
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
        const allohaProvider = providers.find((p) => p.type?.toLowerCase() === 'alloha');

        if (allohaProvider) {
          if (Array.isArray(allohaProvider.translations) && allohaProvider.translations.length > 0) {
            for (const tr of allohaProvider.translations) {
              if (!tr.iframeUrl) continue;
              let iframe = tr.iframeUrl;
              if (!iframe.startsWith('http')) iframe = `https:${iframe}`;

              const cleanName = String(tr.name || 'Alloha HD')
                .replace(/^русский\.\s*/i, '')
                .trim();

              result.translations.push({
                id: `alloha-tr-${tr.id || Math.random().toString(36).substring(7)}-${params.episodeNumber}`,
                balancerId: 'alloha',
                teamName: cleanName || 'Alloha Dub',
                type: /субтитр/i.test(cleanName) ? 'sub' : 'dub',
                quality: ['1080p', '720p'],
                iframeUrl: iframe,
                isDirectHls: false,
                episodeNumber: params.episodeNumber,
              });
            }
          } else if (allohaProvider.iframeUrl) {
            let iframe = allohaProvider.iframeUrl;
            if (!iframe.startsWith('http')) iframe = `https:${iframe}`;

            result.translations.push({
              id: `alloha-main-${params.episodeNumber}`,
              balancerId: 'alloha',
              teamName: 'Alloha (Мульти-озвучка HD)',
              type: 'dub',
              quality: ['1080p', '720p'],
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
      result.error = err?.message || 'Alloha probe failed';
      return result;
    }
  }
}
