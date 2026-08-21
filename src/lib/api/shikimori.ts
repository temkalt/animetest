const SHIKIMORI_GRAPHQL_ENDPOINT = 'https://shikimori.one/api/graphql';

export const SHIKIMORI_METADATA_QUERY = `
query GetShikimoriMeta($ids: String) {
  animes(ids: $ids, limit: 1) {
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

const memoryCache = new Map<number, string>();

export async function fetchBatchShikimoriTitles(malIds: number[]): Promise<Map<number, string>> {
  const result = new Map<number, string>();
  const toFetch: number[] = [];

  for (const id of malIds) {
    if (memoryCache.has(id)) {
      result.set(id, memoryCache.get(id)!);
    } else {
      toFetch.push(id);
    }
  }

  if (toFetch.length === 0) return result;

  try {
    // Shikimori REST API batch endpoint
    const url = `https://shikimori.one/api/animes?ids=${toFetch.slice(0, 50).join(',')}&limit=50`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'KuroNamiAnimePortal/2.0',
      },
      next: { revalidate: 86400 },
    });

    if (res.ok) {
      const list: Array<{ id: number; russian: string; name: string }> = await res.json();
      for (const item of list) {
        if (item.russian) {
          memoryCache.set(item.id, item.russian);
          result.set(item.id, item.russian);
        }
      }
    }
  } catch (err) {
    console.warn('[Shikimori API] Batch fetch failed:', err);
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

    if (!res.ok) return null;
    const json = await res.json();
    const list = json.data?.animes;
    return list && list.length > 0 ? list[0] : null;
  } catch (err) {
    console.warn('[Shikimori API] Fetch failed:', err);
    return null;
  }
}

