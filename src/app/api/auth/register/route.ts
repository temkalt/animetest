import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/db/repo';
import { hashPassword, createSessionToken, sanitizeUser } from '@/lib/auth/password';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password, avatar, name } = body || {};

    if (!username || typeof username !== 'string' || username.trim().length < 2) {
      return NextResponse.json(
        { error: 'Никнейм должен содержать минимум 2 символа' },
        { status: 400 }
      );
    }

    const cleanUsername = username
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 24);

    if (!cleanUsername || cleanUsername.length < 2) {
      return NextResponse.json(
        { error: 'Никнейм может содержать только латинские буквы, цифры и подчеркивание' },
        { status: 400 }
      );
    }

    const reserved = ['admin', 'administrator', 'system', 'root', 'support', 'bot', 'moderator'];
    if (reserved.includes(cleanUsername)) {
      return NextResponse.json(
        { error: 'Данный никнейм зарезервирован системой' },
        { status: 400 }
      );
    }

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Введите корректный email адрес' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!password || typeof password !== 'string' || password.length < 4) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 4 символа' },
        { status: 400 }
      );
    }

    // Check if username is taken
    const existingUser = await dbRepo.findUserByUsername(cleanUsername);
    if (existingUser) {
      return NextResponse.json(
        { error: `Никнейм @${cleanUsername} уже занят. Выберите другой.` },
        { status: 409 }
      );
    }

    // Check if email is taken
    const existingEmail = await dbRepo.findUserByEmail(cleanEmail);
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Пользователь с таким email уже зарегистрирован' },
        { status: 409 }
      );
    }

    // Hash password securely
    const passwordHash = await hashPassword(password);
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newUser = await dbRepo.createUser({
      id,
      username: cleanUsername,
      name: (name && typeof name === 'string' ? name.trim() : cleanUsername),
      email: cleanEmail,
      passwordHash,
      avatar: avatar || 'https://s4.anilist.co/file/anilistcdn/character/large/b40-MNypXsxSRb1R.png',
      bio: 'Исследователь вселенной KuroNami.',
      role: 'Отаку',
      level: 1,
    });

    const safeUser = sanitizeUser(newUser);
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

    // Set secure cookie
    response.cookies.set('kuronami_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (err: any) {
    console.error('Registration API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Внутренняя ошибка сервера при регистрации' },
      { status: 500 }
    );
  }
}
