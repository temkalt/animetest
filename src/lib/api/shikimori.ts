const SHIKIMORI_GRAPHQL_ENDPOINT = 'https://shikimori.one/api/graphql';

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

export interface ShikimoriBatchResult {
  russian?: string;
  description?: string;
}

const memoryTitleCache = new Map<number, string>();
const memoryMetaCache = new Map<number, ShikimoriBatchResult>();

export function cleanSynopsis(raw?: string | null): string {
  if (!raw) return '';
  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/\[(anime|manga|character|person|comment|topic|entry)=[^\]]+\](.*?)\[\/\1\]/gi, '$2')
    .replace(/\[\/?(b|i|u|s|code|spoiler|url|quote)\]/gi, '')
    .replace(/\[[^\]]+\]/g, '')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\(Source:[^)]+\)/gi, '')
    .replace(/\[Written by MAL Rewrite\]/gi, '')
    .replace(/Note:[^\n]+/gi, '')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
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

  try {
    const res = await fetch(SHIKIMORI_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'KuroNamiAnimePortal/2.0',
      },
      body: JSON.stringify({
        query: SHIKIMORI_METADATA_QUERY,
        variables: { ids: toFetch.slice(0, 50).join(',') },
      }),
      next: { revalidate: 86400 },
    });

    if (res.ok) {
      const json = await res.json();
      const list: any[] = json.data?.animes || [];
      for (const item of list) {
        const id = Number(item.id || item.malId);
        if (item.russian) {
          memoryTitleCache.set(id, item.russian);
          result.set(id, item.russian);
        }
        if (item.description) {
          memoryMetaCache.set(id, {
            russian: item.russian,
            description: cleanSynopsis(item.description),
          });
        }
      }
    }
  } catch (err) {
    console.warn('[Shikimori API] Batch fetch failed:', err);
  }

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

  try {
    const res = await fetch(SHIKIMORI_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'KuroNamiAnimePortal/2.0',
      },
      body: JSON.stringify({
        query: SHIKIMORI_METADATA_QUERY,
        variables: { ids: toFetch.slice(0, 50).join(',') },
      }),
      next: { revalidate: 86400 },
    });

    if (res.ok) {
      const json = await res.json();
      const list: any[] = json.data?.animes || [];
      for (const item of list) {
        const id = Number(item.id || item.malId);
        const meta: ShikimoriBatchResult = {
          russian: item.russian || undefined,
          description: cleanSynopsis(item.description) || undefined,
        };
        memoryMetaCache.set(id, meta);
        if (item.russian) memoryTitleCache.set(id, item.russian);
        result.set(id, meta);
      }
    }
  } catch (err) {
    console.warn('[Shikimori API] Batch metadata fetch failed:', err);
  }

  return result;
}

export async function fetchShikimoriMetadata(malId: number) {
  try {
    const res = await fetch(SHIKIMORI_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'KuroNamiAnimePortal/2.0',
      },
      body: JSON.stringify({
        query: SHIKIMORI_METADATA_QUERY,
        variables: { ids: String(malId) },
      }),
      next: { revalidate: 86400 },
    });

    if (!res.ok) throw new Error('GraphQL fetch failed');
    const json = await res.json();
    const list = json.data?.animes;
    
    if (list && list.length > 0) {
      const item = list[0];
      if (item.description) {
        item.description = cleanSynopsis(item.description);
      }
      
      if (!item.description || item.description.trim() === '') {
        // Fallback to REST API
        const restRes = await fetch(`https://shikimori.one/api/animes/${malId}`, {
          headers: { 'User-Agent': 'KuroNamiAnimePortal/2.0' },
          next: { revalidate: 86400 }
        });
        if (restRes.ok) {
          const restJson = await restRes.json();
          if (restJson.description) {
            item.description = cleanSynopsis(restJson.description);
          }
        }
      }
      
      return item;
    }
    throw new Error('Empty or invalid list from GraphQL');
  } catch (err) {
    console.warn('[Shikimori API] Fetch failed, attempting REST fallback:', err);
    try {
      const restRes = await fetch(`https://shikimori.one/api/animes/${malId}`, {
        headers: { 'User-Agent': 'KuroNamiAnimePortal/2.0' },
        next: { revalidate: 86400 }
      });
      if (restRes.ok) {
        const restJson = await restRes.json();
        return {
          id: String(restJson.id),
          malId: String(restJson.mal_id || malId),
          name: restJson.name,
          russian: restJson.russian,
          description: restJson.description ? cleanSynopsis(restJson.description) : null,
          episodes: restJson.episodes
        };
      }
    } catch (e) {
      console.warn('[Shikimori API] REST fallback also failed:', e);
    }
    return null;
  }
}

const kinopoiskCache = new Map<number, number | null>();

export async function fetchKinopoiskId(shikiId: number): Promise<number | null> {
  if (kinopoiskCache.has(shikiId)) {
    return kinopoiskCache.get(shikiId) || null;
  }

  try {
    const res = await fetch(`https://shikimori.one/api/animes/${shikiId}/external_links`, {
      headers: {
        'User-Agent': 'KuroNamiAnimePortal/2.0',
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
    // ignore
  }

  kinopoiskCache.set(shikiId, null);
  return null;
}
