import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/db/repo';
import { verifySessionToken } from '@/lib/auth/password';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const episodeId = searchParams.get('episodeId');
    const animeIdParam = searchParams.get('animeId');
    const isGlobal = searchParams.get('global') === 'true';
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));

    if (isGlobal || (!episodeId && !animeIdParam)) {
      const recent = await dbRepo.getRecentComments(limit);
      return NextResponse.json({ comments: recent });
    }

    const animeId = animeIdParam ? parseInt(animeIdParam, 10) : undefined;
    const comments = await dbRepo.getCommentsByEpisode(episodeId || '', animeId);
    return NextResponse.json({ comments });
  } catch (err: any) {
    console.error('Get comments API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Ошибка загрузки комментариев' },
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

    let authUser: any = null;
    if (token) {
      const payload = verifySessionToken(token);
      if (payload && payload.id) {
        authUser = await dbRepo.findUserById(payload.id);
      }
    }

    const body = await req.json();
    const {
      episodeId,
      animeId,
      animeTitle,
      animeCover,
      episodeNumber,
      content,
      timecodeSeconds,
      isSpoiler,
      author,
    } = body || {};

    if (!content || typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        { error: 'Текст комментария не может быть пустым' },
        { status: 400 }
      );
    }

    const effectiveAnimeId = animeId ? parseInt(String(animeId), 10) : 0;
    const effectiveEpId = episodeId || (effectiveAnimeId ? `ep-${effectiveAnimeId}-${episodeNumber || 1}` : 'global');

    const resolvedUserId = authUser?.id || author?.id || `usr_guest_${Date.now()}`;
    const resolvedUsername = authUser?.username || author?.username || 'kuronami';
    const resolvedName = authUser?.name || author?.name || resolvedUsername;
    const resolvedAvatar =
      authUser?.avatar ||
      author?.avatar ||
      'https://s4.anilist.co/file/anilistcdn/character/large/b40-MNypXsxSRb1R.png';

    const newComment = await dbRepo.createComment({
      episodeId: effectiveEpId,
      animeId: effectiveAnimeId,
      animeTitle: animeTitle || 'Аниме',
      animeCover: animeCover || 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-qQTzQnEJJ3oB.jpg',
      episodeNumber: episodeNumber !== undefined ? parseFloat(String(episodeNumber)) : 1,
      userId: resolvedUserId,
      userName: resolvedName,
      username: resolvedUsername,
      userAvatar: resolvedAvatar,
      content: content.trim(),
      timecodeSeconds: timecodeSeconds !== undefined && timecodeSeconds !== null ? Math.floor(Number(timecodeSeconds)) : null,
      isSpoiler: Boolean(isSpoiler),
    });

    return NextResponse.json({
      success: true,
      comment: newComment,
    });
  } catch (err: any) {
    console.error('Create comment API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Ошибка отправки комментария' },
      { status: 500 }
    );
  }
}
