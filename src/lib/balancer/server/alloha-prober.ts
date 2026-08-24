import { SingleBalancerProbeResult, BalancerTranslation } from '@/types/balancer';

const ALLOHA_TOKEN = process.env.ALLOHA_TOKEN || process.env.NEXT_PUBLIC_ALLOHA_TOKEN || '';

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

      // 1. Fast DDBB Balancers Hub Probe (High Availability, 200ms)
      const cleanTitle = params.title
        .replace(/(\[.+?\]|\(.+?\)|:\s*.+?$|\bсезон\s*\d+\b|\b\d+\s*сезон\b|\bseason\s*\d+\b|\bтв-\d+\b|\bфильм\b|—\s*Серия\s*\d+)/gi, '')
        .trim();

      const searchTitles = [cleanTitle, params.title].filter((t, idx, arr) => t && arr.indexOf(t) === idx);

      for (const t of searchTitles) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 2000);

          const ddbbRes = await fetch(`https://p2.ddbb.lol/api/players?title=${encodeURIComponent(t)}`, {
            signal: controller.signal,
            headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
          }).catch(() => null);

          clearTimeout(timeout);

          if (ddbbRes && ddbbRes.ok) {
            const json = await ddbbRes.json().catch(() => ({}));
            const providers: any[] = Array.isArray(json.data) ? json.data : [];
            const allohaProv = providers.find((p) => p.type?.toLowerCase() === 'alloha');

            if (allohaProv && allohaProv.iframeUrl) {
              const baseIframe = allohaProv.iframeUrl;
              const hasQuery = baseIframe.includes('?');
              const mainIframeWithEpisode = hasQuery
                ? `${baseIframe}&episode=${params.episodeNumber}`
                : `${baseIframe}?episode=${params.episodeNumber}`;

              result.translations.push({
                id: `alloha-main-${params.episodeNumber}`,
                balancerId: 'alloha',
                teamName: 'Alloha (Выбор озвучки внутри плеера)',
                type: 'dub',
                quality: ['1080p', '720p'],
                iframeUrl: mainIframeWithEpisode,
                isDirectHls: false,
                episodeNumber: params.episodeNumber,
              });

              if (Array.isArray(allohaProv.translations) && allohaProv.translations.length > 0) {
                for (const tr of allohaProv.translations) {
                  if (!tr.iframeUrl) continue;
                  const trIframe = tr.iframeUrl.includes('?')
                    ? `${tr.iframeUrl}&episode=${params.episodeNumber}`
                    : `${tr.iframeUrl}?episode=${params.episodeNumber}`;

                  result.translations.push({
                    id: `alloha-tr-${tr.id || Math.random().toString(36).substring(7)}-${params.episodeNumber}`,
                    balancerId: 'alloha',
                    teamName: tr.name || 'Alloha Dub',
                    type: /субтитр/i.test(tr.name) ? 'sub' : 'dub',
                    quality: ['1080p', '720p'],
                    iframeUrl: trIframe,
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
          }
        } catch {
          // Continue
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
