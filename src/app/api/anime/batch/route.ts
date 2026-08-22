import { NextRequest, NextResponse } from 'next/server';
import { fetchAniListGraphQL } from '@/lib/api/anilist';
import { fetchBatchShikimoriTitles } from '@/lib/api/shikimori';
import { getKnownRussianTitle } from '@/lib/api/russian-titles';

export const runtime = 'edge';

const BATCH_ANIME_QUERY = `
query GetBatchAnime($ids: [Int]) {
  Page(page: 1, perPage: 50) {
    media(type: ANIME, id_in: $ids, isAdult: false) {
      id
      idMal
      title {
        romaji
        english
        native
      }
      format
      status
      seasonYear
      episodes
      duration
      averageScore
      coverImage {
        extraLarge
        large
        medium
        color
      }
      bannerImage
      genres
    }
  }
}
`;

export interface BatchAnimeItem {
  id: number;
  idMal?: number;
  title: {
    russian?: string;
    english?: string;
    romaji?: string;
  };
  format?: string;
  status?: string;
  seasonYear?: number;
  episodesTotal?: number;
  durationMinutes?: number;
  score?: number;
  coverImage: {
    original: string;
    medium: string;
    color?: string;
  };
  bannerImage?: string;
  genres: string[];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ids: number[] = Array.isArray(body?.ids)
      ? body.ids.filter((id: any) => typeof id === 'number' && !isNaN(id))
      : [];

    if (ids.length === 0) {
      return NextResponse.json({ items: {} });
    }

    // Limit to max 50 IDs per request for performance
    const cleanIds = ids.slice(0, 50);

    const data: any = await fetchAniListGraphQL(BATCH_ANIME_QUERY, { ids: cleanIds });
    const mediaList = data?.Page?.media || [];

    const malIds = mediaList.map((m: any) => m.idMal).filter(Boolean);
    const ruMap = await fetchBatchShikimoriTitles(malIds);

    const itemsMap: Record<number, BatchAnimeItem> = {};

    for (const m of mediaList) {
      const ruTitle =
        (m.idMal ? ruMap.get(m.idMal) : null) ||
        getKnownRussianTitle(m.id) ||
        (m.idMal ? getKnownRussianTitle(m.idMal) : null) ||
        m.title?.english ||
        m.title?.romaji;

      itemsMap[m.id] = {
        id: m.id,
        idMal: m.idMal || undefined,
        title: {
          russian: ruTitle,
          english: m.title?.english || undefined,
          romaji: m.title?.romaji || undefined,
        },
        format: m.format || 'TV',
        status: m.status || 'FINISHED',
        seasonYear: m.seasonYear || undefined,
        episodesTotal: m.episodes || undefined,
        durationMinutes: m.duration || 24,
        score: m.averageScore ? m.averageScore / 10 : undefined,
        coverImage: {
          original: m.coverImage?.extraLarge || m.coverImage?.large || m.coverImage?.medium || '',
          medium: m.coverImage?.medium || m.coverImage?.large || '',
          color: m.coverImage?.color || '#6366F1',
        },
        bannerImage: m.bannerImage || undefined,
        genres: m.genres || [],
      };
    }

    return NextResponse.json({ items: itemsMap });
  } catch (err: any) {
    console.error('[API Batch Anime] error:', err);
    return NextResponse.json({ error: err.message, items: {} }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const idsParam = searchParams.get('ids');
  if (!idsParam) {
    return NextResponse.json({ items: {} });
  }

  const ids = idsParam
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));

  return POST(
    new NextRequest(req.url, {
      method: 'POST',
      body: JSON.stringify({ ids }),
    })
  );
}
