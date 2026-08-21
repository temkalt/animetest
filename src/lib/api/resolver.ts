import { fetchAniListGraphQL, ANIME_DETAILS_QUERY, POPULAR_ANIME_QUERY } from './anilist';
import { fetchShikimoriMetadata } from './shikimori';
import { searchAniLibriaReleases, getAniLibriaReleaseDetails, AniLibriaReleaseItem } from './anilibria';
import { UnifiedAnime, EpisodeItem, VoiceoverTrack } from '@/types';

export class AnimeResolver {
  static async getPopular(page = 1, perPage = 20, season?: string, seasonYear?: number): Promise<UnifiedAnime[]> {
    try {
      const data: any = await fetchAniListGraphQL(POPULAR_ANIME_QUERY, {
        page,
        perPage,
        season,
        seasonYear,
      });

      const list = data?.Page?.media || [];
      return list.map((item: any) => this.mapAniListToUnified(item));
    } catch (err) {
      console.error('[AnimeResolver] getPopular error:', err);
      return [];
    }
  }

  static async getDetails(anilistId: number): Promise<UnifiedAnime | null> {
    try {
      const data: any = await fetchAniListGraphQL(ANIME_DETAILS_QUERY, { id: anilistId });
      const media = data?.Media;
      if (!media) return null;

      const unified = this.mapAniListToUnified(media);

      // Ingest Russian metadata from Shikimori
      if (media.idMal) {
        const shiki = await fetchShikimoriMetadata(media.idMal);
        if (shiki) {
          unified.shikimoriId = Number(shiki.id);
          unified.title.russian = shiki.russian || unified.title.russian;
          unified.synopsisRu = shiki.description || unified.synopsisRu;
        }
      }

      // Ingest AniLibria Voiceovers & Episodes
      const anilibriaRelease = await this.resolveAniLibria(unified);
      if (anilibriaRelease) {
        unified.anilibriaId = anilibriaRelease.id;
        unified.anilibriaAlias = anilibriaRelease.alias;
        unified.title.russian = unified.title.russian || anilibriaRelease.name?.main;

        if (anilibriaRelease.episodes && anilibriaRelease.episodes.length > 0) {
          unified.episodes = anilibriaRelease.episodes.map((ep) => {
            const sources: VoiceoverTrack[] = [];

            if (ep.hls_1080 || ep.hls_720 || ep.hls_480) {
              const streamUrl = ep.hls_1080 || ep.hls_720 || ep.hls_480 || '';
              sources.push({
                id: `anilibria-${ep.id}`,
                provider: 'anilibria',
                teamName: 'AniLibria',
                type: 'dub',
                language: 'ru',
                qualities: ['1080p', '720p', '480p'],
                streamUrl: `/api/proxy/m3u8?url=${encodeURIComponent(streamUrl)}`,
                isDirectHls: true,
              });
            }

            const item: EpisodeItem = {
              id: ep.id,
              episodeNumber: ep.ordinal,
              title: ep.name,
              durationSeconds: ep.duration,
              isFiller: false,
              timecodes: {
                intro: ep.opening?.start !== null && ep.opening?.stop !== null ? { start: ep.opening.start, end: ep.opening.stop } : undefined,
                outro: ep.ending?.start !== null && ep.ending?.stop !== null ? { start: ep.ending.start, end: ep.ending.stop } : undefined,
              },
              sources,
            };

            return item;
          });
        }
      }

      return unified;
    } catch (err) {
      console.error('[AnimeResolver] getDetails error:', err);
      return null;
    }
  }

  private static async resolveAniLibria(anime: UnifiedAnime): Promise<AniLibriaReleaseItem | null> {
    const searchCandidates = [
      anime.title.russian,
      anime.title.romaji,
      anime.title.english,
      ...anime.synonyms,
    ].filter(Boolean) as string[];

    for (const term of searchCandidates) {
      const results = await searchAniLibriaReleases(term);
      if (results && results.length > 0) {
        // Fetch full release
        const full = await getAniLibriaReleaseDetails(results[0].id);
        if (full) return full;
      }
    }

    return null;
  }

  private static mapAniListToUnified(media: any): UnifiedAnime {
    const relations = (media.relations?.edges || []).map((edge: any) => ({
      id: edge.node.id,
      malId: edge.node.idMal,
      relationType: edge.relationType,
      title: edge.node.title?.romaji || edge.node.title?.english || 'Unknown',
      format: edge.node.format || 'TV',
      coverImage: edge.node.coverImage?.large || '',
    }));

    return {
      id: media.id,
      malId: media.idMal,
      slug: (media.title?.romaji || `anime-${media.id}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      title: {
        romaji: media.title?.romaji || 'Untitled',
        english: media.title?.english || null,
        native: media.title?.native || null,
        russian: null,
      },
      synonyms: media.synonyms || [],
      format: media.format || 'TV',
      status: media.status || 'FINISHED',
      season: media.season || null,
      seasonYear: media.seasonYear || null,
      episodesTotal: media.episodes || null,
      episodesAired: media.nextAiringEpisode?.episode ? media.nextAiringEpisode.episode - 1 : (media.episodes || 12),
      durationMinutes: media.duration || 24,
      coverImage: {
        original: media.coverImage?.extraLarge || media.coverImage?.large || '',
        medium: media.coverImage?.medium || '',
        color: media.coverImage?.color || '#8B5CF6',
      },
      bannerImage: media.bannerImage || null,
      synopsisRu: null,
      synopsisEn: media.description || '',
      score: media.averageScore ? Number((media.averageScore / 10).toFixed(1)) : 8.0,
      popularity: media.popularity || 0,
      genres: media.genres || [],
      studios: (media.studios?.nodes || []).map((s: any) => s.name),
      tags: media.tags || [],
      relations,
      nextAiringEpisode: media.nextAiringEpisode || null,
    };
  }
}
