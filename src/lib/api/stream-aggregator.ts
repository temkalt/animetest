import { VoiceoverTrack, EpisodeItem } from '@/types';
import { getAniLibriaReleaseDetails, searchAniLibriaReleases, AniLibriaReleaseItem } from './anilibria';
import { fetchDDBBPlayers } from './ddbb';
import { StreamResolver } from '../player/stream-resolver';

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

    // 2. Fetch live DDBB balancers (Alloha, Collaps, Turbo, VeoVeo)
    const searchTitle = titles.russian || titles.romaji || titles.english || '';
    const ddbbProviders = await fetchDDBBPlayers({
      title: searchTitle,
      shikimoriId: shikimoriId || undefined,
    });

    // 3. Generate episode list with complete multi-player tree
    const targetEpisodesCount = Math.max(
      totalEpisodes || 1,
      anilibriaRelease?.episodes?.length || 0,
      1
    );

    const episodes: EpisodeItem[] = [];

    for (let epNum = 1; epNum <= targetEpisodesCount; epNum++) {
      const anilibriaEp = anilibriaRelease?.episodes?.find((e) => e.ordinal === epNum);
      const directHls = hasAniLibria && anilibriaEp
        ? (anilibriaEp.hls_1080 || anilibriaEp.hls_720 || anilibriaEp.hls_480)
        : null;

      const sources = StreamResolver.buildSources({
        animeId,
        malId,
        shikimoriId,
        episodeNumber: epNum,
        titles,
        directHls,
        ddbbProviders,
      });

      sources.forEach((s) => voiceoverTeamsSet.add(s.teamName));

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
    return StreamResolver.cleanTitle(text);
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
      const cleanRu = this.cleanQuery(titles.russian);
      if (cleanRu && cleanRu !== titles.russian) candidates.push(cleanRu);
    }

    if (titles.english) {
      candidates.push(titles.english);
      const cleanEn = this.cleanQuery(titles.english);
      if (cleanEn && cleanEn !== titles.english) candidates.push(cleanEn);
    }

    if (titles.romaji) {
      candidates.push(titles.romaji);
      const cleanRomaji = this.cleanQuery(titles.romaji);
      if (cleanRomaji && cleanRomaji !== titles.romaji) candidates.push(cleanRomaji);
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
