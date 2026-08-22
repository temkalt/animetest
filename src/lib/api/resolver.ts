import { fetchAniListGraphQL, ANIME_DETAILS_QUERY, POPULAR_ANIME_QUERY, AIRING_SCHEDULE_QUERY } from './anilist';
import { fetchShikimoriMetadata, fetchBatchShikimoriMetadata, fetchKinopoiskId, cleanSynopsis, ShikimoriBatchResult } from './shikimori';
import { getKnownRussianTitle, getKnownRussianSynopsis, getKnownEpisodeCount, generateRussianGenreSynopsis } from './russian-titles';
import { StreamAggregator } from './stream-aggregator';
import {
  UnifiedAnime,
  EpisodeItem,
  VoiceoverTrack,
  WeeklySchedule,
  CatalogSearchResult,
  CatalogFilterParams,
} from '@/types';

export class AnimeResolver {
  private static async fetchShikimoriCatalogFallback(
    params: CatalogFilterParams
  ): Promise<CatalogSearchResult> {
    try {
      const query = new URLSearchParams();
      query.set('limit', String(params.perPage || 36));
      query.set('page', String(params.page || 1));

      if (params.status === 'RELEASING') query.set('status', 'ongoing');
      else if (params.status === 'FINISHED') query.set('status', 'released');
      else if (params.status === 'NOT_YET_RELEASED') query.set('status', 'anons');

      if (params.format) {
        const f = params.format.toLowerCase();
        if (['tv', 'movie', 'ova', 'special'].includes(f)) query.set('kind', f);
      }

      if (params.sort?.includes('SCORE_DESC')) query.set('order', 'ranked');
      else if (params.sort?.includes('START_DATE_DESC')) query.set('order', 'aired_on');
      else query.set('order', 'popularity');

      if (params.search) query.set('search', params.search);

      const res = await fetch(`https://shikimori.one/api/animes?${query.toString()}`, {
        headers: { 'User-Agent': 'KuroNami/2.0 (AnimePortal)' },
        next: { revalidate: 1800 },
      });

      if (!res.ok) throw new Error(`Shikimori API error: ${res.statusText}`);

      const list: any[] = await res.json();
      const items: UnifiedAnime[] = list.map((s) => ({
        id: s.id,
        malId: s.id,
        slug: (s.name || `anime-${s.id}`).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title: {
          romaji: s.name,
          english: null,
          native: null,
          russian: s.russian || s.name,
        },
        synonyms: [],
        format: (s.kind || 'TV').toUpperCase(),
        status: (s.status === 'anons' ? 'NOT_YET_RELEASED' : s.status === 'ongoing' ? 'RELEASING' : 'FINISHED') as 'NOT_YET_RELEASED' | 'RELEASING' | 'FINISHED',
        season: null,
        seasonYear: s.aired_on ? parseInt(s.aired_on.slice(0, 4), 10) : null,
        episodesTotal: s.episodes || null,
        episodesAired: s.episodes_aired || s.episodes || 12,
        durationMinutes: s.duration || 24,
        coverImage: {
          original: s.image?.original ? (s.image.original.startsWith('http') ? s.image.original : `https://shikimori.one${s.image.original}`) : '',
          medium: s.image?.preview ? (s.image.preview.startsWith('http') ? s.image.preview : `https://shikimori.one${s.image.preview}`) : '',
          color: '#6366F1',
        },
        bannerImage: null,
        synopsisRu: cleanSynopsis(s.description) || generateRussianGenreSynopsis(s.russian || s.name, [], (s.kind || 'TV').toUpperCase()),
        synopsisEn: '',
        score: s.score ? parseFloat(s.score) : 0,
        popularity: 100,
        genres: [],
        studios: [],
        tags: [],
        relations: [],
        nextAiringEpisode: null,
      }));

      return {
        items,
        pageInfo: {
          total: list.length >= (params.perPage || 36) ? (params.page || 1) * 36 + 36 : list.length,
          currentPage: params.page || 1,
          lastPage: list.length >= (params.perPage || 36) ? (params.page || 1) + 1 : params.page || 1,
          hasNextPage: list.length >= (params.perPage || 36),
        },
      };
    } catch (e) {
      console.error('[AnimeResolver] Shikimori fallback error:', e);
      return { items: [], pageInfo: { total: 0, currentPage: 1, lastPage: 1, hasNextPage: false } };
    }
  }

