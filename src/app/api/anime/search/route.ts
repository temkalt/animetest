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
          const anilistData: any = await fetchAniListGraphQL(ANILIST_BY_MAL_QUERY, { ids: malIds }).catch(() => null);
          const anilistMedia = anilistData?.Page?.media || [];

          // Map and preserve Shikimori Russian titles and images
          const results = shikiList.map((s) => {
            const matchedAniList = anilistMedia.find((m: any) => m.idMal === s.id);
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
              score,
              averageScore: matchedAniList?.averageScore || (s.score ? parseFloat(s.score) * 10 : 80),
              coverImage: {
                original: posterUrl,
                large: matchedAniList?.coverImage?.large || posterUrl,
                medium: matchedAniList?.coverImage?.medium || posterUrl,
                color: matchedAniList?.coverImage?.color || '#8B5CF6',
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
      const ruTitle =
        (m.idMal ? ruMap.get(m.idMal) : null) ||
        getKnownRussianTitle(m.id) ||
        (m.idMal ? getKnownRussianTitle(m.idMal) : null);

      const posterUrl =
        m.coverImage?.extraLarge ||
        m.coverImage?.large ||
        m.coverImage?.medium ||
        '';

      const score = m.averageScore ? m.averageScore / 10 : 0;

      return {
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
      };
    });

    return NextResponse.json({ results: list });
  } catch (err: any) {
    console.error('[Search API Error]:', err);
    return NextResponse.json({ error: err.message, results: [] }, { status: 500 });
  }
}
