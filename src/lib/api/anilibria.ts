const ANILIBRIA_BASE = 'https://anilibria.top/api/v1';

export interface AniLibriaReleaseItem {
  id: number;
  type: { value: string; description: string };
  year: number;
  name: { main: string; english: string; alternative: string | null };
  alias: string;
  season: { value: string; description: string };
  episodes_total: number;
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

export async function searchAniLibriaReleases(query: string): Promise<AniLibriaReleaseItem[]> {
  try {
    const res = await fetch(`${ANILIBRIA_BASE}/anime/catalog/releases?f[search]=${encodeURIComponent(query)}&limit=10`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch (err) {
    console.warn('[AniLibria] Search failed:', err);
    return [];
  }
}

export async function getAniLibriaReleaseDetails(idOrAlias: number | string): Promise<AniLibriaReleaseItem | null> {
  try {
    const res = await fetch(`${ANILIBRIA_BASE}/anime/releases/${idOrAlias}`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('[AniLibria] Details failed:', err);
    return null;
  }
}

export async function getAniLibriaSchedule(): Promise<any[]> {
  try {
    const res = await fetch(`${ANILIBRIA_BASE}/anime/schedule/week`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data || [];
  } catch (err) {
    return [];
  }
}
