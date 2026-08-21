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

export async function fetchShikimoriMetadata(malId: number) {
  try {
    const res = await fetch(SHIKIMORI_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'KuroNamiAnimePortal/1.0',
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
