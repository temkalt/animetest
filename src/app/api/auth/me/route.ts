import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/db/repo';
import { verifySessionToken, sanitizeUser } from '@/lib/auth/password';

export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get('kuronami_session')?.value;
    const authHeader = req.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json({ user: null });
    }

    const payload = verifySessionToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ user: null });
    }

    const user = await dbRepo.findUserById(payload.id);
    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: sanitizeUser(user),
    });
  } catch (err) {
    console.error('Me API error:', err);
    return NextResponse.json({ user: null });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get('kuronami_session')?.value;
    const authHeader = req.headers.get('authorization');
    const headerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const token = cookieToken || headerToken;

    if (!token) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
    }

    const payload = verifySessionToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ error: 'Сессия недействительна' }, { status: 401 });
    }

    const body = await req.json();
    const { name, bio, avatar, banner } = body || {};

    const updates: any = {};
    if (typeof name === 'string' && name.trim()) updates.name = name.trim();
    if (typeof bio === 'string') updates.bio = bio.trim();
    if (typeof avatar === 'string' && avatar.trim()) updates.avatar = avatar.trim();
    if (typeof banner === 'string') updates.banner = banner.trim();

    const updatedUser = await dbRepo.updateUser(payload.id, updates);
    if (!updatedUser) {
      return NextResponse.json({ error: 'Пользователь не найден' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user: sanitizeUser(updatedUser),
    });
  } catch (err: any) {
    console.error('Update profile API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Ошибка обновления профиля' },
      { status: 500 }
    );
  }
}
