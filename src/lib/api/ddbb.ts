export interface DDBBTranslation {
  id: number | string | null;
  name: string;
  quality: string | null;
  iframeUrl: string;
}

export interface DDBBProvider {
  type: string; // 'Alloha', 'Collaps', 'Turbo', 'Veoveo', 'Vibix', 'Kodik'
  iframeUrl: string | null;
  translations?: DDBBTranslation[];
}

export interface DDBBResponse {
  data?: DDBBProvider[];
}

const DDBB_API_URL = 'https://p2.ddbb.lol/api/players';

/**
 * Fetch live balancer streams from DDBB (ReYohoho core aggregator)
 */
export async function fetchDDBBPlayers(params: {
  title?: string;
  kinopoiskId?: number | string;
  shikimoriId?: number | string;
}): Promise<DDBBProvider[]> {
  try {
    const queryParams = new URLSearchParams();

    if (params.kinopoiskId) {
      queryParams.set('kinopoisk', String(params.kinopoiskId));
    } else if (params.title) {
      queryParams.set('title', String(params.title));
    }

    if (!queryParams.toString()) return [];

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const res = await fetch(`${DDBB_API_URL}?${queryParams.toString()}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: controller.signal,
      next: { revalidate: 1800 },
    }).catch(() => null);

    clearTimeout(timeout);
    if (!res || !res.ok) return [];

    const json: DDBBResponse = await res.json().catch(() => ({}));
    return Array.isArray(json.data) ? json.data : [];
  } catch {
    return [];
  }
}
