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
 * Video Chunk & Audio Segment Stream Proxy (TS, M4S, MP4, AAC)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const segmentUrl = searchParams.get('url');

  if (!segmentUrl) {
    return NextResponse.json(
      { error: 'Missing stream chunk URL parameter.' },
      { status: 400, headers: PROXY_CORS_HEADERS }
    );
  }

  // 1. Enforce strict URL security & SSRF prevention checks
  const check = isUrlSafeAndAllowed(segmentUrl);
  if (!check.safe || !check.parsed) {
    return NextResponse.json(
      { error: check.error || 'Access denied by stream security policy.' },
      { status: 403, headers: PROXY_CORS_HEADERS }
    );
  }

  const timeout = createProxyTimeoutSignal(6000);

  try {
    // Forward Range header if requested by player for seeking/scrubbing
    const requestHeaders: Record<string, string> = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      'Referer': check.parsed.origin,
      'Accept': '*/*',
    };

    const clientRange = req.headers.get('range');
    if (clientRange) {
      requestHeaders['Range'] = clientRange;
    }

    const upstreamRes = await fetch(check.parsed.toString(), {
      signal: timeout.signal,
      headers: requestHeaders,
    });

    if (!upstreamRes.ok) {
      return NextResponse.json(
        { error: 'Upstream stream chunk unavailable.' },
        {
          status: upstreamRes.status >= 400 && upstreamRes.status < 600 ? upstreamRes.status : 502,
          headers: PROXY_CORS_HEADERS,
        }
      );
    }

    // Build clean response headers
    const responseHeaders = new Headers(PROXY_CORS_HEADERS);

    // Sanitize and preserve media content-type
    const rawContentType = upstreamRes.headers.get('content-type');
    const contentType = sanitizeContentType(rawContentType);
    responseHeaders.set('Content-Type', contentType);

    // High performance edge caching for immutable video chunks
    responseHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
    responseHeaders.set('Accept-Ranges', 'bytes');

    const contentLength = upstreamRes.headers.get('content-length');
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }

    const contentRange = upstreamRes.headers.get('content-range');
    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange);
    }

    return new NextResponse(upstreamRes.body, {
      status: upstreamRes.status,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    return handleProxyError(err, 'segment');
  } finally {
    timeout.clear();
  }
}

/**
 * Ensures returned MIME type is a safe media format
 */
function sanitizeContentType(raw: string | null): string {
  if (!raw) return 'video/MP2T';

  const clean = raw.split(';')[0].trim().toLowerCase();
  const SAFE_TYPES = [
    'video/mp2t',
    'video/mp4',
    'video/iso.segment',
    'video/webm',
    'audio/mp4',
    'audio/aac',
    'audio/mpeg',
    'application/octet-stream',
  ];

  return SAFE_TYPES.includes(clean) ? clean : 'video/MP2T';
}
