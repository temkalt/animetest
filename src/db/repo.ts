import fs from 'fs';
import path from 'path';
import { eq, or, desc, sql } from 'drizzle-orm';
import { db, isPostgresConfigured, ensurePostgresTables } from './index';
import * as schema from './schema';

export interface DBUserRecord {
  id: string;
  username: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar: string;
  banner?: string;
  bio?: string;
  role: string;
  level: number;
  createdAt: string;
  updatedAt: string;
}

export interface DBCommentRecord {
  id: string;
  episodeId: string;
  animeId: number;
  animeTitle?: string;
  animeCover?: string;
  episodeNumber?: number;
  userId: string;
  userName: string;
  username?: string;
  userAvatar?: string;
  parentId?: string | null;
  timecodeSeconds?: number | null;
  content: string;
  isSpoiler: boolean;
  likesCount: number;
  createdAt: string;
}

export interface DBCollectionRecord {
  id: string;
  userId: string;
  username: string;
  title: string;
  description: string;
  coverImage?: string;
  isPublic: boolean;
  animeIds: number[];
  likesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DBViewRecord {
  animeId: number;
  title: string;
  coverImage: string;
  score?: number;
  format?: string;
  viewsCount: number;
  lastViewedAt: string;
}

export interface DBBookmarkRecord {
  id: string;
  userId: string;
  animeId: number;
  status: 'watching' | 'planned' | 'completed' | 'dropped' | 'on_hold';
  score?: number;
  isFavorite: boolean;
  animeTitle?: string;
  animeCover?: string;
  animeFormat?: string;
  animeScore?: number;
  animeTotalEpisodes?: number;
  customFolder?: string;
  updatedAt: string;
}

export interface DBHistoryRecord {
  id: string;
  userId: string;
  animeId: number;
  episodeNumber: number;
  currentTimeSeconds: number;
  durationSeconds: number;
  progressPercentage: number;
  isCompleted: boolean;
  teamName?: string;
  animeTitle?: string;
  animeCover?: string;
  animeTotalEpisodes?: number;
  animeFormat?: string;
  updatedAt: string;
}

interface DatabaseStructure {
  users: DBUserRecord[];
  comments: DBCommentRecord[];
  collections: DBCollectionRecord[];
  views: DBViewRecord[];
  bookmarks: DBBookmarkRecord[];
  history: DBHistoryRecord[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'kuronami_db.json');

class DatabaseRepository {
  private inMemoryData: DatabaseStructure = {
    users: [],
    comments: [],
    collections: [],
    views: [],
    bookmarks: [],
    history: [],
  };
  private isLoaded = false;

  constructor() {
    this.ensureLoaded();
  }

  private ensureLoaded() {
    if (this.isLoaded) return;
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.inMemoryData = {
          users: Array.isArray(parsed.users) ? parsed.users : [],
          comments: Array.isArray(parsed.comments) ? parsed.comments : [],
          collections: Array.isArray(parsed.collections) ? parsed.collections : [],
          views: Array.isArray(parsed.views) ? parsed.views : [],
          bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
          history: Array.isArray(parsed.history) ? parsed.history : [],
        };
      } else {
        this.saveToFile();
      }
      this.isLoaded = true;
    } catch {
      this.isLoaded = true;
    }
  }

