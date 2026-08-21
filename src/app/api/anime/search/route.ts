import { NextRequest, NextResponse } from 'next/server';
import { fetchAniListGraphQL } from '@/lib/api/anilist';
import { getKnownRussianTitle } from '@/lib/api/russian-titles';

export const runtime = 'edge';

const SEARCH_QUERY = `
query SearchAnime($search: String) {
  Page(page: 1, perPage: 8) {
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

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');

  if (!q || q.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const data: any = await fetchAniListGraphQL(SEARCH_QUERY, { search: q.trim() });
    const list = (data?.Page?.media || []).map((m: any) => {
      const ruTitle = getKnownRussianTitle(m.id) || (m.idMal ? getKnownRussianTitle(m.idMal) : null);
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