  static async getTrending(page = 1, perPage = 20, season?: string, seasonYear?: number): Promise<UnifiedAnime[]> {
    try {
      const data: any = await fetchAniListGraphQL(POPULAR_ANIME_QUERY, {
        page,
        perPage,
        season,
        seasonYear,
        sort: ['TRENDING_DESC', 'POPULARITY_DESC'],
      });

      const list = data?.Page?.media || [];
      if (list.length > 0) {
        const malIds = list.map((m: any) => m.idMal).filter(Boolean);
        const ruMetaMap = await fetchBatchShikimoriMetadata(malIds);
        return list.map((item: any) => this.mapAniListToUnified(item, ruMetaMap));
      }
    } catch (err) {
      console.warn('[AnimeResolver] getTrending AniList failed, using Shikimori fallback:', err);
    }

    const fallback = await this.fetchShikimoriCatalogFallback({ page, perPage, sort: ['TRENDING_DESC'] });
    return fallback.items;
  }

  static async getPopular(page = 1, perPage = 20, season?: string, seasonYear?: number): Promise<UnifiedAnime[]> {
    try {
      const data: any = await fetchAniListGraphQL(POPULAR_ANIME_QUERY, {
        page,
        perPage,
        season,
        seasonYear,
        sort: ['POPULARITY_DESC'],
      });

      const list = data?.Page?.media || [];
      if (list.length > 0) {
        const malIds = list.map((m: any) => m.idMal).filter(Boolean);
        const ruMetaMap = await fetchBatchShikimoriMetadata(malIds);
        return list.map((item: any) => this.mapAniListToUnified(item, ruMetaMap));
      }
    } catch (err) {
      console.warn('[AnimeResolver] getPopular AniList failed, using Shikimori fallback:', err);
    }

    const fallback = await this.fetchShikimoriCatalogFallback({ page, perPage, sort: ['POPULARITY_DESC'] });
    return fallback.items;
  }

  static async getTopRated(page = 1, perPage = 20): Promise<UnifiedAnime[]> {
    try {
      const data: any = await fetchAniListGraphQL(POPULAR_ANIME_QUERY, {
        page,
        perPage,
        sort: ['SCORE_DESC'],
      });

      const list = data?.Page?.media || [];
      if (list.length > 0) {
        const malIds = list.map((m: any) => m.idMal).filter(Boolean);
        const ruMetaMap = await fetchBatchShikimoriMetadata(malIds);
        return list.map((item: any) => this.mapAniListToUnified(item, ruMetaMap));
      }
    } catch (err) {
      console.warn('[AnimeResolver] getTopRated AniList failed, using Shikimori fallback:', err);
    }

    const fallback = await this.fetchShikimoriCatalogFallback({ page, perPage, sort: ['SCORE_DESC'] });
    return fallback.items;
  }

  static async searchCatalog(params: CatalogFilterParams): Promise<CatalogSearchResult> {
    const isCyrillic = params.search ? /[а-яё]/i.test(params.search) : false;

    if (isCyrillic && params.search) {
      return this.fetchShikimoriCatalogFallback(params);
    }

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
      if (list.length > 0) {
        const pageInfo = data?.Page?.pageInfo || {
          total: list.length,
          currentPage: params.page || 1,
          lastPage: 1,
          hasNextPage: false,
        };

        const malIds = list.map((m: any) => m.idMal).filter(Boolean);
        const ruMetaMap = await fetchBatchShikimoriMetadata(malIds);

        const items = list.map((item: any) => this.mapAniListToUnified(item, ruMetaMap));
        return { items, pageInfo };
      }
    } catch (err) {
      console.warn('[AnimeResolver] searchCatalog AniList failed, using Shikimori fallback:', err);
    }

