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
      voiceoverTeamsSet.add('AniLibria (FHD 1080p HLS)');
    }

    voiceoverTeamsSet.add('Kodik (Мульти-озвучка)');
    voiceoverTeamsSet.add('AllOHA');
    voiceoverTeamsSet.add('Collaps');
    voiceoverTeamsSet.add('Turbo');
    voiceoverTeamsSet.add('VeoVeo');
    voiceoverTeamsSet.add('Vibix');
    voiceoverTeamsSet.add('Sibnet');
    voiceoverTeamsSet.add('Lumex');

    // 2. Generate episode list with complete multi-player tree
    const targetEpisodesCount = Math.max(
      totalEpisodes || 1,
      anilibriaRelease?.episodes?.length || 0,
      1
    );

    const episodes: EpisodeItem[] = [];
    const shikiId = shikimoriId || malId || animeId;

    for (let epNum = 1; epNum <= targetEpisodesCount; epNum++) {
      const sources: VoiceoverTrack[] = [];
      const anilibriaEp = anilibriaRelease?.episodes?.find((e) => e.ordinal === epNum);

      // 1. ⚡ KuroNami Direct HLS Source (AniLibria 1080p)
      if (hasAniLibria && anilibriaEp) {
        const directHls = anilibriaEp.hls_1080 || anilibriaEp.hls_720 || anilibriaEp.hls_480;
        if (directHls) {
          sources.push({
            id: `anilibria-${anilibriaEp.id}`,
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

      // 2. 🎬 Kodik Player
      const kodikEmbed = `https://kodik.online/find-player?shikimoriID=${shikiId}&episode=${epNum}`;
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

      // 3. 🌌 AllOHA Player
      const allohaEmbed = `https://alloha.link/embed/anime?shikimori_id=${shikiId}&episode=${epNum}`;
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

      // 4. ⚡ Collaps Player
      const collapsEmbed = `https://collaps.org/embed/anime?shikimori_id=${shikiId}&episode=${epNum}`;
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

      // 5. 🚀 Turbo Player
      const turboEmbed = `https://turbovid.top/embed/anime?shikimori=${shikiId}&episode=${epNum}`;
      sources.push({
        id: `turbo-${animeId}-${epNum}`,
        provider: 'turbo',
        teamName: 'Turbo CDN (1080p)',
        type: 'dub',
        language: 'ru',
        qualities: ['1080p', '720p'],
        streamUrl: turboEmbed,
        iframeUrl: turboEmbed,
        isDirectHls: false,
      });

      // 6. 🎭 VeoVeo Player
      const veoveoEmbed = `https://veoveo.tv/embed?shikimori=${shikiId}&episode=${epNum}`;
      sources.push({
        id: `veoveo-${animeId}-${epNum}`,
        provider: 'veoveo',
        teamName: 'VeoVeo (HD)',
        type: 'dub',
        language: 'ru',
        qualities: ['1080p', '720p'],
        streamUrl: veoveoEmbed,
        iframeUrl: veoveoEmbed,
        isDirectHls: false,
      });

      // 7. 💎 Vibix Player
      const vibixEmbed = `https://vibix.org/embed?shikimori_id=${shikiId}&episode=${epNum}`;
      sources.push({
        id: `vibix-${animeId}-${epNum}`,
        provider: 'vibix',
        teamName: 'Vibix (HD)',
        type: 'dub',
        language: 'ru',
        qualities: ['1080p', '720p'],
        streamUrl: vibixEmbed,
        iframeUrl: vibixEmbed,
        isDirectHls: false,
      });

      // 8. 📼 Sibnet Player
      const sibnetEmbed = `https://video.sibnet.ru/shell.php?videoid=${shikiId}`;
      sources.push({
        id: `sibnet-${animeId}-${epNum}`,
        provider: 'sibnet',
        teamName: 'Sibnet (Сибнет)',
        type: 'dub',
        language: 'ru',
        qualities: ['720p', '480p'],
        streamUrl: sibnetEmbed,
        iframeUrl: sibnetEmbed,
        isDirectHls: false,
      });

      // 9. ✨ Lumex Player
      const lumexEmbed = `https://lumex.club/embed?shikimori=${shikiId}&episode=${epNum}`;
      sources.push({
        id: `lumex-${animeId}-${epNum}`,
        provider: 'lumex',
        teamName: 'Lumex (Full HD)',
        type: 'dub',
        language: 'ru',
        qualities: ['1080p', '720p'],
        streamUrl: lumexEmbed,
        iframeUrl: lumexEmbed,
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

  private static async findAniLibriaMatch(titles: {
    russian?: string | null;
    romaji: string;
    english?: string | null;
    synonyms: string[];
  }): Promise<AniLibriaReleaseItem | null> {
    const cleanSlug = titles.romaji.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    try {
      const aliasRes = await fetch(`https://anilibria.top/api/v1/anime/releases/${cleanSlug}`, {
        next: { revalidate: 3600 },
      });
      if (aliasRes.ok) {
        const release: AniLibriaReleaseItem = await aliasRes.json();
        if (release && release.episodes && release.episodes.length > 0) {
          return release;
        }
      }
    } catch {
      // Continue to search
    }

    const candidates = [
      titles.russian,
      titles.romaji,
      titles.english,
      ...titles.synonyms,
    ].filter(Boolean) as string[];

    for (const term of candidates) {
      if (term.length < 3) continue;
      const releases = await searchAniLibriaReleases(term);
      if (releases && releases.length > 0) {
        for (const rel of releases) {
          const mainRu = rel.name?.main?.toLowerCase() || '';
          const eng = rel.name?.english?.toLowerCase() || '';
          const termLower = term.toLowerCase();

          if (
            mainRu === termLower ||
            eng === termLower ||
            (mainRu.length > 4 && termLower.includes(mainRu)) ||
            (eng.length > 4 && termLower.includes(eng))
          ) {
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
