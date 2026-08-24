const SHIKIMORI_ENDPOINTS = [
  'https://shikimori.me/api/graphql',
  'https://shikimori.one/api/graphql',
  'https://shikimori.org/api/graphql',
];

const SHIKIMORI_REST_HOSTS = [
  'https://shikimori.me',
  'https://shikimori.one',
  'https://shikimori.org',
];

export const SHIKIMORI_METADATA_QUERY = `
query GetShikimoriMeta($ids: String) {
  animes(ids: $ids, limit: 50) {
    id
    malId
    name
    russian
    english
    japanese
    synonyms
    score
    description
    descriptionHtml
    genres {
      id
      name
      russian
    }
    studios {
      id
      name
    }
    chronology {
      id
      name
      russian
      kind
      airedOn {
        year
      }
    }
  }
}
`;

import { LRUCache } from '@/lib/utils/lru-cache';

export interface ShikimoriBatchResult {
  russian?: string;
  description?: string;
}

const memoryTitleCache = new LRUCache<number, string>({ maxSize: 1000, ttlMs: 24 * 60 * 60 * 1000 });
const memoryMetaCache = new LRUCache<number, ShikimoriBatchResult>({ maxSize: 1000, ttlMs: 24 * 60 * 60 * 1000 });
const memorySearchTitleCache = new LRUCache<string, string>({ maxSize: 500, ttlMs: 24 * 60 * 60 * 1000 });

export function cleanSynopsis(raw?: string | null): string {
  if (!raw) return '';
  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/\[(anime|manga|character|person|comment|topic|entry)=[^\]]+\](.*?)\[\/\1\]/gi, '$2')
    .replace(/\[\/?(b|i|u|s|code|spoiler|quote)\]/gi, '')
    .replace(/\[[^\]]+\]/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\(Source:[^)]+\)/gi, '')
    .replace(/Note:[^\n]+/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

/**
 * Fetch helper with timeout and fallback across multiple Shikimori mirror domains.
 */
async function fetchShikimoriWithFallback(query: string, variables: Record<string, any>): Promise<any | null> {
  for (const endpoint of SHIKIMORI_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'KuroNami/2.0 (AnimePortal)',
        },
        body: JSON.stringify({ query, variables }),
        signal: controller.signal,
        next: { revalidate: 86400 },
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch {
      // try next mirror
    }
  }
  return null;
}

export async function fetchBatchShikimoriTitles(malIds: number[]): Promise<Map<number, string>> {
  const result = new Map<number, string>();
  const toFetch: number[] = [];

  for (const id of malIds) {
    if (memoryTitleCache.has(id)) {
      result.set(id, memoryTitleCache.get(id)!);
    } else {
      toFetch.push(id);
    }
  }

  if (toFetch.length === 0) return result;

  // Chunk toFetch into batches of 50 items max per Shikimori GraphQL request
  const chunks: number[][] = [];
  for (let i = 0; i < toFetch.length; i += 50) {
    chunks.push(toFetch.slice(i, i + 50));
  }

  await Promise.all(
    chunks.map(async (chunk) => {
      try {
        const data = await fetchShikimoriWithFallback(SHIKIMORI_METADATA_QUERY, { ids: chunk.join(',') });
        const list: any[] = data?.animes || [];
        for (const item of list) {
          const shikiId = Number(item.id);
          const malId = Number(item.malId);
          if (item.russian && /[а-яё]/i.test(item.russian)) {
            if (shikiId) {
              memoryTitleCache.set(shikiId, item.russian);
              result.set(shikiId, item.russian);
            }
            if (malId) {
              memoryTitleCache.set(malId, item.russian);
              result.set(malId, item.russian);
            }
          }
          if (item.description) {
            const meta = {
              russian: item.russian,
              description: cleanSynopsis(item.description),
            };
            if (shikiId) memoryMetaCache.set(shikiId, meta);
            if (malId) memoryMetaCache.set(malId, meta);
          }
        }
      } catch (err) {
        console.warn('[Shikimori API] Batch fetch chunk failed:', err);
      }
    })
  );

  return result;
}

