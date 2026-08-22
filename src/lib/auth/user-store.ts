'use client';

import { UserProfile, UserCollection, GlobalComment } from '@/types';
import { realtimeHub } from '@/lib/utils/realtime';
export type { UserProfile, UserCollection, GlobalComment };

export const DEFAULT_AVATARS = [
  'https://s4.anilist.co/file/anilistcdn/character/large/b40-MNypXsxSRb1R.png',     // Луффи
  'https://s4.anilist.co/file/anilistcdn/character/large/b127691-9zqh1xpIubn7.png',  // Годжо
  'https://s4.anilist.co/file/anilistcdn/character/large/b137080-UHcynYNjb5ZU.png',  // Макима
  'https://s4.anilist.co/file/anilistcdn/character/large/b126071-BTNEc1nRIv68.png',  // Танджиро
  'https://s4.anilist.co/file/anilistcdn/character/large/b45627-CR68RyZmddGG.png',   // Леви
  'https://s4.anilist.co/file/anilistcdn/character/large/b176754-PCnpqIOkjhFk.png',  // Фрирен
  'https://s4.anilist.co/file/anilistcdn/character/large/b126635-L0y3I92JSUkN.png',  // Мегуми
  'https://s4.anilist.co/file/anilistcdn/character/large/b137079-6yLEUYR3bmpr.png',  // Пауэр
  'https://s4.anilist.co/file/anilistcdn/character/large/b17-phjcWCkRuIhu.png',      // Наруто
  'https://s4.anilist.co/file/anilistcdn/character/large/b62-S7oAeA9WInjV.png',      // Зоро
  'https://s4.anilist.co/file/anilistcdn/character/large/b27-Z5O02kQUydpT.jpg',      // Киллуа
  'https://s4.anilist.co/file/anilistcdn/character/large/b40882-dsj7IP943WFF.jpg',   // Эрен
];

// Empty defaults - collections and comments are created strictly by real users
const INITIAL_COLLECTIONS: UserCollection[] = [];
const INITIAL_COMMENTS: GlobalComment[] = [];

