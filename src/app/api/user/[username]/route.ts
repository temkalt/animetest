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
        collections: [],
        bookmarks: [],
        history: [],
      });
    }

    const safeUser = sanitizeUser(user);
    const { email: _email, ...publicProfile } = safeUser;

    const collections = await dbRepo.getUserCollections(user.id);
    const publicCollections = collections.filter((c) => c.isPublic);
    const bookmarks = await dbRepo.getUserBookmarks(user.id);
    const history = await dbRepo.getUserHistory(user.id);

    return NextResponse.json({
      user: {
        ...publicProfile,
        collectionsCount: publicCollections.length,
        bookmarksCount: bookmarks.length,
        historyCount: history.length,
      },
      collections: publicCollections,
      bookmarks: bookmarks.map((b) => ({
        animeId: b.animeId,
        status: b.status,
        score: b.score,
        isFavorite: b.isFavorite,
        animeTitle: b.animeTitle,
        animeCover: b.animeCover,
        animeFormat: b.animeFormat,
        animeScore: b.animeScore,
        animeTotalEpisodes: b.animeTotalEpisodes,
        customFolder: b.customFolder,
        updatedAt: b.updatedAt,
      })),
      history: history.map((h) => ({
        animeId: h.animeId,
        episodeNumber: h.episodeNumber,
        currentTimeSeconds: h.currentTimeSeconds,
        durationSeconds: h.durationSeconds,
        progressPercentage: h.progressPercentage,
        isCompleted: h.isCompleted,
        animeTitle: h.animeTitle,
        animeCover: h.animeCover,
        animeTotalEpisodes: h.animeTotalEpisodes,
        animeFormat: h.animeFormat,
        teamName: h.teamName,
        updatedAt: h.updatedAt,
      })),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
