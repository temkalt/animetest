import { NextResponse } from 'next/server';

/**
 * Production-grade SSRF & Stream Proxy Security Engine
 * Designed for Next.js / Vercel Serverless & Edge deployment
 */

// Strict allowlist of authorized video CDN, balancer, and metadata providers
export const ALLOWED_STREAM_DOMAINS: readonly string[] = [
  // AniLibria CDN & mirrors
  'cache.libria.fun',
  'libria.fun',
  'anilibria.top',
  'anilibria.tv',

  // Kodik CDN & players
  'kodikplayer.com',
  'kodik.biz',
  'kodik.info',
  'kodik.cc',
  'aniqit.com',

  // Alloha / Stravers CDN
  'theatre.stravers.live',
  'stravers.live',
  'alloha.tv',

  // DDBB Balancers Hub
  'p2.ddbb.lol',
  'ddbb.lol',

  // Collaps Edge
  'api.collapse.to',
  'collapse.to',

  // Sibnet / Video balancers
  'video.sibnet.ru',
  'sibnet.ru',

  // Anime metadata & image CDNs
  'cdn.myanimelist.net',
  's4.anilist.co',
  'shikimori.one',
  'shikimori.me',
  'shikimori.org',
  'desu.shikimori.one',
] as const;

// Patterns matching private, loopback, link-local, multicast, cloud metadata & special network addresses
const FORBIDDEN_HOST_PATTERNS: readonly RegExp[] = [
  // IPv4 Loopback (127.0.0.0/8) & Zero address (0.0.0.0/8)
  /^127\./,
  /^0\./,
  /^0\.0\.0\.0$/,

  // RFC 1918 Private Address Spaces
  /^10\./,                                     // 10.0.0.0/8
  /^172\.(1[6-9]|2[0-9]|3[0-1])\./,            // 172.16.0.0/12
  /^192\.168\./,                               // 192.168.0.0/16

  // Link-Local & Cloud Metadata Endpoints (AWS, GCP, Azure, OpenStack)
  /^169\.254\./,                               // 169.254.0.0/16 (Includes 169.254.169.254)
  /^metadata\.google\.internal$/i,
  /^instance-data$/i,

  // Carrier-Grade NAT (RFC 6598: 100.64.0.0/10)
  /^100\.(6[4-9]|[7-9][0-9]|1[0-1][0-9]|12[0-7])\./,

  // Documentation / Benchmark / TEST-NET
  /^192\.0\.2\./,
  /^198\.51\.100\./,
  /^203\.0\.113\./,
  /^198\.1[89]\./,

  // Multicast & Reserved (224.0.0.0/4 and 240.0.0.0/4)
  /^(22[4-9]|23[0-9])\./,
  /^(24[0-9]|25[0-5])\./,

  // IPv6 Special / Local / Link-Local / Mapped IPv4
  /^::1$/,                                     // IPv6 Loopback
  /^::$/,                                      // IPv6 Unspecified
  /^\[::1\]$/,
  /^\[::\]$/,
  /^fc00:/i,                                   // IPv6 Unique Local (ULA)
  /^fd[0-9a-f]{2}:/i,
  /^fe80:/i,                                   // IPv6 Link-Local
  /^ff[0-9a-f]{2}:/i,                          // IPv6 Multicast
  /^::ffff:/i,                                 // IPv4-mapped IPv6
  /^\[::ffff:/i,

  // Localhost & Internal Hostnames / TLDs
  /^localhost$/i,
  /^localhost\.localdomain$/i,
  /\.local$/i,
  /\.internal$/i,
  /\.lan$/i,
  /\.home$/i,
  /\.corp$/i,
  /\.localhost$/i,

  // Hexadecimal / Octal / Decimal Integer representation attempts (e.g., 2130706433 or 0x7f000001)
  /^\d+$/,
  /^0x[0-9a-f]+$/i,
];

// Standard Vercel Serverless safe timeout limit (6000ms)
export const PROXY_TIMEOUT_MS = 6000;

// Universal CORS & Security Headers
export const PROXY_CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Range, Accept, Origin, User-Agent',
  'Access-Control-Expose-Headers': 'Content-Length, Content-Range, Accept-Ranges',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'no-referrer',
};

