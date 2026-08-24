import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/db/repo';
import { verifyPassword, createSessionToken, sanitizeUser } from '@/lib/auth/password';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { identifier, password } = body || {};

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return NextResponse.json(
        { error: 'Укажите никнейм или email' },
        { status: 400 }
      );
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Укажите пароль' },
        { status: 400 }
      );
    }

    const user = await dbRepo.findUserByLoginId(identifier);
    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь с таким никнеймом или email не найден' },
        { status: 404 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Неверный пароль. Пожалуйста, проверьте ввод.' },
        { status: 401 }
      );
    }

    const safeUser = sanitizeUser(user);
    const token = createSessionToken({
      id: safeUser.id,
      email: safeUser.email,
      username: safeUser.username,
    });

    const response = NextResponse.json({
      success: true,
      user: safeUser,
      token,
    });

    response.cookies.set('kuronami_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err: any) {
    console.error('Login API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Внутренняя ошибка сервера при входе' },
      { status: 500 }
    );
  }
}
