import type { MetadataRoute } from 'next';
import { AnimeResolver } from '@/lib/api/resolver';
import { COLLECTIONS_DATA } from '@/data/collections.server';

export const revalidate = 86400; // 24 hours cache

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
    : 'https://kuronami.app';

  const now = new Date();

  // 1. Static and Core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/catalog`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/collections`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/auth/signin`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/auth/signup`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ];

  // 2. Dynamic Anime Details Routes
  const animeMap = new Map<number, { priority: number; changeFrequency: 'daily' | 'weekly' }>();

  // Add anime from curated collections (reliable offline & static fallback)
  try {
    for (const collection of COLLECTIONS_DATA) {
      if (collection.animeList && Array.isArray(collection.animeList)) {
        for (const item of collection.animeList) {
          if (item.id) {
            animeMap.set(item.id, {
              priority: 0.8,
              changeFrequency: 'weekly',
            });
          }
        }
      }
    }
  } catch (err) {
    console.error('[Sitemap] Failed to collect collection anime:', err);
  }

  // Add dynamically fetched popular, trending, and top-rated anime
  try {
    const [popular, trending, topRated] = await Promise.allSettled([
      AnimeResolver.getPopular(1, 50),
      AnimeResolver.getTrending(1, 50),
      AnimeResolver.getTopRated(1, 50),
    ]);

    if (trending.status === 'fulfilled' && Array.isArray(trending.value)) {
      for (const anime of trending.value) {
        if (anime.id) {
          animeMap.set(anime.id, {
            priority: 0.9,
            changeFrequency: anime.status === 'RELEASING' ? 'daily' : 'weekly',
          });
        }
      }
    }

    if (popular.status === 'fulfilled' && Array.isArray(popular.value)) {
      for (const anime of popular.value) {
        if (anime.id && !animeMap.has(anime.id)) {
          animeMap.set(anime.id, {
            priority: 0.85,
            changeFrequency: anime.status === 'RELEASING' ? 'daily' : 'weekly',
          });
        }
      }
    }

    if (topRated.status === 'fulfilled' && Array.isArray(topRated.value)) {
      for (const anime of topRated.value) {
        if (anime.id && !animeMap.has(anime.id)) {
          animeMap.set(anime.id, {
            priority: 0.8,
            changeFrequency: 'weekly',
          });
        }
      }
    }
  } catch (err) {
    console.error('[Sitemap] Dynamic anime fetch error:', err);
  }

  const animeRoutes: MetadataRoute.Sitemap = Array.from(animeMap.entries()).map(([id, meta]) => ({
    url: `${baseUrl}/anime/${id}`,
    lastModified: now,
    changeFrequency: meta.changeFrequency,
    priority: meta.priority,
  }));

  return [...staticRoutes, ...animeRoutes];
}
