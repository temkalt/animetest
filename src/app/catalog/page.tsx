import React from 'react';
import type { Metadata } from 'next';
import { AnimeResolver } from '@/lib/api/resolver';
import { CatalogClient } from '@/components/catalog/CatalogClient';
import { GENRE_ITEMS, STATUS_ITEMS } from '@/components/catalog/catalog-data';

interface CatalogPageProps {
  searchParams: Promise<{
    page?: string;
    genre?: string;
    status?: string;
    format?: string;
    season?: string;
    year?: string;
    search?: string;
    sort?: string;
  }>;
}

export const revalidate = 1800;

export async function generateMetadata({
  searchParams,
}: CatalogPageProps): Promise<Metadata> {
  const params = await searchParams;
  const parts: string[] = [];

  if (params.search) parts.push(`Поиск: «${params.search}»`);
  if (params.genre) {
    const g = GENRE_ITEMS.find((item) => item.value === params.genre);
    parts.push(`Жанр: ${g?.label || params.genre}`);
  }
  if (params.status) {
    const s = STATUS_ITEMS.find((item) => item.value === params.status);
    parts.push(`Статус: ${s?.label || params.status}`);
  }
  if (params.year) parts.push(`${params.year} год`);

  const title = parts.length > 0
    ? `${parts.join(' • ')} — Каталог аниме 2026 | KuroNami`
    : 'Каталог аниме 2026 — Поиск и фильтрация лучших тайтлов в 1080p | KuroNami';

  const description =
    'Исследуйте богатую библиотеку аниме 2026: быстрый поиск по жанрам, годам, сезонам и статусу релиза. Смотрите в высоком качестве 1080p без рекламы.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: '/catalog',
    },
  };
}

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const params = await searchParams;

  const currentPage = Math.max(1, parseInt(params.page || '1', 10));
  const activeGenre = params.genre || undefined;
  const activeStatus = params.status || undefined;
  const activeFormat = params.format || undefined;
  const activeSeason = params.season || undefined;
  const activeYear = params.year ? parseInt(params.year, 10) : undefined;
  const searchQuery = params.search?.trim() || undefined;

  // Determine sort array for backend API
  const sortParam = params.sort || 'POPULARITY_DESC';
  const activeSort = sortParam === 'POPULARITY_DESC'
    ? ['POPULARITY_DESC', 'TRENDING_DESC']
    : [sortParam];

  // Fetch catalog data from AnimeResolver
  const { items: animeList, pageInfo } = await AnimeResolver.searchCatalog({
    page: currentPage,
    perPage: 36,
    genre: activeGenre,
    status: activeStatus,
    format: activeFormat,
    season: activeSeason,
    seasonYear: activeYear,
    search: searchQuery,
    sort: activeSort,
  });

  return (
    <div className="w-full pb-12">
      <CatalogClient
        initialAnimeList={animeList}
        pageInfo={pageInfo}
        activeParams={{
          page: currentPage,
          genre: activeGenre,
          status: activeStatus,
          format: activeFormat,
          season: activeSeason,
          year: params.year || undefined,
          search: searchQuery,
          sort: sortParam,
        }}
      />
    </div>
  );
}
