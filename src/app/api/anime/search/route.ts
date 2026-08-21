import { NextRequest, NextResponse } from 'next/server';
import { fetchAniListGraphQL } from '@/lib/api/anilist';

export const runtime = 'edge';

const SEARCH_QUERY = `
query SearchAnime($search: String) {
  Page(page: 1, perPage: 8) {
    media(type: ANIME, search: $search, sort: POPULARITY_DESC, isAdult: false) {
      id
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
    const list = data?.Page?.media || [];
    return NextResponse.json({ results: list });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
