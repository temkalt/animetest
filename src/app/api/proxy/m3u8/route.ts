import { NextRequest, NextResponse } from 'next/server';
import {
  isUrlSafeAndAllowed,
  createProxyTimeoutSignal,
  handleProxyError,
  PROXY_CORS_HEADERS,
} from '@/lib/security/proxy-security';

export const runtime = 'nodejs';

/**
 * CORS Preflight Handler
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: PROXY_CORS_HEADERS,
  });
}

/**
 * Secure M3U8 Master & Media Playlist Proxy
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return NextResponse.json(
      { error: 'Missing target stream URL parameter.' },
      { status: 400, headers: PROXY_CORS_HEADERS }
    );
  }

  // 1. Enforce strict URL security & SSRF prevention checks
  const check = isUrlSafeAndAllowed(targetUrl);
  if (!check.safe || !check.parsed) {
    return NextResponse.json(
      { error: check.error || 'Access denied by stream security policy.' },
      { status: 403, headers: PROXY_CORS_HEADERS }
    );
  }

  const timeout = createProxyTimeoutSignal(6000);

  try {
    const upstreamRes = await fetch(check.parsed.toString(), {
      signal: timeout.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': check.parsed.origin,
        'Accept': 'application/vnd.apple.mpegurl, application/x-mpegURL, text/plain, */*',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });

    if (!upstreamRes.ok) {
      return NextResponse.json(
        { error: 'Upstream video stream manifest is currently unavailable.' },
        {
          status: upstreamRes.status >= 400 && upstreamRes.status < 600 ? upstreamRes.status : 502,
          headers: PROXY_CORS_HEADERS,
        }
      );
    }

    const rawManifest = await upstreamRes.text();
    const cleanManifest = sanitizeAndRewriteM3U8(rawManifest, check.parsed.toString());

    return new NextResponse(cleanManifest, {
      status: 200,
      headers: {
        ...PROXY_CORS_HEADERS,
        'Content-Type': 'application/vnd.apple.mpegurl; charset=utf-8',
        'Cache-Control': 'public, s-maxage=300, max-age=60, stale-while-revalidate=600',
      },
    });
  } catch (err: unknown) {
    return handleProxyError(err, 'm3u8');
  } finally {
    timeout.clear();
  }
}

/**
 * Sanitizes M3U8 playlists by stripping ad markers / sponsored segments
 * and safely rewriting segment and playlist URIs to internal Edge proxies.
 */
function sanitizeAndRewriteM3U8(manifest: string, baseUrl: string): string {
  const lines = manifest.split(/\r?\n/);
  const sanitizedLines: string[] = [];
  let isSkippingAdBlock = false;
  let base: URL;

  try {
    base = new URL(baseUrl);
  } catch {
    return manifest;
  }

  const AD_KEYWORD_REGEX = /ad_|promo|bet|sponsor|1xbet|melbet|winline|fonbet|mostbet/i;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect SCTE-35 & Ad insertion blocks
    if (
      line.includes('EXT-X-DISCONTINUITY') &&
      i + 1 < lines.length &&
      AD_KEYWORD_REGEX.test(lines[i + 1])
    ) {
      isSkippingAdBlock = true;
      continue;
    }

    if (line.includes('EXT-X-CUE-OUT') || line.includes('EXT-OATCLS-SCTE35')) {
      isSkippingAdBlock = true;
      continue;
    }

    if (isSkippingAdBlock) {
      if (line.includes('EXT-X-DISCONTINUITY') || line.includes('EXT-X-CUE-IN')) {
        isSkippingAdBlock = false;
      }
      continue;
    }

    // Rewrite initialization maps (#EXT-X-MAP:URI="...")
    if (line.startsWith('#EXT-X-MAP:')) {
      const rewrittenMap = line.replace(/URI="([^"]+)"/, (_, uriMatch) => {
        try {
          const absUrl = uriMatch.startsWith('http') ? uriMatch : new URL(uriMatch, base).toString();
          if (isUrlSafeAndAllowed(absUrl).safe) {
            return `URI="/api/proxy/segment?url=${encodeURIComponent(absUrl)}"`;
          }
        } catch {
          // Fallback to original match if resolution fails
        }
        return `URI="${uriMatch}"`;
      });
      sanitizedLines.push(rewrittenMap);
      continue;
    }

    // Rewrite DRM / Key URIs (#EXT-X-KEY:...,URI="...")
    if (line.startsWith('#EXT-X-KEY:')) {
      const rewrittenKey = line.replace(/URI="([^"]+)"/, (_, uriMatch) => {
        try {
          const absUrl = uriMatch.startsWith('http') ? uriMatch : new URL(uriMatch, base).toString();
          if (isUrlSafeAndAllowed(absUrl).safe) {
            return `URI="/api/proxy/segment?url=${encodeURIComponent(absUrl)}"`;
          }
        } catch {
          // Fallback
        }
        return `URI="${uriMatch}"`;
      });
      sanitizedLines.push(rewrittenKey);
      continue;
    }

    // Pass metadata and standard HLS tags through
    if (line.startsWith('#')) {
      sanitizedLines.push(line);
      continue;
    }

    // Process chunk & playlist URIs
    try {
      const absoluteUrl = line.startsWith('http') ? line : new URL(line, base).toString();
      const validation = isUrlSafeAndAllowed(absoluteUrl);

      if (!validation.safe) {
        // Discard unauthorized segment URLs
        continue;
      }

      const lower = line.toLowerCase();
      if (
        lower.endsWith('.ts') ||
        lower.endsWith('.m4s') ||
        lower.endsWith('.mp4') ||
        lower.endsWith('.aac') ||
        lower.includes('.ts?') ||
        lower.includes('.m4s?') ||
        lower.includes('.mp4?') ||
        lower.includes('.aac?')
      ) {
        sanitizedLines.push(`/api/proxy/segment?url=${encodeURIComponent(absoluteUrl)}`);
      } else if (lower.endsWith('.m3u8') || lower.includes('.m3u8?')) {
        sanitizedLines.push(`/api/proxy/m3u8?url=${encodeURIComponent(absoluteUrl)}`);
      } else {
        // Default unclassified media file to segment proxy
        sanitizedLines.push(`/api/proxy/segment?url=${encodeURIComponent(absoluteUrl)}`);
      }
    } catch {
      // Ignore malformed line
    }
  }

  return sanitizedLines.join('\n');
}
