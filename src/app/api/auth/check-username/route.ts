import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/db/repo';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawUsername = searchParams.get('username');
    const rawEmail = searchParams.get('email');

    if (rawUsername) {
      const cleanUsername = rawUsername
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '_')
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 24);

      if (!cleanUsername || cleanUsername.length < 2) {
        return NextResponse.json({
          available: false,
          reason: 'Минимум 2 символа (латиница, цифры, _)',
        });
      }

      const reserved = ['admin', 'administrator', 'system', 'root', 'support', 'bot', 'moderator', 'kuronami'];
      // Note: 'kuronami' reserved only if not already owned by user
      if (reserved.includes(cleanUsername)) {
        // Also check if user exists in db
        const existing = await dbRepo.findUserByUsername(cleanUsername);
        if (existing) {
          return NextResponse.json({
            available: false,
            reason: `Никнейм @${cleanUsername} уже занят`,
          });
        }
      }

      const existingUser = await dbRepo.findUserByUsername(cleanUsername);
      if (existingUser) {
        return NextResponse.json({
          available: false,
          reason: `Никнейм @${cleanUsername} уже занят`,
        });
      }

      return NextResponse.json({
        available: true,
        username: cleanUsername,
      });
    }

    if (rawEmail) {
      const cleanEmail = rawEmail.trim().toLowerCase();
      if (!cleanEmail.includes('@')) {
        return NextResponse.json({
          available: false,
          reason: 'Некорректный email адрес',
        });
      }

      const existingEmail = await dbRepo.findUserByEmail(cleanEmail);
      if (existingEmail) {
        return NextResponse.json({
          available: false,
          reason: 'Пользователь с таким email уже зарегистрирован',
        });
      }

      return NextResponse.json({
        available: true,
        email: cleanEmail,
      });
    }

    return NextResponse.json({ error: 'Параметр username или email обязателен' }, { status: 400 });
  } catch (err: any) {
    console.error('Check username API error:', err);
    return NextResponse.json({ available: true });
  }
}
