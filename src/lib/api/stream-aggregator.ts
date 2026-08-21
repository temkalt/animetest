import { VoiceoverTrack, EpisodeItem } from '@/types';
import { getAniLibriaReleaseDetails, searchAniLibriaReleases, AniLibriaReleaseItem } from './anilibria';

export interface StreamResolutionResult {
  episodes: EpisodeItem[];
  voiceovers: string[];
}

export class StreamAggregator {
  /**
   * Resolves all player engines, voiceovers, and stream sources for an anime and its episodes
   */
  static async resolveStreams(params: {
    animeId: number;
    malId?: number | null;
    shikimoriId?: number | null;
    titles: {
      russian?: string | null;
      romaji: string;
      english?: string | null;
      synonyms: string[];
    };
    totalEpisodes: number;
  }): Promise<StreamResolutionResult> {
    const { animeId, malId, shikimoriId, titles, totalEpisodes } = params;
    const voiceoverTeamsSet = new Set<string>();

    // 1. Try to find authentic AniLibria HLS release
    const anilibriaRelease = await this.findAniLibriaMatch(titles);
    const hasAniLibria = !!(anilibriaRelease && anilibriaRelease.episodes && anilibriaRelease.episodes.length > 0);

    if (hasAniLibria) {
      voiceoverTeamsSet.add('KuroNami Direct (1080p HLS)');
    }

    voiceoverTeamsSet.add('Kodik (Мульти-озвучка)');
    voiceoverTeamsSet.add('Kodik Зеркало (Aniqit)');
    voiceoverTeamsSet.add('KuroNami Multi-Dub (Full HD)');
    voiceoverTeamsSet.add('AutoEmbed (Multi-Audio)');
    voiceoverTeamsSet.add('Collaps (HD)');
    voiceoverTeamsSet.add('AllOHA (HD)');

    // 2. Generate episode list with complete multi-player tree
    const targetEpisodesCount = Math.max(
      totalEpisodes || 1,
      anilibriaRelease?.episodes?.length || 0,
      1
    );

    const episodes: EpisodeItem[] = [];
    const shikiId = shikimoriId || malId || animeId;
    const searchTitle = titles.russian || titles.romaji || titles.english || '';

    for (let epNum = 1; epNum <= targetEpisodesCount; epNum++) {
      const sources: VoiceoverTrack[] = [];
      const anilibriaEp = anilibriaRelease?.episodes?.find((e) => e.ordinal === epNum);

      // 1. ⚡ KuroNami Direct HLS Source (AniLibria 1080p - 100% active HLS stream)
      if (hasAniLibria && anilibriaEp) {
        const directHls = anilibriaEp.hls_1080 || anilibriaEp.hls_720 || anilibriaEp.hls_480;
        if (directHls) {
          sources.push({
            id: `anilibria-${anilibriaEp.id || epNum}`,
            provider: 'anilibria',
            teamName: 'KuroNami Direct (1080p HLS)',
            type: 'dub',
            language: 'ru',
            qualities: ['1080p', '720p', '480p'],
            streamUrl: directHls,
            isDirectHls: true,
          });
        }
      }

      // 2. 🌌 Kodik Main Mirror (Direct mirror with search title fallback)
      const kodikEmbed = `https://kodik.info/find-player?shikimoriID=${shikiId}&title=${encodeURIComponent(searchTitle)}&episode=${epNum}`;
      sources.push({
        id: `kodik-${animeId}-${epNum}`,
        provider: 'kodik',
        teamName: 'Kodik (Мульти-озвучка)',
        type: 'dub',
        language: 'ru',
        qualities: ['1080p', '720p'],
        streamUrl: kodikEmbed,
        iframeUrl: kodikEmbed,
        isDirectHls: false,
      });

      // 3. 🎬 Kodik Backup Mirror (Aniqit)
      const aniqitEmbed = `https://aniqit.com/find-player?shikimoriID=${shikiId}&title=${encodeURIComponent(searchTitle)}&episode=${epNum}`;
      sources.push({
        id: `aniqit-${animeId}-${epNum}`,
        provider: 'kodik',
        teamName: 'Kodik Зеркало (Aniqit)',
        type: 'dub',
        language: 'ru',
        qualities: ['1080p', '720p'],
        streamUrl: aniqitEmbed,
        iframeUrl: aniqitEmbed,
        isDirectHls: false,
      });

      // 4. 🌟 KuroNami Multi-Dub / International FHD (vidsrc.to)
      const multiDubEmbed = `https://vidsrc.to/embed/anime/${shikiId}/${epNum}`;
      sources.push({
        id: `vidsrc-${animeId}-${epNum}`,
        provider: 'consumet',
        teamName: 'KuroNami Multi-Dub (Full HD)',
        type: 'dub',
        language: 'ru',
        qualities: ['1080p', '720p'],
        streamUrl: multiDubEmbed,
        iframeUrl: multiDubEmbed,
        isDirectHls: false,
      });

      // 5. 🔮 AutoEmbed Player (Multi-Audio FHD)
      const autoEmbedUrl = `https://player.autoembed.cc/embed/anime/${shikiId}/${epNum}`;
      sources.push({
        id: `autoembed-${animeId}-${epNum}`,
        provider: 'consumet',
        teamName: 'AutoEmbed (Multi-Audio)',
        type: 'dub',
        language: 'ru',
        qualities: ['1080p', '720p'],
        streamUrl: autoEmbedUrl,
        iframeUrl: autoEmbedUrl,
        isDirectHls: false,
      });

      // 6. ⚡ Collaps Player (HD)
      const collapsEmbed = `https://api.bhcesdf.com/embed/movie/${shikiId}`;
      sources.push({
        id: `collaps-${animeId}-${epNum}`,
        provider: 'collaps',
        teamName: 'Collaps (HD)',
        type: 'dub',
        language: 'ru',
        qualities: ['1080p', '720p'],
        streamUrl: collapsEmbed,
        iframeUrl: collapsEmbed,
        isDirectHls: false,
      });

      // 7. ✨ AllOHA Player (HD)
      const allohaEmbed = `https://api.alloha.tv/?shikimori=${shikiId}`;
      sources.push({
        id: `alloha-${animeId}-${epNum}`,
        provider: 'alloha',
        teamName: 'AllOHA (HD)',
        type: 'dub',
        language: 'ru',
        qualities: ['1080p', '720p'],
        streamUrl: allohaEmbed,
        iframeUrl: allohaEmbed,
        isDirectHls: false,
      });

      episodes.push({
        id: `ep-${animeId}-${epNum}`,
        episodeNumber: epNum,
        title: anilibriaEp?.name || `Серия ${epNum}`,
        durationSeconds: anilibriaEp?.duration || 1440,
        isFiller: false,
        timecodes: {
          intro: anilibriaEp?.opening && anilibriaEp.opening.start !== null && anilibriaEp.opening.stop !== null
            ? { start: anilibriaEp.opening.start, end: anilibriaEp.opening.stop }
            : undefined,
          outro: anilibriaEp?.ending && anilibriaEp.ending.start !== null && anilibriaEp.ending.stop !== null
            ? { start: anilibriaEp.ending.start, end: anilibriaEp.ending.stop }
            : undefined,
        },
        sources,
      });
    }

    return {
      episodes,
      voiceovers: Array.from(voiceoverTeamsSet),
    };
  }

