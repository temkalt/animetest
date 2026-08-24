import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/db/repo';
import { verifySessionToken } from '@/lib/auth/password';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const username = searchParams.get('username');

    if (userId || username) {
      const list = await dbRepo.getUserCollections(userId || username || '');
      return NextResponse.json({ collections: list });
    }

    const publicList = await dbRepo.getPublicCollections();
    return NextResponse.json({ collections: publicList });
  } catch (err: any) {
    console.error('Get collections API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Ошибка загрузки коллекций' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get('kuronami_session')?.value;
    const authHeader = req.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json({ error: 'Для создания коллекции необходимо войти' }, { status: 401 });
    }

    const payload = verifySessionToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Недействительная сессия' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, coverImage, isPublic, initialAnimeIds } = body || {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Название коллекции обязательно' }, { status: 400 });
    }

    const user = await dbRepo.findUserById(payload.id);
    const resolvedUsername = user?.username || payload.username || 'kuronami';

    const newCollection = await dbRepo.createCollection({
      userId: payload.id,
      username: resolvedUsername,
      title: title.trim(),
      description: (description && typeof description === 'string') ? description.trim() : '',
      coverImage:
        coverImage ||
        'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      isPublic: isPublic !== undefined ? Boolean(isPublic) : true,
      animeIds: Array.isArray(initialAnimeIds) ? initialAnimeIds.map(Number) : [],
    });

    return NextResponse.json({ success: true, collection: newCollection });
  } catch (err: any) {
    console.error('Create collection API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Ошибка создания коллекции' },
      { status: 500 }
    );
  }
}
