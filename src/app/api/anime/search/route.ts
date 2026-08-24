import { NextRequest, NextResponse } from 'next/server';
import { fetchAniListGraphQL } from '@/lib/api/anilist';
import { fetchBatchShikimoriTitles } from '@/lib/api/shikimori';
import { ensureRussianTitle } from '@/lib/api/russian-titles';
import { getSearchQueryVariations } from '@/lib/api/fuzzy-search';

export const dynamic = 'force-dynamic';

const SHIKIMORI_SEARCH_HOSTS = ['https://shikimori.me', 'https://shikimori.one', 'https://shikimori.org'];

async function searchShikimoriList(query: string): Promise<any[]> {
  for (const host of SHIKIMORI_SEARCH_HOSTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`${host}/api/animes?search=${encodeURIComponent(query)}&limit=12`, {
        headers: { 'User-Agent': 'KuroNami/2.0 (AnimePortal)' },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (res.ok) {
        return await res.json();
      }
    } catch {}
  }
  return [];
}

const ANILIST_SEARCH_QUERY = `
query SearchAnime($search: String) {
  Page(page: 1, perPage: 15) {
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

const ANILIST_BY_MAL_QUERY = `
query GetByMalIds($ids: [Int]) {
  Page(page: 1, perPage: 25) {
    media(type: ANIME, idMal_in: $ids, isAdult: false) {
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const variations = getSearchQueryVariations(q.trim());
  const seenIds = new Set<number>();
  const combinedResults: any[] = [];

  try {
    for (const queryVariant of variations) {
      const isCyrillic = /[а-яё]/i.test(queryVariant);

      // 1. Search Shikimori API if query contains Cyrillic or popular alias
      if (isCyrillic || queryVariant !== q.trim()) {
        try {
          const shikiList = await searchShikimoriList(queryVariant);

          if (shikiList && shikiList.length > 0) {
            const malIds = shikiList.map((s) => s.id).filter(Boolean);
            const anilistData: any = await fetchAniListGraphQL(ANILIST_BY_MAL_QUERY, { ids: malIds }).catch(() => null);
            const anilistMedia: any[] = anilistData?.Page?.media || [];

            for (const s of shikiList) {
              const matchedAniList = anilistMedia.find((m: any) => m.idMal === s.id);
              const unifiedId = matchedAniList?.id || s.id;
              if (seenIds.has(unifiedId)) continue;
              seenIds.add(unifiedId);

              const shikiImg = s.image?.original
                ? (s.image.original.startsWith('http') ? s.image.original : `https://shikimori.one${s.image.original}`)
                : s.image?.preview
                ? (s.image.preview.startsWith('http') ? s.image.preview : `https://shikimori.one${s.image.preview}`)
                : '';

              const posterUrl =
                matchedAniList?.coverImage?.extraLarge ||
                matchedAniList?.coverImage?.large ||
                matchedAniList?.coverImage?.medium ||
                shikiImg;

              const score = matchedAniList?.averageScore
                ? matchedAniList.averageScore / 10
                : s.score
                ? parseFloat(s.score)
                : 0;

              const ruTitle = ensureRussianTitle({
                russian: s.russian,
                english: matchedAniList?.title?.english,
                romaji: matchedAniList?.title?.romaji || s.name,
                userPreferred: matchedAniList?.title?.userPreferred,
                id: matchedAniList?.id,
                malId: s.id,
              });

              combinedResults.push({
                id: unifiedId,
                idMal: s.id,
                title: {
                  romaji: matchedAniList?.title?.romaji || s.name,
                  english: matchedAniList?.title?.english || null,
                  russian: ruTitle,
                },
                format: matchedAniList?.format || s.kind?.toUpperCase() || 'TV',
                seasonYear: matchedAniList?.seasonYear || (s.aired_on ? parseInt(s.aired_on.slice(0, 4), 10) : null),
                score,
                averageScore: matchedAniList?.averageScore || (s.score ? parseFloat(s.score) * 10 : 80),
                coverImage: {
                  original: posterUrl,
                  large: matchedAniList?.coverImage?.large || posterUrl,
                  medium: matchedAniList?.coverImage?.medium || posterUrl,
                  color: matchedAniList?.coverImage?.color || '#8B5CF6',
                },
                genres: matchedAniList?.genres || [],
              });
            }
          }
        } catch {
          // Continue to next variant
        }
      }

      // 2. Search AniList API
      try {
        const data: any = await fetchAniListGraphQL(ANILIST_SEARCH_QUERY, { search: queryVariant });
        const mediaList = data?.Page?.media || [];
        const malIds = mediaList.map((m: any) => m.idMal).filter(Boolean);
        const ruMap = await fetchBatchShikimoriTitles(malIds);

        for (const m of mediaList) {
          if (seenIds.has(m.id)) continue;
          seenIds.add(m.id);

          const ruFromShiki = m.idMal ? ruMap.get(m.idMal) : null;
          const ruTitle = ensureRussianTitle({
            russian: ruFromShiki,
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

          combinedResults.push({
            ...m,
            title: {
              ...m.title,
              russian: ruTitle,
            },
            score,
            coverImage: {
              original: posterUrl,
              large: m.coverImage?.large || posterUrl,
              medium: m.coverImage?.medium || posterUrl,
              color: m.coverImage?.color || '#8B5CF6',
            },
          });
        }
      } catch {
        // Continue
      }

      if (combinedResults.length >= 15) break;
    }

    return NextResponse.json({
      results: combinedResults.slice(0, 15),
    }, {
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err: any) {
    console.error('[Search API Error]:', err);
    return NextResponse.json({ error: err.message, results: [] }, { status: 500 });
  }
}