export interface UrlValidationResult {
  safe: boolean;
  error?: string;
  parsed?: URL;
}

/**
 * Validates target URL against strict security policies:
 * 1. Protocol MUST be HTTPS only (blocks unencrypted HTTP and dangerous schemes).
 * 2. UserInfo (credentials in URL) is forbidden.
 * 3. Ports MUST be standard 443 (or implicit default).
 * 4. Hostname MUST NOT resolve to private, loopback, link-local, or metadata addresses.
 * 5. Hostname MUST strictly match the domain allowlist or authorized subdomains.
 */
export function isUrlSafeAndAllowed(targetUrl: string): UrlValidationResult {
  if (!targetUrl || typeof targetUrl !== 'string') {
    return { safe: false, error: 'Missing or empty target URL.' };
  }

  // Reject URLs containing control characters or whitespace
  if (/[\r\n\t\0\s]/.test(targetUrl)) {
    return { safe: false, error: 'Target URL contains illegal characters.' };
  }

  let parsed: URL;
  try {
    parsed = new URL(targetUrl);
  } catch {
    return { safe: false, error: 'Malformed or invalid URL format.' };
  }

  // 1. Protocol Restriction: HTTPS ONLY
  if (parsed.protocol !== 'https:') {
    return { safe: false, error: 'Protocol forbidden. Only HTTPS streams are permitted.' };
  }

  // 2. Reject embedded credentials (SSRF credential leakage vector)
  if (parsed.username || parsed.password) {
    return { safe: false, error: 'Credentials in target URL are strictly prohibited.' };
  }

  // 3. Port Restriction: Default HTTPS port (443) only
  if (parsed.port && parsed.port !== '443') {
    return { safe: false, error: 'Non-standard network ports are forbidden.' };
  }

  const hostname = parsed.hostname.toLowerCase().trim();

  if (!hostname) {
    return { safe: false, error: 'Target hostname is missing.' };
  }

  // Validate hostname format
  if (!/^[a-z0-9.-]+$/.test(hostname)) {
    return { safe: false, error: 'Target hostname contains invalid characters.' };
  }

  // 4. Private IP & Special Network Address Blocking
  for (const pattern of FORBIDDEN_HOST_PATTERNS) {
    if (pattern.test(hostname)) {
      return { safe: false, error: 'Access to private, local, or internal addresses is forbidden.' };
    }
  }

  // 5. Domain Allowlist Verification
  const isAllowed = ALLOWED_STREAM_DOMAINS.some(
    (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
  );

  if (!isAllowed) {
    return { safe: false, error: `Domain '${hostname}' is not authorized for streaming proxy.` };
  }

  return { safe: true, parsed };
}

/**
 * Creates an AbortController with a guaranteed timeout signal
 */
export function createProxyTimeoutSignal(timeoutMs = PROXY_TIMEOUT_MS): {
  signal: AbortSignal;
  clear: () => void;
} {
  const controller = new AbortController();
  const timer = setTimeout(() => {
    controller.abort();
  }, timeoutMs);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer),
  };
}

/**
 * Standardized proxy error handler that guarantees ZERO internal leakage
 */
export function handleProxyError(err: unknown, context: 'm3u8' | 'segment' = 'm3u8'): NextResponse {
  const isTimeout =
    (err instanceof Error && err.name === 'AbortError') ||
    (typeof err === 'object' && err !== null && 'name' in err && (err as any).name === 'AbortError');

  if (isTimeout) {
    return NextResponse.json(
      { error: 'Stream upstream gateway timeout (6000ms exceeded)' },
      {
        status: 504,
        headers: {
          ...PROXY_CORS_HEADERS,
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  }

  return NextResponse.json(
    { error: `Upstream ${context} stream unavailable or request failed` },
    {
      status: 502,
      headers: {
        ...PROXY_CORS_HEADERS,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
