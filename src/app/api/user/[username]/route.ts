import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/db/repo';
import { sanitizeUser } from '@/lib/auth/password';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    if (!username) {
      return NextResponse.json({ error: 'Укажите никнейм' }, { status: 400 });
    }

    const clean = decodeURIComponent(username).trim().toLowerCase();
    const user = await dbRepo.findUserByUsername(clean);

    if (!user) {
      return NextResponse.json({
        user: {
          id: `usr_${clean}`,
          username: clean,
          name: clean.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
          avatar: 'https://s4.anilist.co/file/anilistcdn/character/large/b40-MNypXsxSRb1R.png',
          bio: 'Участник аниме-сообщества KuroNami.',
          role: 'Отаку',
          level: 1,
          joinedAt: '2026-08-01',
          collectionsCount: 0,
        },
      });
    }

    const safeUser = sanitizeUser(user);
    const { email: _email, ...publicProfile } = safeUser;

    const collections = await dbRepo.getUserCollections(user.id);
    const publicCollections = collections.filter((c) => c.isPublic);

    return NextResponse.json({
      user: {
        ...publicProfile,
        collectionsCount: publicCollections.length,
      },
      collections: publicCollections,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
