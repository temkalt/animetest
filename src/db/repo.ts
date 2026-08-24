import { eq, or, and, desc, sql, inArray } from 'drizzle-orm';
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

interface InMemoryStorage {
  users: DBUserRecord[];
  comments: DBCommentRecord[];
  collections: DBCollectionRecord[];
  views: DBViewRecord[];
  bookmarks: DBBookmarkRecord[];
  history: DBHistoryRecord[];
}

class DatabaseRepository {
  private inMemoryData: InMemoryStorage = {
    users: [],
    comments: [],
    collections: [],
    views: [],
    bookmarks: [],
    history: [],
  };

  // --- USERS METHODS ---

  async createUser(record: Omit<DBUserRecord, 'createdAt' | 'updatedAt'>): Promise<DBUserRecord> {
    const now = new Date();
    const newUser: DBUserRecord = {
      ...record,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

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
          createdAt: now,
          updatedAt: now,
        });
        return newUser;
      } catch (err) {
        console.error('Postgres createUser error:', err);
      }
    }

    this.inMemoryData.users.push(newUser);
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
        return null;
      } catch (err) {
        console.error('Postgres findUserByEmail error:', err);
      }
    }

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
          .where(
            or(
              sql`lower(${schema.users.username}) = ${clean}`,
              sql`lower(${schema.users.name}) = ${clean}`
            )
          )
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
        return null;
      } catch (err) {
        console.error('Postgres findUserByUsername error:', err);
      }
    }

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
        const rows = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.id, id))
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
        return null;
      } catch (err) {
        console.error('Postgres findUserById error:', err);
      }
    }

    return this.inMemoryData.users.find((u) => u.id === id) || null;
  }

  async findUserByLoginId(identifier: string): Promise<DBUserRecord | null> {
    const byEmail = await this.findUserByEmail(identifier);
    if (byEmail) return byEmail;
    return this.findUserByUsername(identifier);
  }

  async updateUser(id: string, updates: Partial<DBUserRecord>): Promise<DBUserRecord | null> {
    const now = new Date();

    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        const setObj: Record<string, any> = { updatedAt: now };
        if (updates.name !== undefined) setObj.name = updates.name;
        if (updates.username !== undefined) setObj.username = updates.username;
        if (updates.bio !== undefined) setObj.bio = updates.bio;
        if (updates.avatar !== undefined) setObj.avatar = updates.avatar;
        if (updates.banner !== undefined) setObj.banner = updates.banner;
        if (updates.role !== undefined) setObj.role = updates.role;
        if (updates.level !== undefined) setObj.level = updates.level;

        await db.update(schema.users).set(setObj).where(eq(schema.users.id, id));
        return this.findUserById(id);
      } catch (err) {
        console.error('Postgres updateUser error:', err);
      }
    }

    const idx = this.inMemoryData.users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      this.inMemoryData.users[idx] = {
        ...this.inMemoryData.users[idx],
        ...updates,
        updatedAt: now.toISOString(),
      };
      return this.inMemoryData.users[idx];
    }
    return null;
  }

  // --- COMMENTS METHODS ---

  async createComment(
    comment: Omit<DBCommentRecord, 'id' | 'likesCount' | 'createdAt'>
  ): Promise<DBCommentRecord> {
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
          animeTitle: newRecord.animeTitle ?? null,
          animeCover: newRecord.animeCover ?? null,
          episodeNumber: newRecord.episodeNumber ?? null,
          userId: newRecord.userId,
          userName: newRecord.userName,
          username: newRecord.username ?? null,
          userAvatar: newRecord.userAvatar ?? null,
          parentId: newRecord.parentId ?? null,
          timecodeSeconds: newRecord.timecodeSeconds ?? null,
          content: newRecord.content,
          isSpoiler: newRecord.isSpoiler,
          likesCount: 0,
          createdAt: now,
        });
        return newRecord;
      } catch (err) {
        console.error('Postgres createComment error:', err);
      }
    }

    this.inMemoryData.comments.unshift(newRecord);
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
            animeId !== undefined && animeId > 0
              ? or(eq(schema.episodeComments.episodeId, episodeId), eq(schema.episodeComments.animeId, animeId))
              : eq(schema.episodeComments.episodeId, episodeId)
          )
          .orderBy(desc(schema.episodeComments.createdAt));

        return rows.map((c) => ({
          id: c.id,
          episodeId: c.episodeId,
          animeId: c.animeId,
          animeTitle: c.animeTitle || undefined,
          animeCover: c.animeCover || undefined,
          episodeNumber: c.episodeNumber ?? undefined,
          userId: c.userId,
          userName: c.userName,
          username: c.username || undefined,
          userAvatar: c.userAvatar || undefined,
          parentId: c.parentId || undefined,
          timecodeSeconds: c.timecodeSeconds ?? undefined,
          content: c.content,
          isSpoiler: c.isSpoiler,
          likesCount: c.likesCount,
          createdAt: c.createdAt.toISOString(),
        }));
      } catch (err) {
        console.error('Postgres getCommentsByEpisode error:', err);
      }
    }

    return this.inMemoryData.comments.filter(
      (c) => c.episodeId === episodeId || (animeId !== undefined && animeId > 0 && c.animeId === animeId)
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

        return rows.map((c) => ({
          id: c.id,
          episodeId: c.episodeId,
          animeId: c.animeId,
          animeTitle: c.animeTitle || undefined,
          animeCover: c.animeCover || undefined,
          episodeNumber: c.episodeNumber ?? undefined,
          userId: c.userId,
          userName: c.userName,
          username: c.username || undefined,
          userAvatar: c.userAvatar || undefined,
          parentId: c.parentId || undefined,
          timecodeSeconds: c.timecodeSeconds ?? undefined,
          content: c.content,
          isSpoiler: c.isSpoiler,
          likesCount: c.likesCount,
          createdAt: c.createdAt.toISOString(),
        }));
      } catch (err) {
        console.error('Postgres getRecentComments error:', err);
      }
    }

    return this.inMemoryData.comments.slice(0, limit);
  }

  async likeComment(commentId: string): Promise<number | null> {
    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        const updated = await db
          .update(schema.episodeComments)
          .set({ likesCount: sql`${schema.episodeComments.likesCount} + 1` })
          .where(eq(schema.episodeComments.id, commentId))
          .returning({ likesCount: schema.episodeComments.likesCount });

        if (updated.length > 0) {
          return updated[0].likesCount;
        }
        return null;
      } catch (err) {
        console.error('Postgres likeComment error:', err);
      }
    }

    const comment = this.inMemoryData.comments.find((c) => c.id === commentId);
    if (!comment) return null;
    comment.likesCount += 1;
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
              score: data.score !== undefined ? data.score : undefined,
              format: data.format || undefined,
            },
          });

        const rows = await db
          .select()
          .from(schema.animeViewStats)
          .where(eq(schema.animeViewStats.animeId, data.animeId))
          .limit(1);

        if (rows.length > 0) {
          const r = rows[0];
          return {
            animeId: r.animeId,
            title: r.title,
            coverImage: r.coverImage,
            score: r.score ?? 0,
            format: r.format || 'TV',
            viewsCount: r.viewsCount,
            lastViewedAt: r.lastViewedAt.toISOString(),
          };
        }
      } catch (err) {
        console.error('Postgres recordAnimeView error:', err);
      }
    }

    const existing = this.inMemoryData.views.find((v) => v.animeId === data.animeId);
    if (existing) {
      existing.viewsCount += 1;
      existing.lastViewedAt = now.toISOString();
      if (data.title) existing.title = data.title;
      if (data.coverImage) existing.coverImage = data.coverImage;
      if (data.score !== undefined) existing.score = data.score;
      if (data.format) existing.format = data.format;
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

        return rows.map((r) => ({
          animeId: r.animeId,
          title: r.title,
          coverImage: r.coverImage,
          score: r.score ?? 0,
          format: r.format || 'TV',
          viewsCount: r.viewsCount,
          lastViewedAt: r.lastViewedAt.toISOString(),
        }));
      } catch (err) {
        console.error('Postgres getTopWatched error:', err);
      }
    }

    return [...this.inMemoryData.views]
      .sort((a, b) => b.viewsCount - a.viewsCount)
      .slice(0, limit);
  }

  // --- COLLECTIONS METHODS ---

  async createCollection(
    data: Omit<DBCollectionRecord, 'id' | 'likesCount' | 'createdAt' | 'updatedAt'>
  ): Promise<DBCollectionRecord> {
    const id = `col_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const newCol: DBCollectionRecord = {
      ...data,
      id,
      likesCount: 0,
      createdAt: dateStr,
      updatedAt: dateStr,
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
          coverImage: newCol.coverImage ?? null,
          isPublic: newCol.isPublic,
          likesCount: 0,
          createdAt: now,
          updatedAt: now,
        });

        if (newCol.animeIds.length > 0) {
          for (const animeId of newCol.animeIds) {
            await db.insert(schema.collectionItems).values({
              id: `ci_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              collectionId: newCol.id,
              animeId,
              createdAt: now,
            });
          }
        }
        return newCol;
      } catch (err) {
        console.error('Postgres createCollection error:', err);
      }
    }

    this.inMemoryData.collections.unshift(newCol);
    return newCol;
  }

  async getPublicCollections(): Promise<DBCollectionRecord[]> {
    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        const collections = await db
          .select()
          .from(schema.userCollections)
          .where(eq(schema.userCollections.isPublic, true))
          .orderBy(desc(schema.userCollections.createdAt));

        if (collections.length === 0) return [];

        const collectionIds = collections.map((c) => c.id);
        const items = await db
          .select()
          .from(schema.collectionItems)
          .where(inArray(schema.collectionItems.collectionId, collectionIds));

        const itemsMap = new Map<string, number[]>();
        for (const item of items) {
          const arr = itemsMap.get(item.collectionId) || [];
          arr.push(item.animeId);
          itemsMap.set(item.collectionId, arr);
        }

        return collections.map((c) => ({
          id: c.id,
          userId: c.userId,
          username: c.username,
          title: c.title,
          description: c.description || '',
          coverImage: c.coverImage || undefined,
          isPublic: c.isPublic,
          animeIds: itemsMap.get(c.id) || [],
          likesCount: c.likesCount,
          createdAt: c.createdAt.toISOString().split('T')[0],
          updatedAt: c.updatedAt.toISOString().split('T')[0],
        }));
      } catch (err) {
        console.error('Postgres getPublicCollections error:', err);
      }
    }

    return this.inMemoryData.collections.filter((c) => c.isPublic);
  }

  async getUserCollections(userIdOrUsername: string): Promise<DBCollectionRecord[]> {
    const clean = userIdOrUsername.trim().toLowerCase();

    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        const collections = await db
          .select()
          .from(schema.userCollections)
          .where(
            or(
              eq(schema.userCollections.userId, userIdOrUsername),
              sql`lower(${schema.userCollections.username}) = ${clean}`
            )
          )
          .orderBy(desc(schema.userCollections.createdAt));

        if (collections.length === 0) return [];

        const collectionIds = collections.map((c) => c.id);
        const items = await db
          .select()
          .from(schema.collectionItems)
          .where(inArray(schema.collectionItems.collectionId, collectionIds));

        const itemsMap = new Map<string, number[]>();
        for (const item of items) {
          const arr = itemsMap.get(item.collectionId) || [];
          arr.push(item.animeId);
          itemsMap.set(item.collectionId, arr);
        }

        return collections.map((c) => ({
          id: c.id,
          userId: c.userId,
          username: c.username,
          title: c.title,
          description: c.description || '',
          coverImage: c.coverImage || undefined,
          isPublic: c.isPublic,
          animeIds: itemsMap.get(c.id) || [],
          likesCount: c.likesCount,
          createdAt: c.createdAt.toISOString().split('T')[0],
          updatedAt: c.updatedAt.toISOString().split('T')[0],
        }));
      } catch (err) {
        console.error('Postgres getUserCollections error:', err);
      }
    }

    return this.inMemoryData.collections.filter(
      (c) => c.userId === userIdOrUsername || c.username.toLowerCase() === clean
    );
  }

  async getCollectionById(id: string): Promise<DBCollectionRecord | null> {
    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        const collections = await db
          .select()
          .from(schema.userCollections)
          .where(eq(schema.userCollections.id, id))
          .limit(1);

        if (collections.length === 0) return null;
        const c = collections[0];

        const items = await db
          .select()
          .from(schema.collectionItems)
          .where(eq(schema.collectionItems.collectionId, id));

        return {
          id: c.id,
          userId: c.userId,
          username: c.username,
          title: c.title,
          description: c.description || '',
          coverImage: c.coverImage || undefined,
          isPublic: c.isPublic,
          animeIds: items.map((it) => it.animeId),
          likesCount: c.likesCount,
          createdAt: c.createdAt.toISOString().split('T')[0],
          updatedAt: c.updatedAt.toISOString().split('T')[0],
        };
      } catch (err) {
        console.error('Postgres getCollectionById error:', err);
      }
    }

    return this.inMemoryData.collections.find((c) => c.id === id) || null;
  }

  async updateCollection(
    id: string,
    updates: Partial<DBCollectionRecord>
  ): Promise<DBCollectionRecord | null> {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        const setObj: Record<string, any> = { updatedAt: now };
        if (updates.title !== undefined) setObj.title = updates.title;
        if (updates.description !== undefined) setObj.description = updates.description;
        if (updates.coverImage !== undefined) setObj.coverImage = updates.coverImage;
        if (updates.isPublic !== undefined) setObj.isPublic = updates.isPublic;

        await db.update(schema.userCollections).set(setObj).where(eq(schema.userCollections.id, id));

        if (Array.isArray(updates.animeIds)) {
          await db.delete(schema.collectionItems).where(eq(schema.collectionItems.collectionId, id));
          for (const animeId of updates.animeIds) {
            await db.insert(schema.collectionItems).values({
              id: `ci_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              collectionId: id,
              animeId,
              createdAt: now,
            });
          }
        }

        return this.getCollectionById(id);
      } catch (err) {
        console.error('Postgres updateCollection error:', err);
      }
    }

    const idx = this.inMemoryData.collections.findIndex((c) => c.id === id);
    if (idx !== -1) {
      this.inMemoryData.collections[idx] = {
        ...this.inMemoryData.collections[idx],
        ...updates,
        updatedAt: dateStr,
      };
      return this.inMemoryData.collections[idx];
    }
    return null;
  }

  async deleteCollection(id: string, userId: string): Promise<boolean> {
    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        const existing = await db
          .select()
          .from(schema.userCollections)
          .where(eq(schema.userCollections.id, id))
          .limit(1);

        if (existing.length === 0 || existing[0].userId !== userId) {
          return false;
        }

        await db.delete(schema.userCollections).where(
          and(
            eq(schema.userCollections.id, id),
            eq(schema.userCollections.userId, userId)
          )
        );
        return true;
      } catch (err) {
        console.error('Postgres deleteCollection error:', err);
        return false;
      }
    }

    const target = this.inMemoryData.collections.find((c) => c.id === id);
    if (!target || target.userId !== userId) return false;
    this.inMemoryData.collections = this.inMemoryData.collections.filter((c) => c.id !== id);
    return true;
  }

  async addAnimeToCollection(collectionId: string, animeId: number): Promise<boolean> {
    const now = new Date();

    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        const existing = await db
          .select()
          .from(schema.collectionItems)
          .where(
            and(
              eq(schema.collectionItems.collectionId, collectionId),
              eq(schema.collectionItems.animeId, animeId)
            )
          )
          .limit(1);

        if (existing.length === 0) {
          await db.insert(schema.collectionItems).values({
            id: `ci_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            collectionId,
            animeId,
            createdAt: now,
          });

          await db
            .update(schema.userCollections)
            .set({ updatedAt: now })
            .where(eq(schema.userCollections.id, collectionId));
        }
        return true;
      } catch (err) {
        console.error('Postgres addAnimeToCollection error:', err);
        return false;
      }
    }

    const target = this.inMemoryData.collections.find((c) => c.id === collectionId);
    if (!target) return false;
    if (!target.animeIds.includes(animeId)) {
      target.animeIds.push(animeId);
      target.updatedAt = now.toISOString().split('T')[0];
    }
    return true;
  }

  async removeAnimeFromCollection(collectionId: string, animeId: number): Promise<boolean> {
    const now = new Date();

    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        await db
          .delete(schema.collectionItems)
          .where(
            and(
              eq(schema.collectionItems.collectionId, collectionId),
              eq(schema.collectionItems.animeId, animeId)
            )
          );

        await db
          .update(schema.userCollections)
          .set({ updatedAt: now })
          .where(eq(schema.userCollections.id, collectionId));

        return true;
      } catch (err) {
        console.error('Postgres removeAnimeFromCollection error:', err);
        return false;
      }
    }

    const target = this.inMemoryData.collections.find((c) => c.id === collectionId);
    if (!target) return false;
    target.animeIds = target.animeIds.filter((id) => id !== animeId);
    target.updatedAt = now.toISOString().split('T')[0];
    return true;
  }

  // --- BOOKMARKS & HISTORY SYNC METHODS ---

  async syncBookmarks(
    userId: string,
    bookmarksList: Omit<DBBookmarkRecord, 'id' | 'userId'>[]
  ): Promise<DBBookmarkRecord[]> {
    const now = new Date();

    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        for (const b of bookmarksList) {
          await db
            .insert(schema.bookmarks)
            .values({
              userId,
              animeId: b.animeId,
              status: b.status,
              score: b.score ?? null,
              isFavorite: b.isFavorite ?? false,
              customFolder: b.customFolder ?? null,
              animeTitle: b.animeTitle ?? null,
              animeCover: b.animeCover ?? null,
              animeFormat: b.animeFormat ?? null,
              animeScore: b.animeScore ?? null,
              animeTotalEpisodes: b.animeTotalEpisodes ?? null,
              createdAt: now,
              updatedAt: now,
            })
            .onConflictDoUpdate({
              target: [schema.bookmarks.userId, schema.bookmarks.animeId],
              set: {
                status: b.status,
                score: b.score ?? null,
                isFavorite: b.isFavorite ?? false,
                customFolder: b.customFolder ?? null,
                animeTitle: b.animeTitle ?? null,
                animeCover: b.animeCover ?? null,
                animeFormat: b.animeFormat ?? null,
                animeScore: b.animeScore ?? null,
                animeTotalEpisodes: b.animeTotalEpisodes ?? null,
                updatedAt: now,
              },
            });
        }
        return this.getUserBookmarks(userId);
      } catch (err) {
        console.error('Postgres syncBookmarks error:', err);
      }
    }

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
    return this.inMemoryData.bookmarks.filter((b) => b.userId === userId);
  }

  async getUserBookmarks(userId: string): Promise<DBBookmarkRecord[]> {
    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        const rows = await db
          .select()
          .from(schema.bookmarks)
          .where(eq(schema.bookmarks.userId, userId))
          .orderBy(desc(schema.bookmarks.updatedAt));

        return rows.map((b) => ({
          id: `${b.userId}_${b.animeId}`,
          userId: b.userId,
          animeId: b.animeId,
          status: b.status as DBBookmarkRecord['status'],
          score: b.score ?? undefined,
          isFavorite: b.isFavorite,
          customFolder: b.customFolder ?? undefined,
          animeTitle: b.animeTitle ?? undefined,
          animeCover: b.animeCover ?? undefined,
          animeFormat: b.animeFormat ?? undefined,
          animeScore: b.animeScore ?? undefined,
          animeTotalEpisodes: b.animeTotalEpisodes ?? undefined,
          updatedAt: b.updatedAt.toISOString(),
        }));
      } catch (err) {
        console.error('Postgres getUserBookmarks error:', err);
      }
    }

    return this.inMemoryData.bookmarks.filter((b) => b.userId === userId);
  }

  async syncHistory(
    userId: string,
    historyList: Omit<DBHistoryRecord, 'id' | 'userId'>[]
  ): Promise<DBHistoryRecord[]> {
    const now = new Date();

    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        for (const h of historyList) {
          const id = `${userId}_${h.animeId}_${h.episodeNumber}`;
          const calculatedProgress =
            h.progressPercentage ??
            (h.durationSeconds > 0 ? (h.currentTimeSeconds / h.durationSeconds) * 100 : 0);

          await db
            .insert(schema.watchHistory)
            .values({
              id,
              userId,
              animeId: h.animeId,
              episodeNumber: h.episodeNumber,
              currentTimeSeconds: h.currentTimeSeconds,
              durationSeconds: h.durationSeconds,
              progressPercentage: calculatedProgress,
              isCompleted: h.isCompleted ?? false,
              teamName: h.teamName ?? null,
              animeTitle: h.animeTitle ?? null,
              animeCover: h.animeCover ?? null,
              animeTotalEpisodes: h.animeTotalEpisodes ?? null,
              animeFormat: h.animeFormat ?? null,
              updatedAt: now,
            })
            .onConflictDoUpdate({
              target: schema.watchHistory.id,
              set: {
                currentTimeSeconds: h.currentTimeSeconds,
                durationSeconds: h.durationSeconds,
                progressPercentage: calculatedProgress,
                isCompleted: h.isCompleted ?? false,
                teamName: h.teamName ?? null,
                animeTitle: h.animeTitle ?? null,
                animeCover: h.animeCover ?? null,
                animeTotalEpisodes: h.animeTotalEpisodes ?? null,
                animeFormat: h.animeFormat ?? null,
                updatedAt: now,
              },
            });
        }
        return this.getUserHistory(userId);
      } catch (err) {
        console.error('Postgres syncHistory error:', err);
      }
    }

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
    return this.inMemoryData.history.filter((h) => h.userId === userId);
  }

  async getUserHistory(userId: string): Promise<DBHistoryRecord[]> {
    if (isPostgresConfigured && db) {
      await ensurePostgresTables();
      try {
        const rows = await db
          .select()
          .from(schema.watchHistory)
          .where(eq(schema.watchHistory.userId, userId))
          .orderBy(desc(schema.watchHistory.updatedAt));

        return rows.map((h) => ({
          id: h.id,
          userId: h.userId,
          animeId: h.animeId,
          episodeNumber: h.episodeNumber,
          currentTimeSeconds: h.currentTimeSeconds,
          durationSeconds: h.durationSeconds,
          progressPercentage: h.progressPercentage ?? 0,
          isCompleted: h.isCompleted,
          teamName: h.teamName ?? undefined,
          animeTitle: h.animeTitle ?? undefined,
          animeCover: h.animeCover ?? undefined,
          animeTotalEpisodes: h.animeTotalEpisodes ?? undefined,
          animeFormat: h.animeFormat ?? undefined,
          updatedAt: h.updatedAt.toISOString(),
        }));
      } catch (err) {
        console.error('Postgres getUserHistory error:', err);
      }
    }

    return this.inMemoryData.history
      .filter((h) => h.userId === userId)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }
}

export const dbRepo = new DatabaseRepository();

