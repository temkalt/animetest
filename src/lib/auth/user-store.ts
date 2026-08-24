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

class AuthStore {
  private currentUser: UserProfile | null = null;
  private userListeners: Array<(user: UserProfile | null) => void> = [];
  private collectionsListeners: Array<(collections: UserCollection[]) => void> = [];
  private commentsListeners: Array<(comments: GlobalComment[]) => void> = [];
  private cachedComments: GlobalComment[] = [];
  private cachedCollections: UserCollection[] = [];
  private isInitialized = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('kuronami_current_user');
      if (savedUser) {
        try {
          const u = JSON.parse(savedUser);
          if (u && typeof u === 'object') {
            this.currentUser = u;
          }
        } catch {
          this.currentUser = null;
        }
      }

      // Sync session with server in background
      this.syncSessionFromServer();

      // Listen for realtime events
      realtimeHub.on('comments_updated', () => {
        this.fetchRecentComments().then((comms) => {
          this.commentsListeners.forEach((l) => l(comms));
        });
      });

      realtimeHub.on('collections_updated', () => {
        this.fetchCollections().then((cols) => {
          this.collectionsListeners.forEach((l) => l(cols));
        });
      });

      realtimeHub.on('user_updated', () => {
        this.syncSessionFromServer();
      });

      // Initial data fetch
      this.fetchRecentComments();
      this.fetchCollections();
    }
  }

  async syncSessionFromServer() {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          this.currentUser = data.user;
          localStorage.setItem('kuronami_current_user', JSON.stringify(data.user));
        } else if (this.currentUser) {
          // Keep local user if offline or server returned empty
        }
        this.notifyUser();
      }
    } catch {
      // Offline fallback: keep localStorage user
    }
  }

  // --- AUTH METHODS ---

  getUser(): UserProfile | null {
    if (typeof window !== 'undefined' && !this.currentUser) {
      const saved = localStorage.getItem('kuronami_current_user');
      if (saved) {
        try {
          this.currentUser = JSON.parse(saved);
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

  normalizeUsername(raw: string): string {
    if (!raw) return '';
    const transliterated = this.transliterate(raw.trim().toLowerCase());
    return transliterated
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '')
      .slice(0, 24);
  }

  private knownTakenUsernames = new Set<string>(['admin', 'administrator', 'system', 'root', 'support', 'bot', 'moderator']);
  private knownAvailableUsernames = new Set<string>();

  isUsernameTaken(username: string): boolean {
    const clean = this.normalizeUsername(username);
    if (!clean || clean.length < 2) return true;
    return this.knownTakenUsernames.has(clean);
  }

  async checkUsernameAvailability(username: string): Promise<{ available: boolean; reason?: string }> {
    const clean = this.normalizeUsername(username);
    if (!clean || clean.length < 2) {
      return { available: false, reason: 'Минимум 2 символа' };
    }

    if (this.knownTakenUsernames.has(clean)) {
      return { available: false, reason: `Никнейм @${clean} уже занят` };
    }

    try {
      const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(clean)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.available === false) {
          this.knownTakenUsernames.add(clean);
          return { available: false, reason: data.reason || `Никнейм @${clean} уже занят` };
        } else {
          this.knownAvailableUsernames.add(clean);
          return { available: true };
        }
      }
    } catch {
      // ignore
    }

    return { available: true };
  }

  isEmailTaken(_email: string): boolean {
    return false;
  }

  async register(params: {
    username: string;
    name?: string;
    email: string;
    password?: string;
    avatar?: string;
  }): Promise<UserProfile> {
    const cleanUsername = this.normalizeUsername(params.username);
    const cleanEmail = params.email.trim().toLowerCase();

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: cleanUsername,
        name: params.name || cleanUsername,
        email: cleanEmail,
        password: params.password,
        avatar: params.avatar || DEFAULT_AVATARS[0],
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка при регистрации');
    }

    const user: UserProfile = data.user;
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('kuronami_current_user', JSON.stringify(user));
      if (data.token) localStorage.setItem('kuronami_auth_token', data.token);
    }

    this.notifyUser();
    realtimeHub.emit('user_updated');
    return user;
  }

  async login(identifier: string, password?: string): Promise<UserProfile> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: identifier.trim(),
        password: password || '',
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Неверный никнейм или пароль');
    }

    const user: UserProfile = data.user;
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem('kuronami_current_user', JSON.stringify(user));
      if (data.token) localStorage.setItem('kuronami_auth_token', data.token);
    }

    this.notifyUser();
    realtimeHub.emit('user_updated');
    return user;
  }

  async logout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {}

    if (typeof window !== 'undefined') {
      localStorage.removeItem('kuronami_current_user');
      localStorage.removeItem('kuronami_auth_token');
    }
    this.currentUser = null;
    this.notifyUser();
    realtimeHub.emit('user_updated');
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const user = this.currentUser;
    if (!user) return null;

    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          this.currentUser = data.user;
          localStorage.setItem('kuronami_current_user', JSON.stringify(this.currentUser));
          this.notifyUser();
          realtimeHub.emit('user_updated');
          return this.currentUser;
        }
      }
    } catch {}

    // Fallback local update
    this.currentUser = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
      level: user.level,
      joinedAt: user.joinedAt,
      bio: user.bio,
      banner: user.banner,
      collectionsCount: user.collectionsCount,
      ...updates,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('kuronami_current_user', JSON.stringify(this.currentUser));
    }
    this.notifyUser();
    return this.currentUser;
  }

  async getPublicProfile(username: string): Promise<Omit<UserProfile, 'email'> | null> {
    const full = await this.getPublicProfileFull(username);
    return full?.user || null;
  }

  async getPublicProfileFull(username: string): Promise<{
    user: Omit<UserProfile, 'email'>;
    collections: UserCollection[];
    bookmarks: any[];
    history: any[];
  } | null> {
    if (!username || username === 'undefined' || username === 'null') {
      const current = this.getUser();
      if (current) {
        const { email: _email, ...safe } = current;
        return {
          user: safe,
          collections: this.getUserCollections(current.id),
          bookmarks: [],
          history: [],
        };
      }
      return null;
    }

    try {
      const res = await fetch(`/api/user/${encodeURIComponent(username)}`);
      if (res.ok) {
        const data = await res.json();
        return {
          user: data.user || null,
          collections: Array.isArray(data.collections) ? data.collections : [],
          bookmarks: Array.isArray(data.bookmarks) ? data.bookmarks : [],
          history: Array.isArray(data.history) ? data.history : [],
        };
      }
    } catch {}

    const clean = this.normalizeUsername(decodeURIComponent(username));
    return {
      user: {
        id: `usr_${clean}`,
        username: clean,
        name: clean.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
        avatar: DEFAULT_AVATARS[0],
        bio: 'Участник аниме-сообщества KuroNami.',
        role: 'Отаку',
        level: 1,
        joinedAt: '2026-08-01',
        collectionsCount: 0,
      },
      collections: [],
      bookmarks: [],
      history: [],
    };
  }

  // --- COLLECTIONS METHODS ---

  async fetchCollections(): Promise<UserCollection[]> {
    try {
      const res = await fetch('/api/collections');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.collections)) {
          this.cachedCollections = data.collections;
          if (typeof window !== 'undefined') {
            localStorage.setItem('kuronami_collections', JSON.stringify(data.collections));
          }
          return data.collections;
        }
      }
    } catch {}

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kuronami_collections');
        if (saved) this.cachedCollections = JSON.parse(saved);
      } catch {}
    }
    return this.cachedCollections;
  }

  getAllCollections(): UserCollection[] {
    if (this.cachedCollections.length > 0) return this.cachedCollections;
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kuronami_collections');
        return saved ? JSON.parse(saved) : [];
      } catch {}
    }
    return [];
  }

  getUserCollections(usernameOrUserId: string): UserCollection[] {
    const all = this.getAllCollections();
    const clean = this.normalizeUsername(usernameOrUserId);
    return all.filter((c) => c.userId === usernameOrUserId || c.username.toLowerCase() === clean.toLowerCase());
  }

  getPublicCollections(): UserCollection[] {
    return this.getAllCollections().filter((c) => c.isPublic);
  }

  getCollectionById(id: string): UserCollection | null {
    return this.getAllCollections().find((c) => c.id === id) || null;
  }

  subscribeCollections(listener: (collections: UserCollection[]) => void) {
    this.collectionsListeners.push(listener);
    listener(this.getAllCollections());
    this.fetchCollections().then((cols) => listener(cols));
    return () => {
      this.collectionsListeners = this.collectionsListeners.filter((l) => l !== listener);
    };
  }

  private notifyCollections() {
    const cols = this.getAllCollections();
    this.collectionsListeners.forEach((l) => l(cols));
    realtimeHub.emit('collections_updated');
  }

  async createCollection(params: {
    title: string;
    description: string;
    coverImage?: string;
    isPublic?: boolean;
    initialAnimeIds?: number[];
  }): Promise<UserCollection> {
    const user = this.getUser();
    if (!user) throw new Error('Для создания коллекции необходимо войти в аккаунт');

    const res = await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка при создании коллекции');
    }

    const newCol: UserCollection = data.collection;
    this.cachedCollections.unshift(newCol);
    this.notifyCollections();
    return newCol;
  }

  async addAnimeToCollection(collectionId: string, animeId: number): Promise<boolean> {
    try {
      const res = await fetch(`/api/collections/${collectionId}/anime`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeId }),
      });
      if (res.ok) {
        await this.fetchCollections();
        this.notifyCollections();
        return true;
      }
    } catch {}
    return false;
  }

  async removeAnimeFromCollection(collectionId: string, animeId: number): Promise<boolean> {
    try {
      const res = await fetch(`/api/collections/${collectionId}/anime`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ animeId }),
      });
      if (res.ok) {
        await this.fetchCollections();
        this.notifyCollections();
        return true;
      }
    } catch {}
    return false;
  }

  async deleteCollection(collectionId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/collections/${collectionId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        this.cachedCollections = this.cachedCollections.filter((c) => c.id !== collectionId);
        this.notifyCollections();
        return true;
      }
    } catch {}
    return false;
  }

  // --- GLOBAL RECENT COMMENTS METHODS ---

  async fetchRecentComments(limit = 20): Promise<GlobalComment[]> {
    try {
      const res = await fetch(`/api/comments?global=true&limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.comments)) {
          this.cachedComments = data.comments;
          if (typeof window !== 'undefined') {
            localStorage.setItem('kuronami_comments', JSON.stringify(data.comments));
          }
          return data.comments;
        }
      }
    } catch {}

    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kuronami_comments');
        if (saved) this.cachedComments = JSON.parse(saved);
      } catch {}
    }
    return this.cachedComments;
  }

  getRecentComments(limit = 10): GlobalComment[] {
    if (this.cachedComments.length > 0) return this.cachedComments.slice(0, limit);
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('kuronami_comments');
        return saved ? JSON.parse(saved).slice(0, limit) : [];
      } catch {}
    }
    return [];
  }

  subscribeComments(listener: (comments: GlobalComment[]) => void) {
    this.commentsListeners.push(listener);
    listener(this.getRecentComments(10));
    this.fetchRecentComments().then((comms) => listener(comms.slice(0, 10)));
    return () => {
      this.commentsListeners = this.commentsListeners.filter((l) => l !== listener);
    };
  }

  private notifyComments() {
    const comms = this.getRecentComments(10);
    this.commentsListeners.forEach((l) => l(comms));
    realtimeHub.emit('comments_updated');
  }

  async addGlobalComment(params: {
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
  }): Promise<GlobalComment> {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.error || 'Ошибка при отправке комментария');
    }

    const newComment: GlobalComment = data.comment;
    this.cachedComments.unshift(newComment);
    this.notifyComments();
    return newComment;
  }
}

export const authStore = new AuthStore();