  private static cleanQuery(text: string): string {
    return text
      .toLowerCase()
      .replace(/[\(\)\[\]\{\}\:\;\,\.\!\?\-\_\'\"\`]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private static async findAniLibriaMatch(titles: {
    russian?: string | null;
    romaji: string;
    english?: string | null;
    synonyms: string[];
  }): Promise<AniLibriaReleaseItem | null> {
    const candidates: string[] = [];

    if (titles.russian) {
      candidates.push(titles.russian);
      const cleanRu = titles.russian.replace(/(\[.+?\]|\(.+?\)|:\s*.+?$|\bсезон\s*\d+\b|\b\d+\s*сезон\b)/gi, '').trim();
      if (cleanRu && cleanRu !== titles.russian) {
        candidates.push(cleanRu);
      }
    }

    if (titles.english) {
      candidates.push(titles.english);
      const cleanEn = titles.english.replace(/(\[.+?\]|\(.+?\)|:\s*.+?$|\bseason\s*\d+\b|\b\d+(st|nd|rd|th)\s*season\b)/gi, '').trim();
      if (cleanEn && cleanEn !== titles.english) {
        candidates.push(cleanEn);
      }
    }

    if (titles.romaji) {
      candidates.push(titles.romaji);
      const cleanRomaji = titles.romaji.replace(/(\[.+?\]|\(.+?\)|:\s*.+?$|\b\d+(st|nd|rd|th)?\s*season\b)/gi, '').trim();
      if (cleanRomaji && cleanRomaji !== titles.romaji) {
        candidates.push(cleanRomaji);
      }
    }

    titles.synonyms.forEach((s) => {
      if (s && s.length > 2) candidates.push(s);
    });

    const triedQueries = new Set<string>();

    for (const rawTerm of candidates) {
      const term = rawTerm.trim();
      if (!term || term.length < 3 || triedQueries.has(term.toLowerCase())) continue;
      triedQueries.add(term.toLowerCase());

      const releases = await searchAniLibriaReleases(term);
      if (releases && releases.length > 0) {
        const cleanTerm = this.cleanQuery(term);
        const termWords = cleanTerm.split(' ').filter((w) => w.length > 2);

        for (const rel of releases) {
          const mainRu = this.cleanQuery(rel.name?.main || '');
          const eng = this.cleanQuery(rel.name?.english || '');
          const alt = this.cleanQuery(rel.name?.alternative || '');

          // Check direct substring matches
          const isDirectMatch =
            mainRu === cleanTerm ||
            eng === cleanTerm ||
            alt === cleanTerm ||
            (mainRu.length > 3 && (mainRu.includes(cleanTerm) || cleanTerm.includes(mainRu))) ||
            (eng.length > 3 && (eng.includes(cleanTerm) || cleanTerm.includes(eng))) ||
            (alt.length > 3 && (alt.includes(cleanTerm) || cleanTerm.includes(alt)));

          // Check word overlap
          const matchesWords =
            termWords.length > 0 &&
            termWords.every((w) => mainRu.includes(w) || eng.includes(w) || alt.includes(w));

          if (isDirectMatch || matchesWords) {
            const full = await getAniLibriaReleaseDetails(rel.id);
            if (full && full.episodes && full.episodes.length > 0) {
              return full;
            }
          }
        }
      }
    }

    return null;
  }
}
