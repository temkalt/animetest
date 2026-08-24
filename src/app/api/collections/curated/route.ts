import { NextRequest, NextResponse } from 'next/server';
import {
  getCuratedCollections,
  getCuratedCollectionById,
  getFeaturedCollection,
  getCuratedCategoryCounts,
  COLLECTIONS_DATA,
} from '@/data/collections.server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || searchParams.get('q') || undefined;
    const sortBy = searchParams.get('sortBy') as 'popularity' | 'count' | 'issue' | null;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : undefined;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!, 10) : undefined;
    const offset = searchParams.get('offset')
      ? parseInt(searchParams.get('offset')!, 10)
      : page && limit
      ? (page - 1) * limit
      : undefined;
    const featuredOnly = searchParams.get('featured') === 'true';

    // If requesting a specific collection by ID
    if (id) {
      const collection = getCuratedCollectionById(id);
      if (!collection) {
        return NextResponse.json(
          { error: `Коллекция с ID "${id}" не найдена` },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { success: true, collection },
        {
          headers: {
            'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
          },
        }
      );
    }

    // If requesting only the featured collection
    if (featuredOnly) {
      const featured = getFeaturedCollection();
      return NextResponse.json(
        { success: true, collection: featured },
        {
          headers: {
            'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
          },
        }
      );
    }

    const collections = getCuratedCollections({
      category,
      search,
      sortBy: sortBy || undefined,
      limit,
      offset,
    });

    const categoryCounts = getCuratedCategoryCounts();

    return NextResponse.json(
      {
        success: true,
        collections,
        total: collections.length,
        allTotal: COLLECTIONS_DATA.length,
        categories: categoryCounts,
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
        },
      }
    );
  } catch (err: any) {
    console.error('[API /api/collections/curated] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Ошибка загрузки кураторских коллекций' },
      { status: 500 }
    );
  }
}
