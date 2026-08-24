import { NextRequest, NextResponse } from 'next/server';
import { fetchAniListGraphQL } from '@/lib/api/anilist';
import { ensureRussianTitle } from '@/lib/api/russian-titles';
import { getAniListSearchTerms } from '@/lib/api/fuzzy-search';

export const dynamic = 'force-dynamic';

const ANILIST_SEARCH_QUERY = `
query SearchAnime($search: String) {
  Page(page: 1, perPage: 12) {
    media(type: ANIME, search: $search, sort: POPULARITY_DESC, isAdult: false) {
      id
      idMal
      title {
        romaji
        english
        native
        userPreferred
      }
      format
      seasonYear
      averageScore
      coverImage {
        extraLarge
        large
        medium
        color
      }
      genres
    }
  }
}
`;

const ANILIST_BY_IDS_QUERY = `
query GetByIds($ids: [Int]) {
  Page(page: 1, perPage: 15) {
    media(type: ANIME, id_in: $ids, isAdult: false) {
      id
      idMal
      title {
        romaji
        english
        native
        userPreferred
      }
      format
      seasonYear
      averageScore
      coverImage {
        extraLarge
        large
        medium
        color
      }
      genres
    }
  }
}
`;

/**
 * Fast non-blocking Shikimori search with 1.2s strict timeout.
 */
async function fastShikimoriSearch(query: string): Promise<any[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const res = await fetch(`https://shikimori.one/api/animes?search=${encodeURIComponent(query)}&limit=8`, {
      headers: { 'User-Agent': 'KuroNami/2.0 (AnimePortal)' },
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      return await res.json();
    }
  } catch {}
  return [];
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const queryTrimmed = q.trim();
  const { terms, animeIds } = getAniListSearchTerms(queryTrimmed);
  const seenIds = new Set<number>();
  const results: any[] = [];

  try {
    // 1. Fire parallel queries to AniList with maximum speed
    const searchPromises: Promise<any>[] = [];

    // Query by exact dictionary IDs if matched
    if (animeIds.length > 0) {
      searchPromises.push(
        fetchAniListGraphQL(ANILIST_BY_IDS_QUERY, { ids: animeIds }).catch(() => null)
      );
    }

    // Query by resolved search terms
    for (const term of terms) {
      searchPromises.push(
        fetchAniListGraphQL(ANILIST_SEARCH_QUERY, { search: term }).catch(() => null)
      );
    }

    // Optional fast Shikimori lookup for Cyrillic
    const isCyrillic = /[а-яё]/i.test(queryTrimmed);
    let shikiPromise: Promise<any[]> | null = null;
    if (isCyrillic) {
      shikiPromise = fastShikimoriSearch(queryTrimmed);
    }

    // Wait for parallel AniList responses (typically ~150-250ms)
    const responses = await Promise.allSettled(searchPromises);

    for (const r of responses) {
      if (r.status === 'fulfilled' && r.value?.Page?.media) {
        const mediaList: any[] = r.value.Page.media;
        for (const m of mediaList) {
          if (!m || seenIds.has(m.id)) continue;
          seenIds.add(m.id);

          const ruTitle = ensureRussianTitle({
            russian: undefined,
            english: m.title?.english,
            romaji: m.title?.romaji,
            userPreferred: m.title?.userPreferred,
            id: m.id,
            malId: m.idMal,
          });

          const posterUrl =
            m.coverImage?.extraLarge ||
            m.coverImage?.large ||
            m.coverImage?.medium ||
            '';

          const score = m.averageScore ? m.averageScore / 10 : 0;

          results.push({
            id: m.id,
            idMal: m.idMal,
            title: {
              romaji: m.title?.romaji || 'Anime',
              english: m.title?.english || null,
              russian: ruTitle,
            },
            format: m.format || 'TV',
            seasonYear: m.seasonYear || null,
            score,
            averageScore: m.averageScore || 0,
            coverImage: {
              original: posterUrl,
              large: m.coverImage?.large || posterUrl,
              medium: m.coverImage?.medium || posterUrl,
              color: m.coverImage?.color || '#8B5CF6',
            },
            genres: m.genres || [],
          });
        }
      }
    }

    // If AniList gave few results and Shikimori responded, integrate Shikimori results
    if (results.length < 5 && shikiPromise) {
      const shikiList = await shikiPromise.catch(() => []);
      if (Array.isArray(shikiList) && shikiList.length > 0) {
        for (const s of shikiList) {
          if (seenIds.has(s.id)) continue;
          seenIds.add(s.id);

          const shikiImg = s.image?.original
            ? (s.image.original.startsWith('http') ? s.image.original : `https://shikimori.one${s.image.original}`)
            : s.image?.preview
            ? (s.image.preview.startsWith('http') ? s.image.preview : `https://shikimori.one${s.image.preview}`)
            : '';

          const ruTitle = ensureRussianTitle({
            russian: s.russian,
            romaji: s.name,
            malId: s.id,
          });

          results.push({
            id: s.id,
            idMal: s.id,
            title: {
              romaji: s.name,
              english: s.name,
              russian: ruTitle,
            },
            format: s.kind?.toUpperCase() || 'TV',
            seasonYear: s.aired_on ? parseInt(s.aired_on.slice(0, 4), 10) : null,
            score: s.score ? parseFloat(s.score) : 0,
            averageScore: s.score ? parseFloat(s.score) * 10 : 75,
            coverImage: {
              original: shikiImg,
              large: shikiImg,
              medium: shikiImg,
              color: '#8B5CF6',
            },
            genres: [],
          });
        }
      }
    }

    return NextResponse.json(
      {
        results: results.slice(0, 15),
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err: any) {
    console.error('[Search API Error]:', err);
    return NextResponse.json({ error: err.message, results: [] }, { status: 500 });
  }
}
