import { VoiceoverTrack, EpisodeTimecodes } from '@/types';
import { fetchDDBBPlayers, DDBBProvider } from '@/lib/api/ddbb';

export interface DynamicStreamMatch {
  hlsUrl?: string;
  qualities?: ('1080p' | '720p' | '480p')[];
  timecodes?: EpisodeTimecodes;
  episodeTitle?: string;
  duration?: number;
}

export class StreamResolver {
  /**
   * Clean titles for fuzzy matching
   */
  static cleanTitle(text: string): string {
    return text
      .toLowerCase()
      .replace(/(\[.+?\]|\(.+?\)|:\s*.+?$|\bсезон\s*\d+\b|\b\d+\s*сезон\b|\bseason\s*\d+\b|\b\d+(st|nd|rd|th)\s*season\b|\bфильм\b|\bтв-\d+\b|\bчасть\s*\d+\b)/gi, '')
      .replace(/[\(\)\[\]\{\}\:\;\,\.\!\?\-\_\'\"\`]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Build complete multi-player sources list for any anime episode
   */
  static buildSources(params: {
    animeId: number;
    malId?: number | null;
    shikimoriId?: number | null;
    episodeNumber: number;
    titles: {
      russian?: string | null;
      romaji?: string | null;
      english?: string | null;
      synonyms?: string[];
    };
    directHls?: string | null;
    ddbbProviders?: DDBBProvider[];
  }): VoiceoverTrack[] {
    const { animeId, malId, shikimoriId, episodeNumber, titles, directHls, ddbbProviders = [] } = params;
    const shikiId = shikimoriId || malId || animeId;
    const searchTitle = titles.russian || titles.romaji || titles.english || '';
    const cleanSearchTitle = this.cleanTitle(searchTitle);

    const sources: VoiceoverTrack[] = [];

    // 1. ⚡ KuroNami Direct 1080p HLS (AniLibria)
    if (directHls) {
      sources.push({
        id: `anilibria-${animeId}-${episodeNumber}`,
        provider: 'anilibria',
        teamName: 'KuroNami Direct (1080p HLS)',
        type: 'dub',
        language: 'ru',
        qualities: ['1080p', '720p', '480p'],
        streamUrl: directHls,
        isDirectHls: true,
      });
    }

    // 2. 🌌 Kodik Main (Все русские озвучки: Студийная Банда, Dream Cast, SHIZA, AniDUB, Jam Club, Субтитры)
    const kodikMain = `https://kodikplayer.com/find-player?shikimoriID=${shikiId}&title=${encodeURIComponent(cleanSearchTitle)}&episode=${episodeNumber}`;
    sources.push({
      id: `kodik-main-${animeId}-${episodeNumber}`,
      provider: 'kodik',
      teamName: 'Kodik (Мульти-озвучка)',
      type: 'dub',
      language: 'ru',
      qualities: ['1080p', '720p'],
      streamUrl: kodikMain,
      iframeUrl: kodikMain,
      isDirectHls: false,
    });

    // 3. 🎬 Kodik Mirror (kodik.biz)
    const kodikMirror = `https://kodik.biz/find-player?shikimoriID=${shikiId}&title=${encodeURIComponent(cleanSearchTitle)}&episode=${episodeNumber}`;
    sources.push({
      id: `kodik-mirror-${animeId}-${episodeNumber}`,
      provider: 'kodik',
      teamName: 'Kodik Зеркало',
      type: 'dub',
      language: 'ru',
      qualities: ['1080p', '720p'],
      streamUrl: kodikMirror,
      iframeUrl: kodikMirror,
      isDirectHls: false,
    });

    // 4. 🚀 Live Verified DDBB Balancers (Alloha, Turbo, VeoVeo, Collaps)
    for (const provider of ddbbProviders) {
      if (provider.iframeUrl && provider.iframeUrl.startsWith('http')) {
        const providerName = provider.type.toUpperCase();
        sources.push({
          id: `ddbb-${provider.type.toLowerCase()}-${animeId}-${episodeNumber}`,
          provider: provider.type.toLowerCase() as any,
          teamName: `${providerName} (HD)`,
          type: 'dub',
          language: 'ru',
          qualities: ['1080p', '720p'],
          streamUrl: provider.iframeUrl,
          iframeUrl: provider.iframeUrl,
          isDirectHls: false,
        });
      }

      // If provider has translations (e.g. VeoVeo / Alloha with specific studios)
      if (Array.isArray(provider.translations)) {
        for (let i = 0; i < Math.min(provider.translations.length, 4); i++) {
          const tr = provider.translations[i];
          if (tr && tr.iframeUrl && tr.iframeUrl.startsWith('http') && tr.iframeUrl !== provider.iframeUrl) {
            const rawName = String(tr.name || provider.type || 'Озвучка')
              .replace(/^русский\.\s*/i, '')
              .slice(0, 25);
            sources.push({
              id: `ddbb-${provider.type.toLowerCase()}-tr-${i}-${animeId}-${episodeNumber}`,
              provider: provider.type.toLowerCase() as any,
              teamName: `${rawName} (${provider.type})`,
              type: 'dub',
              language: 'ru',
              qualities: ['1080p', '720p'],
              streamUrl: tr.iframeUrl,
              iframeUrl: tr.iframeUrl,
              isDirectHls: false,
            });
          }
        }
      }
    }

    // 5. 🌟 KuroNami Multi-Dub (Full HD 1080p - VidSrc)
    const vidsrcUrl = `https://vidsrc.to/embed/anime/${shikiId}/${episodeNumber}`;
    sources.push({
      id: `vidsrc-${animeId}-${episodeNumber}`,
      provider: 'consumet',
      teamName: 'KuroNami Multi-Dub (Full HD)',
      type: 'dub',
      language: 'ru',
      qualities: ['1080p', '720p'],
      streamUrl: vidsrcUrl,
      iframeUrl: vidsrcUrl,
      isDirectHls: false,
    });

    // 6. 🔮 AutoEmbed Player (Multi-Audio & English/Original Sub/Dub)
    const autoEmbedUrl = `https://player.autoembed.cc/embed/anime/${shikiId}/${episodeNumber}`;
    sources.push({
      id: `autoembed-${animeId}-${episodeNumber}`,
      provider: 'consumet',
      teamName: 'AutoEmbed (Multi-Audio)',
      type: 'dub',
      language: 'ru',
      qualities: ['1080p', '720p'],
      streamUrl: autoEmbedUrl,
      iframeUrl: autoEmbedUrl,
      isDirectHls: false,
    });

    return sources;
  }

  /**
   * Client-side dynamic AniLibria HLS discovery (runs directly in browser, bypassing server geo-blocks)
   */
  static async discoverClientHls(params: {
    episodeNumber: number;
    titles: {
      russian?: string | null;
      romaji?: string | null;
      english?: string | null;
      synonyms?: string[];
    };
  }): Promise<DynamicStreamMatch | null> {
    try {
      const candidates: string[] = [];
      if (params.titles.russian) {
        candidates.push(params.titles.russian);
        const clean = this.cleanTitle(params.titles.russian);
        if (clean && clean !== params.titles.russian) candidates.push(clean);
      }
      if (params.titles.english) {
        candidates.push(params.titles.english);
        const clean = this.cleanTitle(params.titles.english);
        if (clean && clean !== params.titles.english) candidates.push(clean);
      }
      if (params.titles.romaji) {
        candidates.push(params.titles.romaji);
        const clean = this.cleanTitle(params.titles.romaji);
        if (clean && clean !== params.titles.romaji) candidates.push(clean);
      }
      if (params.titles.synonyms) {
        params.titles.synonyms.forEach((s) => {
          if (s && s.length > 2) candidates.push(s);
        });
      }

      const tried = new Set<string>();

      for (const query of candidates) {
        const term = query.trim();
        if (!term || term.length < 3 || tried.has(term.toLowerCase())) continue;
        tried.add(term.toLowerCase());

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(`https://anilibria.top/api/v1/anime/catalog/releases?f[search]=${encodeURIComponent(term)}&limit=5`, {
          signal: controller.signal,
        }).catch(() => null);

        clearTimeout(timeout);
        if (!res || !res.ok) continue;

        const data = await res.json().catch(() => null);
        const releases: any[] = data?.data || [];

        if (releases.length > 0) {
          const cleanTerm = this.cleanTitle(term);
          const termWords = cleanTerm.split(' ').filter((w) => w.length > 2);

          for (const rel of releases) {
            const mainRu = this.cleanTitle(rel.name?.main || '');
            const eng = this.cleanTitle(rel.name?.english || '');
            const alt = this.cleanTitle(rel.name?.alternative || '');

            const isMatch =
              mainRu === cleanTerm ||
              eng === cleanTerm ||
              alt === cleanTerm ||
              (mainRu.length > 3 && (mainRu.includes(cleanTerm) || cleanTerm.includes(mainRu))) ||
              (eng.length > 3 && (eng.includes(cleanTerm) || cleanTerm.includes(eng))) ||
              (alt.length > 3 && (alt.includes(cleanTerm) || cleanTerm.includes(alt))) ||
              (termWords.length > 0 && termWords.every((w) => mainRu.includes(w) || eng.includes(w) || alt.includes(w)));

            if (isMatch) {
              const fullRes = await fetch(`https://anilibria.top/api/v1/anime/releases/${rel.id}`).catch(() => null);
              if (!fullRes || !fullRes.ok) continue;
              const fullData = await fullRes.json().catch(() => null);

              if (fullData?.episodes && fullData.episodes.length > 0) {
                const ep = fullData.episodes.find((e: any) => e.ordinal === params.episodeNumber);
                if (ep) {
                  const hls = ep.hls_1080 || ep.hls_720 || ep.hls_480;
                  if (hls) {
                    return {
                      hlsUrl: hls,
                      qualities: ['1080p', '720p', '480p'],
                      episodeTitle: ep.name || undefined,
                      duration: ep.duration || undefined,
                      timecodes: {
                        intro: ep.opening && ep.opening.start !== null && ep.opening.stop !== null
                          ? { start: ep.opening.start, end: ep.opening.stop }
                          : undefined,
                        outro: ep.ending && ep.ending.start !== null && ep.ending.stop !== null
                          ? { start: ep.ending.start, end: ep.ending.stop }
                          : undefined,
                      },
                    };
                  }
                }
              }
            }
          }
        }
      }
    } catch {
      // Fallback silently
    }
    return null;
  }
}
