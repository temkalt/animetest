import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/db/repo';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'ID комментария не указан' }, { status: 400 });
    }

    const likesCount = await dbRepo.likeComment(id);
    if (likesCount === null) {
      return NextResponse.json({ error: 'Комментарий не найден' }, { status: 404 });
    }

    return NextResponse.json({ success: true, likesCount });
  } catch (err: any) {
    console.error('Like comment API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Ошибка лайка комментария' },
      { status: 500 }
    );
  }
}
