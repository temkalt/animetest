import { NextResponse } from 'next/server';
import { getAniLibriaSchedule } from '@/lib/api/anilibria';

export async function GET() {
  try {
    const rawSchedule = await getAniLibriaSchedule();
    return NextResponse.json(rawSchedule, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
