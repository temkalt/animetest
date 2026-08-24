import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get('url');

  if (!targetUrl) {
    return new NextResponse('Missing target stream URL', { status: 400 });
  }

  try {
    const upstreamRes = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': new URL(targetUrl).origin,
      },
    });

    if (!upstreamRes.ok) {
      return new NextResponse(`Upstream error: ${upstreamRes.status}`, { status: upstreamRes.status });
    }

    const rawManifest = await upstreamRes.text();
    const cleanManifest = sanitizeM3U8(rawManifest, targetUrl);

    return new NextResponse(cleanManifest, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.apple.mpegurl',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (err: any) {
    return new NextResponse(`Proxy error: ${err.message}`, { status: 502 });
  }
}

function sanitizeM3U8(manifest: string, baseUrl: string): string {
  const lines = manifest.split(/\r?\n/);
  const sanitizedLines: string[] = [];
  let isSkippingAdBlock = false;
  const base = new URL(baseUrl);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect Ad markers & SCTE-35 discontinuities
    if (
      line.includes('EXT-X-DISCONTINUITY') &&
      i + 1 < lines.length &&
      (lines[i + 1].includes('ad_') || lines[i + 1].includes('promo') || lines[i + 1].includes('bet'))
    ) {
      isSkippingAdBlock = true;
      continue;
    }

    if (isSkippingAdBlock && line.includes('EXT-X-DISCONTINUITY')) {
      isSkippingAdBlock = false;
      continue;
    }

    if (isSkippingAdBlock) {
      continue;
    }

    // Rewrite ts / m4s segment URLs to our Edge Segment Proxy
    if (line.endsWith('.ts') || line.endsWith('.m4s') || line.includes('.ts?') || line.includes('.m4s?')) {
      const absoluteUrl = line.startsWith('http') ? line : new URL(line, base).toString();
      sanitizedLines.push(`/api/proxy/segment?url=${encodeURIComponent(absoluteUrl)}`);
    } else if (line.endsWith('.m3u8') || line.includes('.m3u8?')) {
      const absoluteUrl = line.startsWith('http') ? line : new URL(line, base).toString();
      sanitizedLines.push(`/api/proxy/m3u8?url=${encodeURIComponent(absoluteUrl)}`);
    } else {
      sanitizedLines.push(line);
    }
  }

  return sanitizedLines.join('\n');
}
