import { NextRequest, NextResponse } from 'next/server';
import { BalancerProbeEngine } from '@/lib/balancer/server/balancer-probe-engine';
import { AnimeProbeRequest } from '@/types/balancer';

export async function POST(req: NextRequest) {
  try {
    const body: AnimeProbeRequest = await req.json();

    if (!body.animeId || !body.episodeNumber) {
      return NextResponse.json(
        { error: 'animeId and episodeNumber are required' },
        { status: 400 }
      );
    }

    const probeResult = await BalancerProbeEngine.probeAll(body);

    return NextResponse.json(probeResult, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (err: any) {
    console.error('[/api/balancer/probe] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Failed to probe anime balancers' },
      { status: 500 }
    );
  }
}
