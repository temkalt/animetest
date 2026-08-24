import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/db/repo';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '12', 10)));
    const topWatched = await dbRepo.getTopWatched(limit);
    return NextResponse.json({ mostWatched: topWatched });
  } catch (err: any) {
    console.error('Get views API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Ошибка загрузки статистики просмотров' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, animeId, title, coverImage, score, format } = body || {};

    const targetId = parseInt(String(animeId || id), 10);
    if (isNaN(targetId) || targetId <= 0) {
      return NextResponse.json({ error: 'Неверный ID аниме' }, { status: 400 });
    }

    const recorded = await dbRepo.recordAnimeView({
      animeId: targetId,
      title: title || 'Аниме',
      coverImage: coverImage || '',
      score: score !== undefined ? Number(score) : 0,
      format: format || 'TV',
    });

    return NextResponse.json({ success: true, stat: recorded });
  } catch (err: any) {
    console.error('Record view API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Ошибка сохранения просмотра' },
      { status: 500 }
    );
  }
}