  private saveToFile() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(this.inMemoryData, null, 2), 'utf-8');
    } catch {}
  }

  // --- USERS METHODS ---

  async createUser(record: Omit<DBUserRecord, 'createdAt' | 'updatedAt'>): Promise<DBUserRecord> {
    const now = new Date().toISOString();
    const newUser: DBUserRecord = { ...record, createdAt: now, updatedAt: now };

    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        await db.insert(schema.users).values({
          id: newUser.id,
          username: newUser.username,
          name: newUser.name,
          email: newUser.email,
          passwordHash: newUser.passwordHash,
          avatar: newUser.avatar,
          bio: newUser.bio,
          banner: newUser.banner,
          role: newUser.role,
          level: newUser.level,
        });
      } catch (err) {
        console.error('Postgres createUser error:', err);
      }
    }

    this.ensureLoaded();
    this.inMemoryData.users.push(newUser);
    this.saveToFile();
    return newUser;
  }

  async findUserByEmail(email: string): Promise<DBUserRecord | null> {
    const clean = email.trim().toLowerCase();

    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        const rows = await db
          .select()
          .from(schema.users)
          .where(sql`lower(${schema.users.email}) = ${clean}`)
          .limit(1);
        if (rows.length > 0) {
          const u = rows[0];
          return {
            id: u.id,
            username: u.username || (u.name ? u.name.toLowerCase().replace(/\s+/g, '_') : 'otaku'),
            name: u.name || u.username || 'Отаку',
            email: u.email,
            passwordHash: u.passwordHash || '',
            avatar: u.avatar || u.image || 'https://s4.anilist.co/file/anilistcdn/character/large/b40-MNypXsxSRb1R.png',
            banner: u.banner || undefined,
            bio: u.bio || 'Исследователь вселенной KuroNami.',
            role: u.role || 'user',
            level: u.level || 1,
            createdAt: u.createdAt.toISOString(),
            updatedAt: u.updatedAt.toISOString(),
          };
        }
      } catch (err) {
        console.error('Postgres findUserByEmail error:', err);
      }
    }

    this.ensureLoaded();
    return this.inMemoryData.users.find((u) => u.email.toLowerCase() === clean) || null;
  }

  async findUserByUsername(username: string): Promise<DBUserRecord | null> {
    const clean = username.trim().toLowerCase();

    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        const rows = await db
          .select()
          .from(schema.users)
          .where(or(
            sql`lower(${schema.users.username}) = ${clean}`,
            sql`lower(${schema.users.name}) = ${clean}`
          ))
          .limit(1);

        if (rows.length > 0) {
          const u = rows[0];
          return {
            id: u.id,
            username: u.username || (u.name ? u.name.toLowerCase().replace(/\s+/g, '_') : clean),
            name: u.name || u.username || 'Отаку',
            email: u.email,
            passwordHash: u.passwordHash || '',
            avatar: u.avatar || u.image || 'https://s4.anilist.co/file/anilistcdn/character/large/b40-MNypXsxSRb1R.png',
            banner: u.banner || undefined,
            bio: u.bio || 'Исследователь вселенной KuroNami.',
            role: u.role || 'user',
            level: u.level || 1,
            createdAt: u.createdAt.toISOString(),
            updatedAt: u.updatedAt.toISOString(),
          };
        }
      } catch (err) {
        console.error('Postgres findUserByUsername error:', err);
      }
    }

    this.ensureLoaded();
    return (
      this.inMemoryData.users.find(
        (u) => u.username.toLowerCase() === clean || (u.name && u.name.toLowerCase() === clean)
      ) || null
    );
  }

  async findUserById(id: string): Promise<DBUserRecord | null> {
    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        const rows = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
        if (rows.length > 0) {
          const u = rows[0];
          return {
            id: u.id,
            username: u.username || (u.name ? u.name.toLowerCase().replace(/\s+/g, '_') : 'otaku'),
            name: u.name || u.username || 'Отаку',
            email: u.email,
            passwordHash: u.passwordHash || '',
            avatar: u.avatar || u.image || 'https://s4.anilist.co/file/anilistcdn/character/large/b40-MNypXsxSRb1R.png',
            banner: u.banner || undefined,
            bio: u.bio || 'Исследователь вселенной KuroNami.',
            role: u.role || 'user',
            level: u.level || 1,
            createdAt: u.createdAt.toISOString(),
            updatedAt: u.updatedAt.toISOString(),
          };
        }
      } catch (err) {
        console.error('Postgres findUserById error:', err);
      }
    }

    this.ensureLoaded();
    return this.inMemoryData.users.find((u) => u.id === id) || null;
  }

  async findUserByLoginId(identifier: string): Promise<DBUserRecord | null> {
    const byEmail = await this.findUserByEmail(identifier);
    if (byEmail) return byEmail;
    return this.findUserByUsername(identifier);
  }

  async updateUser(id: string, updates: Partial<DBUserRecord>): Promise<DBUserRecord | null> {
    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        const setObj: any = { updatedAt: new Date() };
        if (updates.name) setObj.name = updates.name;
        if (updates.bio !== undefined) setObj.bio = updates.bio;
        if (updates.avatar) setObj.avatar = updates.avatar;
        if (updates.banner !== undefined) setObj.banner = updates.banner;
        await db.update(schema.users).set(setObj).where(eq(schema.users.id, id));
      } catch (err) {
        console.error('Postgres updateUser error:', err);
      }
    }

    this.ensureLoaded();
    const idx = this.inMemoryData.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.inMemoryData.users[idx] = {
        ...this.inMemoryData.users[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.saveToFile();
      return this.inMemoryData.users[idx];
    }
    return this.findUserById(id);
  }

  // --- COMMENTS METHODS ---

  async createComment(comment: Omit<DBCommentRecord, 'id' | 'likesCount' | 'createdAt'>): Promise<DBCommentRecord> {
    const id = `comm_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const newRecord: DBCommentRecord = {
      ...comment,
      id,
      likesCount: 0,
      createdAt: now.toISOString(),
    };

    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        await db.insert(schema.episodeComments).values({
          id: newRecord.id,
          episodeId: newRecord.episodeId,
          animeId: newRecord.animeId,
          animeTitle: newRecord.animeTitle,
          animeCover: newRecord.animeCover,
          episodeNumber: newRecord.episodeNumber,
          userId: newRecord.userId,
          userName: newRecord.userName,
          username: newRecord.username,
          userAvatar: newRecord.userAvatar,
          parentId: newRecord.parentId || undefined,
          timecodeSeconds: newRecord.timecodeSeconds || undefined,
          content: newRecord.content,
          isSpoiler: newRecord.isSpoiler,
          likesCount: 0,
          createdAt: now,
        });
      } catch (err) {
        console.error('Postgres createComment error:', err);
      }
    }

    this.ensureLoaded();
    this.inMemoryData.comments.unshift(newRecord);
    this.saveToFile();
    return newRecord;
  }

  async getCommentsByEpisode(episodeId: string, animeId?: number): Promise<DBCommentRecord[]> {
    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        const rows = await db
          .select()
          .from(schema.episodeComments)
          .where(
            animeId !== undefined
              ? or(eq(schema.episodeComments.episodeId, episodeId), eq(schema.episodeComments.animeId, animeId))
              : eq(schema.episodeComments.episodeId, episodeId)
          )
          .orderBy(desc(schema.episodeComments.createdAt));

        if (rows.length > 0) {
          return rows.map((c) => ({
            id: c.id,
            episodeId: c.episodeId,
            animeId: c.animeId,
            animeTitle: c.animeTitle || undefined,
            animeCover: c.animeCover || undefined,
            episodeNumber: c.episodeNumber || undefined,
            userId: c.userId,
            userName: c.userName,
            username: c.username || undefined,
            userAvatar: c.userAvatar || undefined,
            parentId: c.parentId || undefined,
            timecodeSeconds: c.timecodeSeconds || undefined,
            content: c.content,
            isSpoiler: c.isSpoiler,
            likesCount: c.likesCount,
            createdAt: c.createdAt.toISOString(),
          }));
        }
      } catch (err) {
        console.error('Postgres getCommentsByEpisode error:', err);
      }
    }

    this.ensureLoaded();
    return this.inMemoryData.comments.filter(
      (c) => c.episodeId === episodeId || (animeId !== undefined && c.animeId === animeId)
    );
  }

  async getRecentComments(limit = 20): Promise<DBCommentRecord[]> {
    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        const rows = await db
          .select()
          .from(schema.episodeComments)
          .orderBy(desc(schema.episodeComments.createdAt))
          .limit(limit);

        if (rows.length > 0) {
          return rows.map((c) => ({
            id: c.id,
            episodeId: c.episodeId,
            animeId: c.animeId,
            animeTitle: c.animeTitle || undefined,
            animeCover: c.animeCover || undefined,
            episodeNumber: c.episodeNumber || undefined,
            userId: c.userId,
            userName: c.userName,
            username: c.username || undefined,
            userAvatar: c.userAvatar || undefined,
            parentId: c.parentId || undefined,
            timecodeSeconds: c.timecodeSeconds || undefined,
            content: c.content,
            isSpoiler: c.isSpoiler,
            likesCount: c.likesCount,
            createdAt: c.createdAt.toISOString(),
          }));
        }
      } catch (err) {
        console.error('Postgres getRecentComments error:', err);
      }
    }

    this.ensureLoaded();
    return this.inMemoryData.comments.slice(0, limit);
  }

  async likeComment(commentId: string): Promise<number | null> {
    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        await db
          .update(schema.episodeComments)
          .set({ likesCount: sql`${schema.episodeComments.likesCount} + 1` })
          .where(eq(schema.episodeComments.id, commentId));
      } catch {}
    }

    this.ensureLoaded();
    const comment = this.inMemoryData.comments.find((c) => c.id === commentId);
    if (!comment) return null;
    comment.likesCount += 1;
    this.saveToFile();
    return comment.likesCount;
  }

  // --- VIEWS & MOST WATCHED METHODS ---

  async recordAnimeView(data: {
    animeId: number;
    title: string;
    coverImage: string;
    score?: number;
    format?: string;
  }): Promise<DBViewRecord> {
    const now = new Date();

    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        await db
          .insert(schema.animeViewStats)
          .values({
            animeId: data.animeId,
            title: data.title,
            coverImage: data.coverImage,
            score: data.score || 0,
            format: data.format || 'TV',
            viewsCount: 1,
            lastViewedAt: now,
          })
          .onConflictDoUpdate({
            target: schema.animeViewStats.animeId,
            set: {
              viewsCount: sql`${schema.animeViewStats.viewsCount} + 1`,
              lastViewedAt: now,
              title: data.title || undefined,
              coverImage: data.coverImage || undefined,
            },
          });
      } catch (err) {
        console.error('Postgres recordAnimeView error:', err);
      }
    }

    this.ensureLoaded();
    const existing = this.inMemoryData.views.find((v) => v.animeId === data.animeId);
    if (existing) {
      existing.viewsCount += 1;
      existing.lastViewedAt = now.toISOString();
      if (data.title) existing.title = data.title;
      if (data.coverImage) existing.coverImage = data.coverImage;
      if (data.score !== undefined) existing.score = data.score;
      if (data.format) existing.format = data.format;
      this.saveToFile();
      return existing;
    }

    const newView: DBViewRecord = {
      animeId: data.animeId,
      title: data.title,
      coverImage: data.coverImage,
      score: data.score || 0,
      format: data.format || 'TV',
      viewsCount: 1,
      lastViewedAt: now.toISOString(),
    };
    this.inMemoryData.views.push(newView);
    this.saveToFile();
    return newView;
  }

  async getTopWatched(limit = 12): Promise<DBViewRecord[]> {
    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        const rows = await db
          .select()
          .from(schema.animeViewStats)
          .orderBy(desc(schema.animeViewStats.viewsCount))
          .limit(limit);

        if (rows.length > 0) {
          return rows.map((r) => ({
            animeId: r.animeId,
            title: r.title,
            coverImage: r.coverImage,
            score: r.score || 0,
            format: r.format || 'TV',
            viewsCount: r.viewsCount,
            lastViewedAt: r.lastViewedAt.toISOString(),
          }));
        }
      } catch (err) {
        console.error('Postgres getTopWatched error:', err);
      }
    }

    this.ensureLoaded();
    return [...this.inMemoryData.views]
      .sort((a, b) => b.viewsCount - a.viewsCount)
      .slice(0, limit);
  }

  // --- COLLECTIONS METHODS ---

  async createCollection(
    data: Omit<DBCollectionRecord, 'id' | 'likesCount' | 'createdAt' | 'updatedAt'>
  ): Promise<DBCollectionRecord> {
    const id = `col_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const nowStr = new Date().toISOString().split('T')[0];
    const newCol: DBCollectionRecord = {
      ...data,
      id,
      likesCount: 0,
      createdAt: nowStr,
      updatedAt: nowStr,
    };

    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        await db.insert(schema.userCollections).values({
          id: newCol.id,
          userId: newCol.userId,
          username: newCol.username,
          title: newCol.title,
          description: newCol.description,
          coverImage: newCol.coverImage,
          isPublic: newCol.isPublic,
          likesCount: 0,
        });

        if (newCol.animeIds.length > 0) {
          for (const animeId of newCol.animeIds) {
            await db.insert(schema.collectionItems).values({
              collectionId: newCol.id,
              animeId,
            });
          }
        }
      } catch (err) {
        console.error('Postgres createCollection error:', err);
      }
    }

    this.ensureLoaded();
    this.inMemoryData.collections.unshift(newCol);
    this.saveToFile();
    return newCol;
  }

  async getPublicCollections(): Promise<DBCollectionRecord[]> {
    this.ensureLoaded();
    return this.inMemoryData.collections.filter((c) => c.isPublic);
  }

  async getUserCollections(userIdOrUsername: string): Promise<DBCollectionRecord[]> {
    this.ensureLoaded();
    const clean = userIdOrUsername.trim().toLowerCase();
    return this.inMemoryData.collections.filter(
      (c) => c.userId === userIdOrUsername || c.username.toLowerCase() === clean
    );
  }

  async getCollectionById(id: string): Promise<DBCollectionRecord | null> {
    this.ensureLoaded();
    return this.inMemoryData.collections.find((c) => c.id === id) || null;
  }

  async updateCollection(id: string, updates: Partial<DBCollectionRecord>): Promise<DBCollectionRecord | null> {
    this.ensureLoaded();
    const idx = this.inMemoryData.collections.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    this.inMemoryData.collections[idx] = {
      ...this.inMemoryData.collections[idx],
      ...updates,
      updatedAt: new Date().toISOString().split('T')[0],
    };
    this.saveToFile();
    return this.inMemoryData.collections[idx];
  }

  async deleteCollection(id: string, userId: string): Promise<boolean> {
    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        await db.delete(schema.userCollections).where(eq(schema.userCollections.id, id));
      } catch {}
    }

    this.ensureLoaded();
    const target = this.inMemoryData.collections.find((c) => c.id === id);
    if (!target || target.userId !== userId) return false;
    this.inMemoryData.collections = this.inMemoryData.collections.filter((c) => c.id !== id);
    this.saveToFile();
    return true;
  }

  async addAnimeToCollection(collectionId: string, animeId: number): Promise<boolean> {
    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        await db.insert(schema.collectionItems).values({ collectionId, animeId });
      } catch {}
    }

    this.ensureLoaded();
    const target = this.inMemoryData.collections.find((c) => c.id === collectionId);
    if (!target) return false;
    if (!target.animeIds.includes(animeId)) {
      target.animeIds.push(animeId);
      target.updatedAt = new Date().toISOString().split('T')[0];
      this.saveToFile();
      return true;
    }
    return false;
  }

  async removeAnimeFromCollection(collectionId: string, animeId: number): Promise<boolean> {
    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        await db
          .delete(schema.collectionItems)
          .where(sql`${schema.collectionItems.collectionId} = ${collectionId} AND ${schema.collectionItems.animeId} = ${animeId}`);
      } catch {}
    }

    this.ensureLoaded();
    const target = this.inMemoryData.collections.find((c) => c.id === collectionId);
    if (!target) return false;
    target.animeIds = target.animeIds.filter((id) => id !== animeId);
    target.updatedAt = new Date().toISOString().split('T')[0];
    this.saveToFile();
    return true;
  }

  // --- BOOKMARKS & HISTORY SYNC METHODS ---

  async syncBookmarks(userId: string, bookmarksList: Omit<DBBookmarkRecord, 'id' | 'userId'>[]): Promise<DBBookmarkRecord[]> {
    this.ensureLoaded();
    for (const b of bookmarksList) {
      const id = `${userId}_${b.animeId}`;
      const existingIdx = this.inMemoryData.bookmarks.findIndex((item) => item.id === id);
      const record: DBBookmarkRecord = { ...b, id, userId };
      if (existingIdx >= 0) {
        this.inMemoryData.bookmarks[existingIdx] = record;
      } else {
        this.inMemoryData.bookmarks.push(record);
      }
    }
    this.saveToFile();
    return this.inMemoryData.bookmarks.filter((b) => b.userId === userId);
  }

  async getUserBookmarks(userId: string): Promise<DBBookmarkRecord[]> {
    this.ensureLoaded();
    return this.inMemoryData.bookmarks.filter((b) => b.userId === userId);
  }

  async syncHistory(userId: string, historyList: Omit<DBHistoryRecord, 'id' | 'userId'>[]): Promise<DBHistoryRecord[]> {
    this.ensureLoaded();
    for (const h of historyList) {
      const id = `${userId}_${h.animeId}_${h.episodeNumber}`;
      const existingIdx = this.inMemoryData.history.findIndex((item) => item.id === id);
      const record: DBHistoryRecord = { ...h, id, userId };
      if (existingIdx >= 0) {
        this.inMemoryData.history[existingIdx] = record;
      } else {
        this.inMemoryData.history.push(record);
      }
    }
    this.saveToFile();
    return this.inMemoryData.history.filter((h) => h.userId === userId);
  }

  async getUserHistory(userId: string): Promise<DBHistoryRecord[]> {
    this.ensureLoaded();
    return this.inMemoryData.history
      .filter((h) => h.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
}

export const dbRepo = new DatabaseRepository();
