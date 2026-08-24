import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/db/repo';
import { verifySessionToken } from '@/lib/auth/password';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const collection = await dbRepo.getCollectionById(id);
    if (!collection) {
      return NextResponse.json({ error: 'Коллекция не найдена' }, { status: 404 });
    }
    return NextResponse.json({ collection });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieToken = req.cookies.get('kuronami_session')?.value;
    const authHeader = req.headers.get('authorization');
    const token = cookieToken || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);

    if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    const payload = verifySessionToken(token);
    if (!payload || !payload.id) return NextResponse.json({ error: 'Недействительная сессия' }, { status: 401 });

    const collection = await dbRepo.getCollectionById(id);
    if (!collection) return NextResponse.json({ error: 'Коллекция не найдена' }, { status: 404 });
    if (collection.userId !== payload.id) return NextResponse.json({ error: 'Нет доступа' }, { status: 403 });

    const body = await req.json();
    const { title, description, coverImage, isPublic } = body || {};

    const updates: any = {};
    if (typeof title === 'string' && title.trim()) updates.title = title.trim();
    if (typeof description === 'string') updates.description = description.trim();
    if (typeof coverImage === 'string') updates.coverImage = coverImage.trim();
    if (isPublic !== undefined) updates.isPublic = Boolean(isPublic);

    const updated = await dbRepo.updateCollection(id, updates);
    return NextResponse.json({ success: true, collection: updated });
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
    const cookieToken = req.cookies.get('kuronami_session')?.value;
    const authHeader = req.headers.get('authorization');
    const token = cookieToken || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);

    if (!token) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    const payload = verifySessionToken(token);
    if (!payload || !payload.id) return NextResponse.json({ error: 'Недействительная сессия' }, { status: 401 });

    const success = await dbRepo.deleteCollection(id, payload.id);
    if (!success) {
      return NextResponse.json({ error: 'Ошибка удаления или нет прав' }, { status: 400 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
