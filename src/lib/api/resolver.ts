import { fetchAniListGraphQL, ANIME_DETAILS_QUERY, POPULAR_ANIME_QUERY, AIRING_SCHEDULE_QUERY } from './anilist';
import { fetchShikimoriMetadata, fetchBatchShikimoriTitles } from './shikimori';
import { getKnownRussianTitle, getKnownEpisodeCount } from './russian-titles';
import { StreamAggregator } from './stream-aggregator';
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
      const malIds = list.map((m: any) => m.idMal).filter(Boolean);
      const ruMap = await fetchBatchShikimoriTitles(malIds);

      return list.map((item: any) => this.mapAniListToUnified(item, ruMap));
    } catch (err) {
      console.error('[AnimeResolver] getPopular error:', err);
      return [];
    }
  }

  static async searchCatalog(params: {
    page?: number;
    perPage?: number;
    genre?: string;
    status?: string;
    format?: string;
    season?: string;
    seasonYear?: number;
    search?: string;
    sort?: string[];
  }): Promise<{
    items: UnifiedAnime[];
    pageInfo: {
      total: number;
      currentPage: number;
      lastPage: number;
      hasNextPage: boolean;
    };
  }> {
    try {
      const data: any = await fetchAniListGraphQL(POPULAR_ANIME_QUERY, {
        page: params.page || 1,
        perPage: params.perPage || 36,
        genre: params.genre,
        status: params.status,
        format: params.format,
        season: params.season,
        seasonYear: params.seasonYear,
        search: params.search,
        sort: params.sort || ['POPULARITY_DESC', 'TRENDING_DESC'],
      });

      const list = data?.Page?.media || [];
      const pageInfo = data?.Page?.pageInfo || {
        total: list.length,
        currentPage: params.page || 1,
        lastPage: 1,
        hasNextPage: false,
      };

      const malIds = list.map((m: any) => m.idMal).filter(Boolean);
      const ruMap = await fetchBatchShikimoriTitles(malIds);

      const items = list.map((item: any) => this.mapAniListToUnified(item, ruMap));
      return { items, pageInfo };
    } catch (err) {
      console.error('[AnimeResolver] searchCatalog error:', err);
      return {
        items: [],
        pageInfo: { total: 0, currentPage: 1, lastPage: 1, hasNextPage: false },
      };
    }
  }

  static async getAiringSchedule(): Promise<{
    [dayOfWeek: number]: Array<{
      id: number;
      title: string;
      episode: number;
      airingAt: number;
      timeStr: string;
      coverImage: string;
      format: string;
      studio?: string;
    }>;
  }> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const startOfWeek = now - 86400 * 2;
      const endOfWeek = now + 86400 * 6;

      const data: any = await fetchAniListGraphQL(AIRING_SCHEDULE_QUERY, {
        airingAt_greater: startOfWeek,
        airingAt_lesser: endOfWeek,
        perPage: 50,
      });

      const schedules = data?.Page?.airingSchedules || [];
      const malIds = schedules.map((s: any) => s.media?.idMal).filter(Boolean);
      const ruMap = await fetchBatchShikimoriTitles(malIds);

      const result: { [day: number]: any[] } = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };

      for (const item of schedules) {
        if (!item.media) continue;
        const date = new Date(item.airingAt * 1000);
        let day = date.getDay();
        if (day === 0) day = 7;

        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        const knownRu = (item.media.idMal ? ruMap.get(item.media.idMal) : null) ||
          getKnownRussianTitle(item.media.id) ||
          (item.media.idMal ? getKnownRussianTitle(item.media.idMal) : null);

        const titleStr = knownRu || item.media.title?.english || item.media.title?.romaji || 'Аниме';

        result[day].push({
          id: item.media.id,
          title: titleStr,
          episode: item.episode,
          airingAt: item.airingAt,
          timeStr: `${hours}:${minutes} МСК`,
          coverImage: item.media.coverImage?.large || item.media.coverImage?.medium || '',
          format: item.media.format || 'TV',
          studio: item.media.studios?.nodes?.[0]?.name,
        });
      }

      return result;
    } catch (err) {
      console.error('[AnimeResolver] getAiringSchedule error:', err);
      return { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
    }
  }

  static async getDetails(anilistId: number): Promise<UnifiedAnime | null> {
    try {
      const data: any = await fetchAniListGraphQL(ANIME_DETAILS_QUERY, { id: anilistId });
      const media = data?.Media;
      if (!media) return null;

      const unified = this.mapAniListToUnified(media);

      // Ingest Russian metadata & synopses from Shikimori
      if (media.idMal) {
        const shikiData = await fetchShikimoriMetadata(media.idMal);
        if (shikiData) {
          unified.shikimoriId = Number(shikiData.id);
          unified.title.russian = shikiData.russian || unified.title.russian;
          unified.synopsisRu = shikiData.description || unified.synopsisRu;
          if (shikiData.episodes) {
            unified.episodesTotal = Math.max(unified.episodesTotal || 0, shikiData.episodes);
          }
        }
      }

      // Check known episode count overrides (for 100+ series like One Piece, Naruto, Bleach)
      const knownCount = getKnownEpisodeCount(unified.id) || (unified.malId ? getKnownEpisodeCount(unified.malId) : null);
      if (knownCount) {
        unified.episodesTotal = knownCount;
        unified.episodesAired = knownCount;
      }

      // Resolve streams & multi-voiceovers through StreamAggregator
      const streamRes = await StreamAggregator.resolveStreams({
        animeId: unified.id,
        malId: unified.malId,
        shikimoriId: unified.shikimoriId,
        titles: {
          russian: unified.title.russian,
          romaji: unified.title.romaji,
          english: unified.title.english,
          synonyms: unified.synonyms,
        },
        totalEpisodes: unified.episodesTotal || unified.episodesAired || 12,
      });

      unified.episodes = streamRes.episodes;
      return unified;
    } catch (err) {
      console.error('[AnimeResolver] getDetails error:', err);
      return null;
    }
  }

  private static mapAniListToUnified(media: any, ruMap?: Map<number, string>): UnifiedAnime {
    const slug = (media.title?.romaji || `anime-${media.id}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const knownRu = (media.idMal && ruMap ? ruMap.get(media.idMal) : null) ||
      getKnownRussianTitle(media.id) ||
      (media.idMal ? getKnownRussianTitle(media.idMal) : null) ||
      getKnownRussianTitle(slug);

    const knownEps = getKnownEpisodeCount(media.id) || (media.idMal ? getKnownEpisodeCount(media.idMal) : null);
    const totalEps = knownEps || media.episodes || (media.nextAiringEpisode?.episode ? media.nextAiringEpisode.episode : null);
    const airedEps = knownEps || (media.nextAiringEpisode?.episode ? media.nextAiringEpisode.episode - 1 : (media.episodes || 12));

    const relations = (media.relations?.edges || []).map((edge: any) => {
      const relRu = getKnownRussianTitle(edge.node.id) || (edge.node.idMal ? getKnownRussianTitle(edge.node.idMal) : null);
      return {
        id: edge.node.id,
        malId: edge.node.idMal,
        relationType: edge.relationType,
        title: relRu || edge.node.title?.romaji || edge.node.title?.english || 'Unknown',
        format: edge.node.format || 'TV',
        coverImage: edge.node.coverImage?.large || '',
      };
    });

    return {
      id: media.id,
      malId: media.idMal,
      slug,
      title: {
        romaji: media.title?.romaji || 'Untitled',
        english: media.title?.english || null,
        native: media.title?.native || null,
        russian: knownRu,
      },
      synonyms: media.synonyms || [],
      format: media.format || 'TV',
      status: media.status || 'FINISHED',
      season: media.season || null,
      seasonYear: media.seasonYear || null,
      episodesTotal: totalEps,
      episodesAired: airedEps,
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
