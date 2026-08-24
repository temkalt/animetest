import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/db/repo';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { animeId } = body || {};

    const targetAnimeId = parseInt(String(animeId), 10);
    if (isNaN(targetAnimeId) || targetAnimeId <= 0) {
      return NextResponse.json({ error: 'Неверный ID аниме' }, { status: 400 });
    }

    const added = await dbRepo.addAnimeToCollection(id, targetAnimeId);
    return NextResponse.json({ success: true, added });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { animeId } = body || {};

    const targetAnimeId = parseInt(String(animeId), 10);
    if (isNaN(targetAnimeId) || targetAnimeId <= 0) {
      return NextResponse.json({ error: 'Неверный ID аниме' }, { status: 400 });
    }

    const removed = await dbRepo.removeAnimeFromCollection(id, targetAnimeId);
    return NextResponse.json({ success: true, removed });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
