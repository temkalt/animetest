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
        if (!term || term.length < 2 || tried.has(term.toLowerCase())) continue;
        tried.add(term.toLowerCase());

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(
          `https://anilibria.top/api/v1/anime/catalog/releases?f[search]=${encodeURIComponent(term)}&limit=10`,
          {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
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
            cleanSearch.length > 2 &&
            (mainRu === cleanSearch ||
              eng === cleanSearch ||
              alt === cleanSearch ||
              mainRu.includes(cleanSearch) ||
              cleanSearch.includes(mainRu) ||
              eng.includes(cleanSearch) ||
              cleanSearch.includes(eng));

          if (isMatch || releases.length === 1) {
            const ctrl = new AbortController();
            const to = setTimeout(() => ctrl.abort(), 3500);

            const fullRes = await fetch(`https://anilibria.top/api/v1/anime/releases/${rel.id}`, {
              signal: ctrl.signal,
              headers: { 'Accept': 'application/json' },
            }).catch(() => null);

            clearTimeout(to);
            if (!fullRes || !fullRes.ok) continue;

            const fullData = await fullRes.json().catch(() => null);
            const episodes: any[] = fullData?.episodes || [];
            const ep =
              episodes.find((e: any) => e.ordinal === params.episodeNumber || Number(e.ordinal) === params.episodeNumber) ||
              episodes[params.episodeNumber - 1];

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
                  availableEpisodes: { min: 1, max: episodes.length || 1 },
                  timecodes: {
                    intro:
                      ep.opening?.start !== null && ep.opening?.start !== undefined && ep.opening?.stop !== null && ep.opening?.stop !== undefined
                        ? { start: Number(ep.opening.start), end: Number(ep.opening.stop) }
                        : undefined,
                    outro:
                      ep.ending?.start !== null && ep.ending?.start !== undefined && ep.ending?.stop !== null && ep.ending?.stop !== undefined
                        ? { start: Number(ep.ending.start), end: Number(ep.ending.stop) }
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
