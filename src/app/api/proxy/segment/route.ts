import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const segmentUrl = searchParams.get('url');

  if (!segmentUrl) {
    return new NextResponse('Missing chunk URL', { status: 400 });
  }

  try {
    const upstreamRes = await fetch(segmentUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': new URL(segmentUrl).origin,
      },
    });

    if (!upstreamRes.ok) {
      return new NextResponse(`Segment error: ${upstreamRes.status}`, { status: upstreamRes.status });
    }

    return new NextResponse(upstreamRes.body, {
      status: 200,
      headers: {
        'Content-Type': upstreamRes.headers.get('Content-Type') || 'video/MP2T',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (err: any) {
    return new NextResponse(`Segment proxy error: ${err.message}`, { status: 502 });
  }
}
