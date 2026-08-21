import { SingleBalancerProbeResult, BalancerTranslation } from '@/types/balancer';

const KODIK_API_BASE = 'https://kodik-api.com';
const DEFAULT_KODIK_TOKENS = [
  process.env.KODIK_TOKEN || '',
  process.env.NEXT_PUBLIC_KODIK_TOKEN || '',
  'd4eec67656cc60cedd091081519079a4',
  'q8df784b2c129e924b1dfc2826a79854',
  '18029671cd24d868ad93dcfef5638c4b',
].filter(Boolean);

export class KodikProber {
  static async probe(params: {
    shikimoriId?: number | null;
    malId?: number | null;
    kinopoiskId?: number | null;
    episodeNumber: number;
    title: string;
  }): Promise<SingleBalancerProbeResult> {
    const startTime = Date.now();
    const result: SingleBalancerProbeResult = {
      balancerId: 'kodik',
      name: 'Kodik',
      icon: '🌌',
      available: false,
      latencyMs: 0,
      translations: [],
      probedAt: startTime,
    };

    const shikiId = params.shikimoriId || params.malId;

    try {
      let foundItems: any[] = [];

      for (const token of DEFAULT_KODIK_TOKENS) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 2500);

          const searchParams = new URLSearchParams({
            token,
            with_material_data: 'true',
            with_episodes: 'true',
            limit: '50',
          });

          if (shikiId) {
            searchParams.append('shikimori_id', String(shikiId));
          } else if (params.kinopoiskId) {
            searchParams.append('kinopoisk_id', String(params.kinopoiskId));
          } else if (params.title) {
            searchParams.append('title', params.title);
          }

          const res = await fetch(`${KODIK_API_BASE}/search?${searchParams.toString()}`, {
            signal: controller.signal,
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
              'Accept': 'application/json',
            },
          }).catch(() => null);

          clearTimeout(timeout);

          if (res && res.ok) {
            const json = await res.json().catch(() => ({}));
            if (Array.isArray(json.results) && json.results.length > 0) {
              foundItems = json.results;
              break;
            }
          }
        } catch {
          // Try next token
        }
      }

      result.latencyMs = Date.now() - startTime;

      if (foundItems.length === 0) {
        // Fallback: if we have shikimoriId or title, Kodik embed finder works reliably
        if (shikiId || params.title) {
          result.available = true;
          const embedUrl = shikiId
            ? `https://kodikplayer.com/find-player?shikimoriID=${shikiId}&episode=${params.episodeNumber}`
            : `https://kodikplayer.com/find-player?title=${encodeURIComponent(params.title)}&episode=${params.episodeNumber}`;

          result.translations.push({
            id: `kodik-auto-${shikiId || 'title'}-${params.episodeNumber}`,
            balancerId: 'kodik',
            teamName: 'Kodik (Все доступные озвучки)',
            type: 'dub',
            quality: ['1080p', '720p', '480p'],
            iframeUrl: embedUrl,
            isDirectHls: false,
            episodeNumber: params.episodeNumber,
          });
        }
        return result;
      }

      const seenTranslations = new Set<string>();

      for (const item of foundItems) {
        const lastEp = item.last_episode || item.episodes_count || 1;
        const translationTitle = item.translation?.title || 'Оригинал / Субтитры';
        const translationType = item.translation?.type === 'subtitles' ? 'sub' : 'dub';
        const translationKey = `${item.translation?.id || 'def'}-${translationTitle}`;

        if (seenTranslations.has(translationKey)) continue;
        seenTranslations.add(translationKey);

        let iframeLink = item.link || '';
        if (iframeLink && !iframeLink.startsWith('http')) {
          iframeLink = `https:${iframeLink}`;
        }
        if (iframeLink) {
          // Replace inactive domains with active mirror
          iframeLink = iframeLink.replace(/kodik\.info|kodik\.cc|aniqit\.com/gi, 'kodikplayer.com');
          if (!iframeLink.includes('episode=')) {
            const delim = iframeLink.includes('?') ? '&' : '?';
            iframeLink = `${iframeLink}${delim}episode=${params.episodeNumber}`;
          }
        }

        result.translations.push({
          id: `kodik-${item.id || item.translation?.id || Math.random().toString(36).substring(7)}-${params.episodeNumber}`,
          balancerId: 'kodik',
          teamName: translationTitle,
          type: translationType,
          quality: ['1080p', '720p', '480p'],
          iframeUrl: iframeLink,
          isDirectHls: false,
          episodeNumber: params.episodeNumber,
          availableEpisodes: { min: 1, max: lastEp },
        });
      }

      result.available = result.translations.length > 0;
      return result;
    } catch (err: any) {
      result.latencyMs = Date.now() - startTime;
      result.error = err?.message || 'Kodik probe failed';
      return result;
    }
  }
}
