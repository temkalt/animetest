import { SingleBalancerProbeResult, BalancerTranslation } from '@/types/balancer';

const ALLOHA_TOKEN = process.env.ALLOHA_TOKEN || '5009a7a2d05cb714cc53c8408471e3';

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
        searchQueries.push(`kp=${params.kinopoiskId}`);
      }
      if (params.title) {
        const cleanTitle = params.title
          .replace(/(\[.+?\]|\(.+?\)|:\s*.+?$|\bсезон\s*\d+\b|\b\d+\s*сезон\b|\bseason\s*\d+\b|\bтв-\d+\b|\bфильм\b)/gi, '')
          .trim();

        searchQueries.push(`name=${encodeURIComponent(params.title)}`);
        if (cleanTitle && cleanTitle !== params.title) {
          searchQueries.push(`name=${encodeURIComponent(cleanTitle)}`);
        }
      }

      // 1. Direct Alloha Official API Probe
      for (const query of searchQueries) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 3000);

          const res = await fetch(`https://api.alloha.tv/?token=${ALLOHA_TOKEN}&${query}`, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            },
          }).catch(() => null);

          clearTimeout(timeout);

          if (!res || !res.ok) continue;

          const json = await res.json().catch(() => ({}));
          if (json.status === 'success' && json.data) {
            const data = json.data;
            const tokenMovie = data.token_movie;
            const mainIframe = data.iframe || `https://theatre.stravers.live/?token_movie=${tokenMovie}&token=${ALLOHA_TOKEN}`;

            // Main Alloha player with full native in-player voiceover switcher
            result.translations.push({
              id: `alloha-main-${params.episodeNumber}`,
              balancerId: 'alloha',
              teamName: 'Alloha (Выбор озвучки внутри плеера)',
              type: 'dub',
              quality: ['1080p', '720p'],
              iframeUrl: mainIframe,
              isDirectHls: false,
              episodeNumber: params.episodeNumber,
            });

            // Also include specific studio iframe URLs if present
            if (data.translation_iframe && typeof data.translation_iframe === 'object') {
              for (const [trId, trInfo] of Object.entries<any>(data.translation_iframe)) {
                if (!trInfo) continue;
                const trName = trInfo.name || trInfo.translation || 'Озвучка Alloha';
                const iframeUrl = trInfo.iframe || `https://theatre.stravers.live/?token_movie=${tokenMovie}&translation=${trId}&token=${ALLOHA_TOKEN}`;

                result.translations.push({
                  id: `alloha-tr-${trId}-${params.episodeNumber}`,
                  balancerId: 'alloha',
                  teamName: trName,
                  type: /субтитр/i.test(trName) ? 'sub' : 'dub',
                  quality: ['1080p', '720p'],
                  iframeUrl,
                  isDirectHls: false,
                  episodeNumber: params.episodeNumber,
                });
              }
            }

            if (result.translations.length > 0) {
              result.available = true;
              result.latencyMs = Date.now() - startTime;
              return result;
            }
          }
        } catch {
          // Continue to next query
        }
      }

      // 2. Fallback to DDBB aggregator
      if (params.kinopoiskId || params.title) {
        const ddbbQuery = params.kinopoiskId ? `kinopoisk=${params.kinopoiskId}` : `title=${encodeURIComponent(params.title)}`;
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 2500);

        const ddbbRes = await fetch(`https://p2.ddbb.lol/api/players?${ddbbQuery}`, {
          signal: controller.signal,
          headers: { 'Accept': 'application/json' },
        }).catch(() => null);

        clearTimeout(timeout);

        if (ddbbRes && ddbbRes.ok) {
          const json = await ddbbRes.json().catch(() => ({}));
          const providers: any[] = Array.isArray(json.data) ? json.data : [];
          const allohaProv = providers.find((p) => p.type?.toLowerCase() === 'alloha');

          if (allohaProv) {
            if (allohaProv.iframeUrl) {
              result.translations.push({
                id: `alloha-ddbb-main-${params.episodeNumber}`,
                balancerId: 'alloha',
                teamName: 'Alloha (Выбор озвучки внутри плеера)',
                type: 'dub',
                quality: ['1080p', '720p'],
                iframeUrl: allohaProv.iframeUrl,
                isDirectHls: false,
                episodeNumber: params.episodeNumber,
              });
            }

            if (Array.isArray(allohaProv.translations) && allohaProv.translations.length > 0) {
              for (const tr of allohaProv.translations) {
                if (!tr.iframeUrl) continue;
                result.translations.push({
                  id: `alloha-ddbb-${tr.id || Math.random().toString(36).substring(7)}-${params.episodeNumber}`,
                  balancerId: 'alloha',
                  teamName: tr.name || 'Alloha Dub',
                  type: /субтитр/i.test(tr.name) ? 'sub' : 'dub',
                  quality: ['1080p', '720p'],
                  iframeUrl: tr.iframeUrl,
                  isDirectHls: false,
                  episodeNumber: params.episodeNumber,
                });
              }
            }

            if (result.translations.length > 0) {
              result.available = true;
            }
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
