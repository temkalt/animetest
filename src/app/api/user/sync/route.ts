import { NextRequest, NextResponse } from 'next/server';
import { dbRepo } from '@/db/repo';
import { verifySessionToken } from '@/lib/auth/password';

export async function POST(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get('kuronami_session')?.value;
    const authHeader = req.headers.get('authorization');
    const token = cookieToken || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);

    let userId = 'usr_guest';
    if (token) {
      const payload = verifySessionToken(token);
      if (payload && payload.id) {
        userId = payload.id;
      }
    }

    const body = await req.json();
    const { history, bookmarks } = body || {};

    let syncedHistory: any[] = [];
    let syncedBookmarks: any[] = [];

    if (Array.isArray(bookmarks) && bookmarks.length > 0) {
      syncedBookmarks = await dbRepo.syncBookmarks(userId, bookmarks);
    }

    if (Array.isArray(history) && history.length > 0) {
      syncedHistory = await dbRepo.syncHistory(userId, history);
    }

    return NextResponse.json({
      success: true,
      syncedBookmarksCount: syncedBookmarks.length,
      syncedHistoryCount: syncedHistory.length,
    });
  } catch (err: any) {
    console.error('Sync API error:', err);
    return NextResponse.json(
      { error: err?.message || 'Ошибка синхронизации данных' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const cookieToken = req.cookies.get('kuronami_session')?.value;
    const authHeader = req.headers.get('authorization');
    const token = cookieToken || (authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null);

    if (!token) {
      return NextResponse.json({ bookmarks: [], history: [] });
    }

    const payload = verifySessionToken(token);
    if (!payload || !payload.id) {
      return NextResponse.json({ bookmarks: [], history: [] });
    }

    const bookmarks = await dbRepo.getUserBookmarks(payload.id);
    const history = await dbRepo.getUserHistory(payload.id);

    return NextResponse.json({ bookmarks, history });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}