export async function fetchBatchShikimoriMetadata(malIds: number[]): Promise<Map<number, ShikimoriBatchResult>> {
  const result = new Map<number, ShikimoriBatchResult>();
  const toFetch: number[] = [];

  for (const id of malIds) {
    if (memoryMetaCache.has(id)) {
      result.set(id, memoryMetaCache.get(id)!);
    } else {
      toFetch.push(id);
    }
  }

  if (toFetch.length === 0) return result;

  const chunks: number[][] = [];
  for (let i = 0; i < toFetch.length; i += 50) {
    chunks.push(toFetch.slice(i, i + 50));
  }

  const fetchPromise = Promise.all(
    chunks.map(async (chunk) => {
      try {
        const data = await fetchShikimoriWithFallback(SHIKIMORI_METADATA_QUERY, { ids: chunk.join(',') });
        const list: any[] = data?.animes || [];
        for (const item of list) {
          const shikiId = Number(item.id);
          const malId = Number(item.malId);
          const meta: ShikimoriBatchResult = {
            russian: item.russian && /[а-яё]/i.test(item.russian) ? item.russian : undefined,
            description: cleanSynopsis(item.description) || undefined,
          };
          if (shikiId) {
            memoryMetaCache.set(shikiId, meta);
            result.set(shikiId, meta);
            if (meta.russian) memoryTitleCache.set(shikiId, meta.russian);
          }
          if (malId) {
            memoryMetaCache.set(malId, meta);
            result.set(malId, meta);
            if (meta.russian) memoryTitleCache.set(malId, meta.russian);
          }
        }
      } catch (err) {
        console.warn('[Shikimori API] Batch metadata chunk fetch failed:', err);
      }
    })
  );

  // 2500ms race timer so batches complete and provide full Russian titles
  const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 2500));
  await Promise.race([fetchPromise, timeoutPromise]);

  return result;
}

export async function fetchShikimoriMetadata(malId: number) {
  try {
    const data = await fetchShikimoriWithFallback(SHIKIMORI_METADATA_QUERY, { ids: String(malId) });
    const list = data?.animes;
    if (list && list.length > 0) {
      const item = list[0];
      if (item.description) {
        item.description = cleanSynopsis(item.description);
      }
      return item;
    }
    return null;
  } catch (err) {
    console.warn('[Shikimori API] Fetch failed:', err);
    return null;
  }
}

/**
 * Search Shikimori REST API by title query to find official Russian localization.
 */
export async function searchShikimoriRussianTitle(query: string): Promise<string | null> {
  const cleanQ = query.trim().toLowerCase();
  if (!cleanQ) return null;
  if (memorySearchTitleCache.has(cleanQ)) {
    return memorySearchTitleCache.get(cleanQ) || null;
  }

  for (const host of SHIKIMORI_REST_HOSTS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const res = await fetch(`${host}/api/animes?search=${encodeURIComponent(query)}&limit=1`, {
        headers: {
          'User-Agent': 'KuroNami/2.0 (AnimePortal)',
          'Accept': 'application/json',
        },
        signal: controller.signal,
        next: { revalidate: 86400 },
      });

      clearTimeout(timeoutId);

      if (res.ok) {
        const list: any[] = await res.json();
        if (list && list.length > 0 && list[0].russian && /[а-яё]/i.test(list[0].russian)) {
          const ru = list[0].russian.trim();
          memorySearchTitleCache.set(cleanQ, ru);
          return ru;
        }
      }
    } catch {
      // try next host
    }
  }

  memorySearchTitleCache.set(cleanQ, '');
  return null;
}

const kinopoiskCache = new LRUCache<number, number | null>({ maxSize: 1000, ttlMs: 7 * 24 * 60 * 60 * 1000 });

export async function fetchKinopoiskId(shikiId: number): Promise<number | null> {
  if (kinopoiskCache.has(shikiId)) {
    return kinopoiskCache.get(shikiId) || null;
  }

  for (const host of SHIKIMORI_REST_HOSTS) {
    try {
      const res = await fetch(`${host}/api/animes/${shikiId}/external_links`, {
        headers: {
          'User-Agent': 'KuroNami/2.0 (AnimePortal)',
          'Accept': 'application/json',
        },
        next: { revalidate: 86400 * 7 },
      });

      if (res.ok) {
        const links: Array<{ kind: string; url: string }> = await res.json();
        const kp = links.find((l) => l.kind === 'kinopoisk' || l.url?.includes('kinopoisk.ru'));
        if (kp?.url) {
          const match = kp.url.match(/kinopoisk\.ru\/(?:film|series)\/(\d+)/i);
          if (match && match[1]) {
            const id = parseInt(match[1], 10);
            kinopoiskCache.set(shikiId, id);
            return id;
          }
        }
      }
    } catch {
      // try next host
    }
  }

  kinopoiskCache.set(shikiId, null);
  return null;
}
