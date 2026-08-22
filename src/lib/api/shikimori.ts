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
        const res = await fetch(SHIKIMORI_GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'KuroNamiAnimePortal/2.0',
          },
          body: JSON.stringify({
            query: SHIKIMORI_METADATA_QUERY,
            variables: { ids: chunk.join(',') },
          }),
          next: { revalidate: 86400 },
        });

        if (res.ok) {
          const json = await res.json();
          const list: any[] = json.data?.animes || [];
          for (const item of list) {
            const shikiId = Number(item.id);
            const malId = Number(item.malId);
            if (item.russian) {
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

  // Chunk toFetch into batches of 50 items max per Shikimori GraphQL request
  const chunks: number[][] = [];
  for (let i = 0; i < toFetch.length; i += 50) {
    chunks.push(toFetch.slice(i, i + 50));
  }

  await Promise.all(
    chunks.map(async (chunk) => {
      try {
        const res = await fetch(SHIKIMORI_GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'KuroNamiAnimePortal/2.0',
          },
          body: JSON.stringify({
            query: SHIKIMORI_METADATA_QUERY,
            variables: { ids: chunk.join(',') },
          }),
          next: { revalidate: 86400 },
        });

        if (res.ok) {
          const json = await res.json();
          const list: any[] = json.data?.animes || [];
          for (const item of list) {
            const shikiId = Number(item.id);
            const malId = Number(item.malId);
            const meta: ShikimoriBatchResult = {
              russian: item.russian || undefined,
              description: cleanSynopsis(item.description) || undefined,
            };
            if (shikiId) {
              memoryMetaCache.set(shikiId, meta);
              result.set(shikiId, meta);
              if (item.russian) memoryTitleCache.set(shikiId, item.russian);
            }
            if (malId) {
              memoryMetaCache.set(malId, meta);
              result.set(malId, meta);
              if (item.russian) memoryTitleCache.set(malId, item.russian);
            }
          }
        }
      } catch (err) {
        console.warn('[Shikimori API] Batch metadata chunk fetch failed:', err);
      }
    })
  );

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

    if (!res.ok) return null;
    const json = await res.json();
    const list = json.data?.animes;
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
