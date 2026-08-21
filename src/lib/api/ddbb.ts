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

function cleanFranchiseTitle(title: string): string {
  return title
    .replace(/(\[.+?\]|\(.+?\)|:\s*.+?$|\bсезон\s*\d+\b|\b\d+\s*сезон\b|\bseason\s*\d+\b|\b\d+(st|nd|rd|th)\s*season\b|\bтв-\d+\b|\bфильм\b|\bчасть\s*\d+\b)/gi, '')
    .trim();
}

/**
 * Fetch live balancer streams from DDBB (ReYohoho core aggregator)
 */
export async function fetchDDBBPlayers(params: {
  title?: string;
  kinopoiskId?: number | string;
  shikimoriId?: number | string;
}): Promise<DDBBProvider[]> {
  try {
    const searchQueries: string[] = [];

    if (params.kinopoiskId) {
      searchQueries.push(`kinopoisk=${params.kinopoiskId}`);
    }

    if (params.title) {
      const clean = cleanFranchiseTitle(params.title);
      searchQueries.push(`title=${encodeURIComponent(params.title)}`);
      if (clean && clean !== params.title) {
        searchQueries.push(`title=${encodeURIComponent(clean)}`);
      }
    }

    for (const query of searchQueries) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(`${DDBB_API_URL}?${query}`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          signal: controller.signal,
        }).catch(() => null);

        clearTimeout(timeout);
        if (!res || !res.ok) continue;

        const json: DDBBResponse = await res.json().catch(() => ({}));
        const rawProviders = Array.isArray(json.data) ? json.data : [];

        if (rawProviders.length > 0) {
          return rawProviders.map((p) => {
            let effectiveIframe = p.iframeUrl;
            if (!effectiveIframe && Array.isArray(p.translations) && p.translations.length > 0) {
              effectiveIframe = p.translations[0]?.iframeUrl || null;
            }
            return {
              ...p,
              iframeUrl: effectiveIframe,
            };
          }).filter((p) => !!p.iframeUrl);
        }
      } catch {
        // Continue to next query
      }
    }

    return [];
  } catch {
    return [];
  }
}