    return this.fetchShikimoriCatalogFallback(params);
  }

  static async getAiringSchedule(): Promise<WeeklySchedule> {
    try {
      const now = Math.floor(Date.now() / 1000);
      const startOfWeek = now - (now % 86400) - new Date().getDay() * 86400;
      const endOfWeek = startOfWeek + 7 * 86400;

      const data: any = await fetchAniListGraphQL(AIRING_SCHEDULE_QUERY, {
        airingAtGreater: startOfWeek,
        airingAtLesser: endOfWeek,
        perPage: 50,
      });

      const list = data?.Page?.airingSchedules || [];
      const malIds = list.map((s: any) => s.media?.idMal).filter(Boolean);
      const ruMetaMap = await fetchBatchShikimoriMetadata(malIds);

      const schedule: WeeklySchedule = {
        1: [],
        2: [],
        3: [],
        4: [],
        5: [],
        6: [],
        7: [],
      };

      for (const item of list) {
        const media = item.media;
        if (!media) continue;

        const date = new Date(item.airingAt * 1000);
        const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();

        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        const ruMeta = media.idMal ? ruMetaMap.get(media.idMal) : undefined;
        const ruTitle = ruMeta?.russian ||
          getKnownRussianTitle(media.id) ||
          (media.idMal ? getKnownRussianTitle(media.idMal) : null);

        schedule[dayOfWeek].push({
          id: media.id,
          title: ruTitle || media.title?.romaji || media.title?.english || 'Untitled',
          episode: item.episode,
          airingAt: item.airingAt,
          timeStr: `${hours}:${minutes}`,
          coverImage: media.coverImage?.large || media.coverImage?.medium || '',
          format: media.format || 'TV',
          studio: media.studios?.nodes?.[0]?.name || 'Studio',
        });
      }

      return schedule;
    } catch (err) {
      console.warn('[AnimeResolver] Airing schedule AniList failed, using mock data:', err);
      return this.getMockSchedule();
    }
  }

  private static getMockSchedule(): WeeklySchedule {
    const result: WeeklySchedule = {
      1: [],
      2: [],
      3: [],
      4: [],
      5: [],
      6: [],
      7: [],
    };

    const dummyItems = [
      {
        id: 154587,
        title: 'Провожающая в последний путь Фрирен',
        coverImage: { medium: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx154587-qQTzQnEJJ3oB.jpg' },
        format: 'TV',
      },
      {
        id: 151807,
        title: 'Поднятие уровня в одиночку',
        coverImage: { medium: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx151807-m1gynsplyu27.jpg' },
        format: 'TV',
      },
      {
        id: 171018,
        title: 'Дандадан',
        coverImage: { medium: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx171018-7sR1r95n3m82.jpg' },
        format: 'TV',
      },
      {
        id: 153288,
        title: 'Кайдзю номер восемь',
        coverImage: { medium: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/medium/bx153288-n1q2g3h4j5k6.jpg' },
        format: 'TV',
      },
    ];

    [1, 2, 3, 4, 5, 6, 7].forEach((day, index) => {
      const item = dummyItems[index % dummyItems.length];
      result[day].push({
        id: item.id,
        title: item.title,
        episode: 12,
        airingAt: Math.floor(Date.now() / 1000),
        timeStr: '19:00 МСК',
        coverImage: item.coverImage.medium,
        format: item.format || 'TV',
        studio: 'Studio',
      });
    });

    return result;
  }

  static async getDetails(anilistId: number): Promise<UnifiedAnime | null> {
    try {
      let data: any = await fetchAniListGraphQL(ANIME_DETAILS_QUERY, { id: anilistId });
      let media = data?.Media;

      // Fallback 1: lookup by idMal
      if (!media) {
        data = await fetchAniListGraphQL(ANIME_DETAILS_QUERY, { idMal: anilistId });
        media = data?.Media;
      }

      let unified: UnifiedAnime;

      if (media) {
        unified = this.mapAniListToUnified(media);

        // Ingest Russian metadata & synopses from Shikimori
        if (media.idMal) {
          const shikiData = await fetchShikimoriMetadata(media.idMal);
          if (shikiData) {
            unified.shikimoriId = Number(shikiData.id);
            unified.title.russian = shikiData.russian || unified.title.russian;
            unified.synopsisRu = cleanSynopsis(shikiData.description) || unified.synopsisRu;
            if (shikiData.episodes) {
              unified.episodesTotal = Math.max(unified.episodesTotal || 0, shikiData.episodes);
            }
          }
        }
      } else {
        // Fallback 2: Direct Shikimori Fetch
        const shikiData = await fetchShikimoriMetadata(anilistId);
        if (!shikiData) return null;

        unified = {
          id: anilistId,
          malId: anilistId,
          shikimoriId: anilistId,
          slug: (shikiData.name || `anime-${anilistId}`).toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          title: {
            romaji: shikiData.name,
            english: null,
            native: null,
            russian: shikiData.russian || shikiData.name,
          },
          synonyms: [],
          format: (shikiData.kind || 'TV').toUpperCase(),
          status: shikiData.status === 'anons' ? 'NOT_YET_RELEASED' : shikiData.status === 'ongoing' ? 'RELEASING' : 'FINISHED',
          season: null,
          seasonYear: shikiData.aired_on ? parseInt(shikiData.aired_on.slice(0, 4), 10) : null,
          episodesTotal: shikiData.episodes || 12,
          episodesAired: shikiData.episodes_aired || shikiData.episodes || 12,
          durationMinutes: shikiData.duration || 24,
          coverImage: {
            original: shikiData.image?.original ? `https://shikimori.one${shikiData.image.original}` : '',
            medium: shikiData.image?.preview ? `https://shikimori.one${shikiData.image.preview}` : '',
            color: '#8B5CF6',
          },
          bannerImage: null,
          synopsisRu: cleanSynopsis(shikiData.description) || generateRussianGenreSynopsis(shikiData.russian || shikiData.name, [], (shikiData.kind || 'TV').toUpperCase()),
          synopsisEn: '',
          score: shikiData.score ? parseFloat(shikiData.score) : 0,
          popularity: 100,
          genres: [],
          studios: [],
          tags: [],
          relations: [],
          nextAiringEpisode: null,
        };
      }

      // Fetch Kinopoisk ID for balancers (Alloha, Collaps, VideoCDN, Turbo)
      const targetShikiId = unified.shikimoriId || unified.malId;
      if (targetShikiId) {
        unified.kinopoiskId = await fetchKinopoiskId(targetShikiId);
      }

      // Check known episode count overrides (for 100+ series like One Piece, Naruto, Bleach)
      const knownCount = getKnownEpisodeCount(unified.id) || (unified.malId ? getKnownEpisodeCount(unified.malId) : null);
      if (knownCount) {
        unified.episodesTotal = knownCount;
      }

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

  private static mapAniListToUnified(media: any, ruMetaMap?: Map<number, ShikimoriBatchResult>): UnifiedAnime {
    const slug = (media.title?.romaji || `anime-${media.id}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const ruMeta = media.idMal && ruMetaMap ? ruMetaMap.get(media.idMal) : undefined;
    const knownRu = ruMeta?.russian ||
      getKnownRussianTitle(media.id) ||
      (media.idMal ? getKnownRussianTitle(media.idMal) : null) ||
      getKnownRussianTitle(slug);

    const knownRuSynopsis = ruMeta?.description ||
      getKnownRussianSynopsis(media.id) ||
      (media.idMal ? getKnownRussianSynopsis(media.idMal) : null) ||
      getKnownRussianSynopsis(slug) ||
      null;

    const isUnreleased = media.status === 'NOT_YET_RELEASED';
    const knownEps = getKnownEpisodeCount(media.id) || (media.idMal ? getKnownEpisodeCount(media.idMal) : null);
    const totalEps = knownEps || media.episodes || (media.nextAiringEpisode?.episode ? media.nextAiringEpisode.episode : null);
    const airedEps = knownEps || (media.nextAiringEpisode?.episode ? media.nextAiringEpisode.episode - 1 : (media.episodes || (isUnreleased ? 0 : 12)));

    const relations = (media.relations?.edges || []).map((edge: any) => {
      const relRu = getKnownRussianTitle(edge.node.id) || (edge.node.idMal ? getKnownRussianTitle(edge.node.idMal) : null);
      return {
        id: edge.node.id,
        malId: edge.node.idMal,
        relationType: edge.relationType,
        title: relRu || edge.node.title?.romaji || edge.node.title?.english || 'Unknown',
        format: edge.node.format || 'TV',
        coverImage: edge.node.coverImage?.large || '',
        year: edge.node.startDate?.year || edge.node.seasonYear || undefined,
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
      synopsisRu: knownRuSynopsis ? cleanSynopsis(knownRuSynopsis) : generateRussianGenreSynopsis(knownRu || media.title?.romaji || 'Без названия', media.genres || [], media.format),
      synopsisEn: cleanSynopsis(media.description) || '',
      score: media.averageScore ? Number((media.averageScore / 10).toFixed(1)) : 0,
      popularity: media.popularity || 0,
      genres: media.genres || [],
      studios: (media.studios?.nodes || []).map((s: any) => s.name),
      tags: media.tags || [],
      relations,
      nextAiringEpisode: media.nextAiringEpisode || null,
    };
  }
}
