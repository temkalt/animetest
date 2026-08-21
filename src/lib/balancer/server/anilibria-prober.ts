import { SingleBalancerProbeResult, BalancerTranslation } from '@/types/balancer';

export class AniLibriaProber {
  private static cleanTitle(text: string): string {
    return text
      .toLowerCase()
      .replace(/(\[.+?\]|\(.+?\)|:\s*.+?$|\bсезон\s*\d+\b|\b\d+\s*сезон\b|\bseason\s*\d+\b|\b\d+(st|nd|rd|th)\s*season\b|\bфильм\b|\bтв-\d+\b|\bчасть\s*\d+\b)/gi, '')
      .replace(/[\(\)\[\]\{\}\:\;\,\.\!\?\-\_\'\"\`]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  static async probe(params: {
    episodeNumber: number;
    titles: {
      russian?: string | null;
      english?: string | null;
      romaji?: string | null;
      synonyms?: string[];
    };
  }): Promise<SingleBalancerProbeResult> {
    const startTime = Date.now();
    const result: SingleBalancerProbeResult = {
      balancerId: 'anilibria',
      name: 'AniLibria',
      icon: '⚡',
      available: false,
      latencyMs: 0,
      translations: [],
      probedAt: startTime,
    };

    try {
      const candidates: string[] = [];
      if (params.titles.russian) candidates.push(params.titles.russian);
      if (params.titles.english) candidates.push(params.titles.english);
      if (params.titles.romaji) candidates.push(params.titles.romaji);
      if (params.titles.synonyms) candidates.push(...params.titles.synonyms);

      const tried = new Set<string>();

      for (const query of candidates) {
        const term = query.trim();
        if (!term || term.length < 3 || tried.has(term.toLowerCase())) continue;
        tried.add(term.toLowerCase());

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(
          `https://anilibria.top/api/v1/anime/catalog/releases?f[search]=${encodeURIComponent(term)}&limit=5`,
          {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            },
          }
        ).catch(() => null);

        clearTimeout(timeout);
        if (!res || !res.ok) continue;

        const data = await res.json().catch(() => null);
        const releases: any[] = data?.data || [];

        for (const rel of releases) {
          const cleanSearch = this.cleanTitle(term);
          const mainRu = this.cleanTitle(rel.name?.main || '');
          const eng = this.cleanTitle(rel.name?.english || '');
          const alt = this.cleanTitle(rel.name?.alternative || '');

          const isMatch =
            mainRu === cleanSearch ||
            eng === cleanSearch ||
            alt === cleanSearch ||
            mainRu.includes(cleanSearch) ||
            cleanSearch.includes(mainRu) ||
            eng.includes(cleanSearch) ||
            cleanSearch.includes(eng);

          if (isMatch) {
            const fullRes = await fetch(`https://anilibria.top/api/v1/anime/releases/${rel.id}`).catch(() => null);
            if (!fullRes || !fullRes.ok) continue;

            const fullData = await fullRes.json().catch(() => null);
            const ep = fullData?.episodes?.find((e: any) => e.ordinal === params.episodeNumber);

            if (ep) {
              const hlsUrl = ep.hls_1080 || ep.hls_720 || ep.hls_480;
              if (hlsUrl) {
                result.translations.push({
                  id: `anilibria-${rel.id}-${params.episodeNumber}`,
                  balancerId: 'anilibria',
                  teamName: 'AniLibria (Direct 1080p HLS)',
                  type: 'dub',
                  quality: ['1080p', '720p', '480p'],
                  streamUrl: hlsUrl,
                  isDirectHls: true,
                  episodeNumber: params.episodeNumber,
                  timecodes: {
                    intro:
                      ep.opening?.start !== null && ep.opening?.stop !== null
                        ? { start: ep.opening.start, end: ep.opening.stop }
                        : undefined,
                    outro:
                      ep.ending?.start !== null && ep.ending?.stop !== null
                        ? { start: ep.ending.start, end: ep.ending.stop }
                        : undefined,
                  },
                });

                result.available = true;
                result.latencyMs = Date.now() - startTime;
                return result;
              }
            }
          }
        }
      }

      result.latencyMs = Date.now() - startTime;
      return result;
    } catch (err: any) {
      result.latencyMs = Date.now() - startTime;
      result.error = err?.message || 'AniLibria probe failed';
      return result;
    }
  }
}
