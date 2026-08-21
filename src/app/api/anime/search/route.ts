import { NextRequest, NextResponse } from 'next/server';
import { fetchAniListGraphQL } from '@/lib/api/anilist';
import { fetchBatchShikimoriTitles } from '@/lib/api/shikimori';
import { getKnownRussianTitle } from '@/lib/api/russian-titles';

export const runtime = 'edge';

const ANILIST_SEARCH_QUERY = `
query SearchAnime($search: String) {
  Page(page: 1, perPage: 10) {
    media(type: ANIME, search: $search, sort: POPULARITY_DESC, isAdult: false) {
      id
      idMal
      title {
        romaji
        english
      }
      format
      seasonYear
      averageScore
      coverImage {
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
  Page(page: 1, perPage: 12) {
    media(type: ANIME, idMal_in: $ids, isAdult: false) {
      id
      idMal
      title {
        romaji
        english
      }
      format
      seasonYear
      averageScore
      coverImage {
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

  const queryTrimmed = q.trim();
  const isCyrillic = /[а-яё]/i.test(queryTrimmed);

  try {
    // 1. If Cyrillic query -> search Shikimori API first
    if (isCyrillic) {
      const shikiRes = await fetch(
        `https://shikimori.one/api/animes?search=${encodeURIComponent(queryTrimmed)}&limit=10`,
        { headers: { 'User-Agent': 'KuroNamiAnimePortal/2.0' } }
      );

      if (shikiRes.ok) {
        const shikiList: Array<{
          id: number;
          russian: string;
          name: string;
          kind?: string;
          score?: string;
          image?: { original?: string; preview?: string };
        }> = await shikiRes.json();

        if (shikiList.length > 0) {
          const malIds = shikiList.map((s) => s.id);
          const anilistData: any = await fetchAniListGraphQL(ANILIST_BY_MAL_QUERY, { ids: malIds });
          const anilistMedia = anilistData?.Page?.media || [];

          // Map and preserve Shikimori Russian titles
          const results = shikiList.map((s) => {
            const matchedAniList = anilistMedia.find((m: any) => m.idMal === s.id);
            return {
              id: matchedAniList?.id || s.id,
              idMal: s.id,
              title: {
                romaji: matchedAniList?.title?.romaji || s.name,
                english: matchedAniList?.title?.english || null,
                russian: s.russian || s.name,
              },
              format: matchedAniList?.format || s.kind?.toUpperCase() || 'TV',
              seasonYear: matchedAniList?.seasonYear || null,
              averageScore: matchedAniList?.averageScore || (s.score ? parseFloat(s.score) * 10 : 80),
              coverImage: {
                medium: matchedAniList?.coverImage?.medium || (s.image?.original ? `https://shikimori.one${s.image.original}` : ''),
                color: '#8B5CF6',
              },
              genres: matchedAniList?.genres || [],
            };
          });

          return NextResponse.json({ results });
        }
      }
    }

    // 2. English / Romaji search via AniList
    const data: any = await fetchAniListGraphQL(ANILIST_SEARCH_QUERY, { search: queryTrimmed });
    const mediaList = data?.Page?.media || [];
    const malIds = mediaList.map((m: any) => m.idMal).filter(Boolean);
    const ruMap = await fetchBatchShikimoriTitles(malIds);

    const list = mediaList.map((m: any) => {
      const ruTitle = (m.idMal ? ruMap.get(m.idMal) : null) ||
        getKnownRussianTitle(m.id) ||
        (m.idMal ? getKnownRussianTitle(m.idMal) : null);

      return {
        ...m,
        title: {
          ...m.title,
          russian: ruTitle,
        },
      };
    });

    return NextResponse.json({ results: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
