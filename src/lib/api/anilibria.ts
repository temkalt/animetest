const ANILIBRIA_BASE = 'https://anilibria.top/api/v1';

export interface AniLibriaReleaseItem {
  id: number;
  type: { value: string; description: string };
  year: number;
  name: { main: string; english: string; alternative: string | null };
  alias: string;
  season: { value: string; description: string };
  episodes_total: number;
  description?: string;
  episodes?: Array<{
    id: string;
    name: string;
    ordinal: number;
    opening: { start: number | null; stop: number | null };
    ending: { start: number | null; stop: number | null };
    hls_480: string | null;
    hls_720: string | null;
    hls_1080: string | null;
    duration: number;
  }>;
}

const memoryAniLibriaCache = new Map<string, { russianTitle?: string; description?: string } | null>();

export async function searchAniLibriaReleases(query: string): Promise<AniLibriaReleaseItem[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${ANILIBRIA_BASE}/anime/catalog/releases?f[search]=${encodeURIComponent(query)}&limit=10`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      signal: controller.signal,
      next: { revalidate: 3600 },
    });

    clearTimeout(timeoutId);
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    return [];
  }
}

export async function fetchAniLibriaRussianMeta(titleQuery: string): Promise<{ russianTitle?: string; description?: string } | null> {
  const cleanQ = titleQuery.trim().toLowerCase();
  if (!cleanQ) return null;
  if (memoryAniLibriaCache.has(cleanQ)) {
    return memoryAniLibriaCache.get(cleanQ) || null;
  }

  try {
    const releases = await searchAniLibriaReleases(titleQuery);
    if (releases.length > 0) {
      const match = releases[0];
      const result = {
        russianTitle: match.name?.main && /[а-яё]/i.test(match.name.main) ? match.name.main : undefined,
        description: match.description?.replace(/<[^>]+>/g, '').trim() || undefined,
      };
      memoryAniLibriaCache.set(cleanQ, result);
      return result;
    }
  } catch {
    // ignore
  }

  memoryAniLibriaCache.set(cleanQ, null);
  return null;
}

export async function getAniLibriaReleaseDetails(idOrAlias: number | string): Promise<AniLibriaReleaseItem | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${ANILIBRIA_BASE}/anime/releases/${idOrAlias}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json',
      },
      signal: controller.signal,
      next: { revalidate: 1800 },
    });

    clearTimeout(timeoutId);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function getAniLibriaSchedule(): Promise<any[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${ANILIBRIA_BASE}/anime/schedule/week`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json',
      },
      signal: controller.signal,
      next: { revalidate: 1800 },
    });

    clearTimeout(timeoutId);
    if (!res.ok) return [];
    const data = await res.json();
    return data || [];
  } catch (err) {
    return [];
  }
}