class AuthStore {
  private currentUser: UserProfile | null = null;
  private userListeners: Array<(user: UserProfile | null) => void> = [];
  private collectionsListeners: Array<(collections: UserCollection[]) => void> = [];
  private commentsListeners: Array<(comments: GlobalComment[]) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('kuronami_current_user');
      if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          if (u && typeof u === 'object') {
            if (!u.username && u.name) {
              u.username = this.normalizeUsername(u.name) || 'kuronami';
            }
            if (!u.name && u.username) {
              u.name = u.username;
            }
            this.currentUser = u;
          }
        } catch {
          this.currentUser = null;
        }
      }

      // Sync across browser tabs and components in real-time
      realtimeHub.on('comments_updated', () => {
        const comms = this.getRecentComments(10);
        this.commentsListeners.forEach((l) => l(comms));
      });

      realtimeHub.on('collections_updated', () => {
        const all = this.getAllCollections();
        this.collectionsListeners.forEach((l) => l(all));
      });

      realtimeHub.on('user_updated', () => {
        try {
          const saved = localStorage.getItem('kuronami_current_user');
          this.currentUser = saved ? JSON.parse(saved) : null;
          this.userListeners.forEach((l) => l(this.currentUser));
        } catch {}
      });
    }
  }

  // --- AUTH METHODS ---

  getUser(): UserProfile | null {
    if (typeof window !== 'undefined' && !this.currentUser) {
      const saved = localStorage.getItem('kuronami_current_user');
      if (saved) {
        try {
          const u = JSON.parse(saved);
          if (u && typeof u === 'object') {
            if (!u.username && u.name) {
              u.username = this.normalizeUsername(u.name) || 'kuronami';
            }
            if (!u.name && u.username) {
              u.name = u.username;
            }
            if (!u.avatar) {
              u.avatar = DEFAULT_AVATARS[0];
            }
            this.currentUser = u;
          }
        } catch {
          this.currentUser = null;
        }
      }
    }
    return this.currentUser;
  }

  isAuthenticated(): boolean {
    return Boolean(this.getUser());
  }

  subscribe(listener: (user: UserProfile | null) => void) {
    this.userListeners.push(listener);
    listener(this.getUser());
    return () => {
      this.userListeners = this.userListeners.filter((l) => l !== listener);
    };
  }

  private notifyUser() {
    this.userListeners.forEach((l) => l(this.currentUser));
  }

  // Transliterate Cyrillic to Latin for clean handles
  private transliterate(text: string): string {
    const map: Record<string, string> = {
      а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh',
      з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o',
      п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
      ч: 'ch', ш: 'sh', щ: 'shch', ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya'
    };
    return text.split('').map((char) => map[char.toLowerCase()] || char).join('');
  }

  // Normalize username (lowercase, alphanumeric + underscore, max 24 chars)
  normalizeUsername(raw: string): string {
    if (!raw) return '';
    const transliterated = this.transliterate(raw.trim().toLowerCase());
    return transliterated
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 24);
  }

  isUsernameTaken(username: string, excludeUserId?: string): boolean {
    const clean = this.normalizeUsername(username);
    if (!clean) return true;

    // Check reserved system handles
    const reserved = ['admin', 'administrator', 'system', 'root', 'support', 'bot', 'moderator'];
    if (reserved.includes(clean)) return true;

    const users = this.getAllRegisteredUsers();
    return users.some(
      (u) =>
        (this.normalizeUsername(u.username) === clean || (u.name && this.normalizeUsername(u.name) === clean)) &&
        u.id !== excludeUserId
    );
  }

  isEmailTaken(email: string, excludeUserId?: string): boolean {
    const clean = email.trim().toLowerCase();
    if (!clean) return true;
    const users = this.getAllRegisteredUsers();
    return users.some((u) => u.email?.toLowerCase() === clean && u.id !== excludeUserId);
  }

  register(params: {
    username: string;
    name?: string;
    email: string;
    password?: string;
    avatar?: string;
  }): UserProfile {
    const cleanUsername = this.normalizeUsername(params.username) || `otaku_${Date.now()}`;
    const cleanEmail = params.email.trim().toLowerCase();

    if (this.isUsernameTaken(cleanUsername)) {
      throw new Error(`Никнейм @${cleanUsername} уже занят. Пожалуйста, выберите другой.`);
    }

    if (this.isEmailTaken(cleanEmail)) {
      throw new Error(`Пользователь с email ${cleanEmail} уже зарегистрирован.`);
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      username: cleanUsername,
      name: params.name?.trim() || cleanUsername,
      email: cleanEmail,
      avatar: params.avatar || DEFAULT_AVATARS[0],
      bio: 'Исследователь вселенной KuroNami.',
      role: 'Отаку',
      level: 1,
      joinedAt: new Date().toISOString().split('T')[0],
      collectionsCount: 0,
    };

    if (typeof window !== 'undefined') {
      const allUsers = this.getAllRegisteredUsers();
      allUsers.push(newUser);
      localStorage.setItem('kuronami_users', JSON.stringify(allUsers));
      localStorage.setItem('kuronami_current_user', JSON.stringify(newUser));
    }

    this.currentUser = newUser;
    this.notifyUser();
    return newUser;
  }

  login(identifier: string): UserProfile {
    const clean = identifier.trim().toLowerCase();
    const allUsers = this.getAllRegisteredUsers();

    // Match by email or username
    const existing = allUsers.find(
      (u) => u.email === clean || u.username.toLowerCase() === clean
    );

    if (!existing) {
      throw new Error('Пользователь не найден. Проверьте никнейм или зарегистрируйтесь.');
    }

    if (typeof window !== 'undefined') {
      localStorage.setItem('kuronami_current_user', JSON.stringify(existing));
    }

    this.currentUser = existing;
    this.notifyUser();
    return existing;
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kuronami_current_user');
    }
    this.currentUser = null;
    this.notifyUser();
  }

  updateProfile(updates: Partial<UserProfile>): UserProfile | null {
    if (!this.currentUser) return null;

    if (updates.username && updates.username !== this.currentUser.username) {
      const cleanUsername = this.normalizeUsername(updates.username);
      if (this.isUsernameTaken(cleanUsername, this.currentUser.id)) {
        throw new Error(`Никнейм @${cleanUsername} уже занят.`);
      }
      updates.username = cleanUsername;
    }

    this.currentUser = { ...this.currentUser, ...updates };

    if (typeof window !== 'undefined') {
      localStorage.setItem('kuronami_current_user', JSON.stringify(this.currentUser));
      const allUsers = this.getAllRegisteredUsers().map((u) =>
        u.id === this.currentUser?.id ? this.currentUser! : u
      );
      localStorage.setItem('kuronami_users', JSON.stringify(allUsers));
    }

    this.notifyUser();
    return this.currentUser;
  }

  getAllRegisteredUsers(): UserProfile[] {
    if (typeof window === 'undefined') return [];
    try {
      const list = localStorage.getItem('kuronami_users');
      return list ? JSON.parse(list) : [];
    } catch {
      return [];
    }
  }

  // Public Profile retrieval (Guarantees EMAIL IS NEVER EXPOSED)
  getPublicProfile(username: string): Omit<UserProfile, 'email'> | null {
    if (!username || username === 'undefined' || username === 'null') {
      const current = this.getUser();
      if (current) {
        const { email: _email, ...safeProfile } = current;
        return safeProfile;
      }
      return {
        id: 'usr_kuronami',
        username: 'kuronami',
        name: 'KuroNami',
        avatar: DEFAULT_AVATARS[0],
        bio: 'Участник аниме-сообщества KuroNami.',
        role: 'Отаку',
        level: 1,
        joinedAt: '2026-08-01',
        collectionsCount: 0,
      };
    }

    const clean = this.normalizeUsername(decodeURIComponent(username));
    if (!clean) return null;

    if (this.currentUser && (this.currentUser.username === clean || this.normalizeUsername(this.currentUser.name) === clean)) {
      const { email: _email, ...safeProfile } = this.currentUser;
      return safeProfile;
    }

    const allUsers = this.getAllRegisteredUsers();
    const user = allUsers.find((u) => u.username === clean || this.normalizeUsername(u.name) === clean);
    if (user) {
      const { email: _email, ...safeProfile } = user;
      return safeProfile;
    }

    // Dynamic public profile for comment author
    return {
      id: `usr_${clean}`,
      username: clean,
      name: clean.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      avatar: DEFAULT_AVATARS[0],
      bio: 'Участник аниме-сообщества KuroNami.',
      role: 'Отаку',
      level: 1,
      joinedAt: '2026-08-01',
      collectionsCount: 0,
    };
  }

  // --- COLLECTIONS METHODS ---

  getAllCollections(): UserCollection[] {
    if (typeof window === 'undefined') return INITIAL_COLLECTIONS;
    try {
      const saved = localStorage.getItem('kuronami_collections');
      return saved ? JSON.parse(saved) : INITIAL_COLLECTIONS;
    } catch {
      return INITIAL_COLLECTIONS;
    }
  }

  getUserCollections(usernameOrUserId: string): UserCollection[] {
    const all = this.getAllCollections();
    const clean = this.normalizeUsername(usernameOrUserId);
    return all.filter((c) => c.userId === usernameOrUserId || c.username === clean || c.username === usernameOrUserId);
  }

  getPublicCollections(): UserCollection[] {
    const all = this.getAllCollections();
    return all.filter((c) => c.isPublic);
  }

  getCollectionById(id: string): UserCollection | null {
    const all = this.getAllCollections();
    return all.find((c) => c.id === id) || null;
  }

  subscribeCollections(listener: (collections: UserCollection[]) => void) {
    this.collectionsListeners.push(listener);
    listener(this.getAllCollections());
    return () => {
      this.collectionsListeners = this.collectionsListeners.filter((l) => l !== listener);
    };
  }

  private notifyCollections() {
    const cols = this.getAllCollections();
    this.collectionsListeners.forEach((l) => l(cols));
  }

  createCollection(params: {
    title: string;
    description: string;
    coverImage?: string;
    isPublic?: boolean;
    initialAnimeIds?: number[];
  }): UserCollection {
    const user = this.getUser();
    if (!user) throw new Error('Для создания коллекции необходимо войти в аккаунт');

    const newCol: UserCollection = {
      id: `col_${Date.now()}`,
      userId: user.id,
      username: user.username,
      title: params.title.trim(),
      description: params.description.trim(),
      coverImage:
        params.coverImage ||
        'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
      isPublic: params.isPublic !== undefined ? params.isPublic : true,
      animeIds: params.initialAnimeIds || [],
      likesCount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    const all = this.getAllCollections();
    all.unshift(newCol);

    if (typeof window !== 'undefined') {
      localStorage.setItem('kuronami_collections', JSON.stringify(all));
    }

    this.notifyCollections();
    return newCol;
  }

  addAnimeToCollection(collectionId: string, animeId: number): boolean {
    const all = this.getAllCollections();
    const target = all.find((c) => c.id === collectionId);
    if (!target) return false;

    if (!target.animeIds.includes(animeId)) {
      target.animeIds.push(animeId);
      target.updatedAt = new Date().toISOString().split('T')[0];
      if (typeof window !== 'undefined') {
        localStorage.setItem('kuronami_collections', JSON.stringify(all));
      }
      this.notifyCollections();
      return true;
    }
    return false;
  }

  removeAnimeFromCollection(collectionId: string, animeId: number): boolean {
    const all = this.getAllCollections();
    const target = all.find((c) => c.id === collectionId);
    if (!target) return false;

    target.animeIds = target.animeIds.filter((id) => id !== animeId);
    target.updatedAt = new Date().toISOString().split('T')[0];

    if (typeof window !== 'undefined') {
      localStorage.setItem('kuronami_collections', JSON.stringify(all));
    }
    this.notifyCollections();
    return true;
  }

  deleteCollection(collectionId: string): boolean {
    const user = this.getUser();
    if (!user) return false;

    let all = this.getAllCollections();
    const target = all.find((c) => c.id === collectionId);
    if (!target || target.userId !== user.id) return false;

    all = all.filter((c) => c.id !== collectionId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('kuronami_collections', JSON.stringify(all));
    }
    this.notifyCollections();
    return true;
  }

  // --- GLOBAL RECENT COMMENTS METHODS ---

  getRecentComments(limit = 10): GlobalComment[] {
    if (typeof window === 'undefined') return INITIAL_COMMENTS.slice(0, limit);
    try {
      const saved = localStorage.getItem('kuronami_comments');
      const list: GlobalComment[] = saved ? JSON.parse(saved) : INITIAL_COMMENTS;
      return list.slice(0, limit);
    } catch {
      return INITIAL_COMMENTS.slice(0, limit);
    }
  }

  subscribeComments(listener: (comments: GlobalComment[]) => void) {
    this.commentsListeners.push(listener);
    listener(this.getRecentComments(10));
    return () => {
      this.commentsListeners = this.commentsListeners.filter((l) => l !== listener);
    };
  }

  private notifyComments() {
    const comms = this.getRecentComments(10);
    this.commentsListeners.forEach((l) => l(comms));
    realtimeHub.emit('comments_updated');
  }

  addGlobalComment(params: {
    animeId: number;
    animeTitle: string;
    animeCover: string;
    episodeNumber?: number;
    content: string;
    timecodeSeconds?: number | null;
    isSpoiler?: boolean;
    author?: {
      id?: string;
      username?: string;
      name?: string;
      avatar?: string;
    };
  }): GlobalComment {
    const user = this.getUser();
    const resolvedUsername =
      params.author?.username ||
      user?.username ||
      (user?.name ? this.normalizeUsername(user.name) : '') ||
      'kuronami';
    const resolvedUserId = params.author?.id || user?.id || `usr_${Date.now()}`;
    const resolvedAvatar = params.author?.avatar || user?.avatar || DEFAULT_AVATARS[0];

    const newComment: GlobalComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      animeId: params.animeId,
      animeTitle: params.animeTitle,
      animeCover: params.animeCover,
      episodeNumber: params.episodeNumber,
      userId: resolvedUserId,
      username: resolvedUsername,
      userAvatar: resolvedAvatar,
      content: params.content.trim(),
      timecodeSeconds: params.timecodeSeconds,
      isSpoiler: Boolean(params.isSpoiler),
      likesCount: 0,
      createdAt: new Date().toISOString(),
    };

    let all = this.getRecentComments(100);
    all.unshift(newComment);
    if (all.length > 100) all = all.slice(0, 100);

    if (typeof window !== 'undefined') {
      localStorage.setItem('kuronami_comments', JSON.stringify(all));
    }

    this.notifyComments();
    return newComment;
  }
}

export const authStore = new AuthStore();
