'use client';

import { UserProfile, UserCollection, GlobalComment } from '@/types';
export type { UserProfile, UserCollection, GlobalComment };

export const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1563089145-599997674d42?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop&q=80',
];

// Initial pre-seeded curated community collections
const INITIAL_COLLECTIONS: UserCollection[] = [
  {
    id: 'col_sakuga_gods',
    userId: 'user_master_otaku',
    username: 'sakuga_master',
    title: 'Вершина Сакуги и Анимации',
    description: 'Тайтлы с невероятной динамикой боёв, покадровой ручной прорисовкой и эталонной режиссурой.',
    coverImage: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    isPublic: true,
    animeIds: [154587, 16498, 101922, 113415], // Frieren, Attack on Titan, Kimetsu, Jujutsu
    likesCount: 142,
    createdAt: '2026-08-15',
    updatedAt: '2026-08-20',
  },
  {
    id: 'col_dark_psychological',
    userId: 'user_re_zero',
    username: 'subaru_mind',
    title: 'Мрачный Психологический Сэйнэн',
    description: 'Глубокие сюжеты, философские дилеммы и захватывающий саспенс.',
    coverImage: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    isPublic: true,
    animeIds: [9253, 19, 1535, 20605], // Steins;Gate, Monster, Death Note, Tokyo Ghoul
    likesCount: 98,
    createdAt: '2026-08-18',
    updatedAt: '2026-08-21',
  },
  {
    id: 'col_cyber_sci_fi',
    userId: 'user_cyber_ghost',
    username: 'kusanagi_major',
    title: 'Киберпанк и Неоновое Будущее',
    description: 'Атмосфера аугментаций, мегакорпораций и искусственного интеллекта.',
    coverImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    isPublic: true,
    animeIds: [126546, 1, 467, 108632], // Cyberpunk Edgerunners, Cowboy Bebop, Ghost in the Shell, Vivy
    likesCount: 84,
    createdAt: '2026-08-19',
    updatedAt: '2026-08-22',
  },
];

// Initial real user comments on verified top anime
const INITIAL_COMMENTS: GlobalComment[] = [
  {
    id: 'comm_1',
    animeId: 154587,
    animeTitle: 'Провожающая в последний путь Фрирен',
    animeCover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx154587-n2hrSMAneioW.jpg',
    episodeNumber: 28,
    userId: 'user_sakuga',
    username: 'sakuga_master',
    userAvatar: DEFAULT_AVATARS[0],
    content: 'Анимация магии в последних сериях — это чистейшее искусство от Madhouse. Пересматриваю сцену экзамена уже третий раз!',
    timecodeSeconds: 840,
    isSpoiler: false,
    likesCount: 24,
    createdAt: '12 минут назад',
  },
  {
    id: 'comm_2',
    animeId: 151807,
    animeTitle: 'Поднятие уровня в одиночку (Solo Leveling)',
    animeCover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx151807-m1gZXBdWqcSp.jpg',
    episodeNumber: 12,
    userId: 'user_shadow',
    username: 'sung_jinwoo',
    userAvatar: DEFAULT_AVATARS[1],
    content: 'Момент с фразой «Пробудись» и появлением Теневых солдат вызвал мурашки по всему телу. Саундтрек Хироюки Савано невероятен.',
    timecodeSeconds: 1120,
    isSpoiler: false,
    likesCount: 31,
    createdAt: '25 минут назад',
  },
  {
    id: 'comm_3',
    animeId: 16498,
    animeTitle: 'Атака титанов: Финал',
    animeCover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx16498-73IhOXpJZiPO.png',
    episodeNumber: 1,
    userId: 'user_eren',
    username: 'jaeger_core',
    userAvatar: DEFAULT_AVATARS[2],
    content: 'Кульминация всего произведения. Каждая сцена несёт огромный эмоциональный вес.',
    timecodeSeconds: 430,
    isSpoiler: false,
    likesCount: 19,
    createdAt: '40 минут назад',
  },
  {
    id: 'comm_4',
    animeId: 101922,
    animeTitle: 'Истребитель демонов: Kimetsu no Yaiba',
    animeCover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx101922-PEn1CTOGdrwe.jpg',
    episodeNumber: 19,
    userId: 'user_tanjiro',
    username: 'kamado_zen',
    userAvatar: DEFAULT_AVATARS[3],
    content: '19 серия навсегда вошла в историю анимации. Танец Бога Огня с песней Kamado Tanjiro no Uta великолепен.',
    timecodeSeconds: 1205,
    isSpoiler: false,
    likesCount: 42,
    createdAt: '1 час назад',
  },
  {
    id: 'comm_5',
    animeId: 9253,
    animeTitle: 'Врата Штейна (Steins;Gate)',
    animeCover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx9253-12ZgqA6o5qC1.png',
    episodeNumber: 22,
    userId: 'user_okabe',
    username: 'mad_scientist',
    userAvatar: DEFAULT_AVATARS[4],
    content: 'Лучший научно-фантастический шедевр всех времен. Эл Псай Конгру!',
    timecodeSeconds: 960,
    isSpoiler: false,
    likesCount: 28,
    createdAt: '1.5 часа назад',
  },
  {
    id: 'comm_6',
    animeId: 113415,
    animeTitle: 'Магическая битва: 2 Сезон',
    animeCover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx113415-bbBWj4pCQImw.jpg',
    episodeNumber: 16,
    userId: 'user_gojo',
    username: 'satoru_infinity',
    userAvatar: DEFAULT_AVATARS[5],
    content: 'Битва Сукуны и Магораги в Сибуе показала новый уровень безумного продакшена MAPPA.',
    timecodeSeconds: 780,
    isSpoiler: false,
    likesCount: 37,
    createdAt: '2 часа назад',
  },
  {
    id: 'comm_7',
    animeId: 5114,
    animeTitle: 'Стальной алхимик: Братство',
    animeCover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx5114-KJTQz9AImBkW.jpg',
    episodeNumber: 64,
    userId: 'user_alchemist',
    username: 'edward_elric',
    userAvatar: DEFAULT_AVATARS[0],
    content: 'Завершил полный просмотр в 1080p. Законченная, идеальная история от начала до конца.',
    timecodeSeconds: 1300,
    isSpoiler: false,
    likesCount: 15,
    createdAt: '3 часа назад',
  },
  {
    id: 'comm_8',
    animeId: 126546,
    animeTitle: 'Киберпанк: Бегущие по краю (Edgerunners)',
    animeCover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx126546-gn3NnF4tFqK2.jpg',
    episodeNumber: 10,
    userId: 'user_lucy',
    username: 'moon_lucy',
    userAvatar: DEFAULT_AVATARS[1],
    content: 'Концовка разбивает сердце каждый раз. «I Really Want to Stay at Your House» до сих пор на репите.',
    timecodeSeconds: 1250,
    isSpoiler: true,
    likesCount: 33,
    createdAt: '4 часа назад',
  },
  {
    id: 'comm_9',
    animeId: 127230,
    animeTitle: 'Человек-бензопила (Chainsaw Man)',
    animeCover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx127230-011nSg48y9aW.jpg',
    episodeNumber: 8,
    userId: 'user_denji',
    username: 'pochita_fan',
    userAvatar: DEFAULT_AVATARS[2],
    content: 'Кинематографичная режиссура Рю Накаямы делает каждый эпизод как отдельный фильм.',
    timecodeSeconds: 610,
    isSpoiler: false,
    likesCount: 22,
    createdAt: '5 часов назад',
  },
  {
    id: 'comm_10',
    animeId: 1535,
    animeTitle: 'Тетрадь смерти (Death Note)',
    animeCover: 'https://s4.anilist.co/file/anilistcdn/media/anime/cover/large/bx1535-lawZ50i5B1kF.jpg',
    episodeNumber: 25,
    userId: 'user_lawliet',
    username: 'l_detective',
    userAvatar: DEFAULT_AVATARS[3],
    content: 'Интеллектуальная дуэль Лайта и L остаётся непревзойдённой классикой аниме-индустрии.',
    timecodeSeconds: 890,
    isSpoiler: false,
    likesCount: 29,
    createdAt: '6 часов назад',
  },
];

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
          this.currentUser = JSON.parse(savedUser);
        } catch {
          this.currentUser = null;
        }
      }

      // Initialize collections in localStorage if empty
      const savedCollections = localStorage.getItem('kuronami_collections');
      if (!savedCollections) {
        localStorage.setItem('kuronami_collections', JSON.stringify(INITIAL_COLLECTIONS));
      }

      // Initialize comments in localStorage if empty
      const savedComments = localStorage.getItem('kuronami_comments');
      if (!savedComments) {
        localStorage.setItem('kuronami_comments', JSON.stringify(INITIAL_COMMENTS));
      }
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

  // Normalize username (lowercase, alphanumeric + underscore, min 2 chars)
  normalizeUsername(raw: string): string {
    return raw
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  }

  isUsernameTaken(username: string, excludeUserId?: string): boolean {
    const clean = this.normalizeUsername(username);
    if (!clean) return true;
    const users = this.getAllRegisteredUsers();
    return users.some((u) => u.username === clean && u.id !== excludeUserId);
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
    const clean = this.normalizeUsername(username);
    if (!clean) return null;

    if (this.currentUser && this.currentUser.username === clean) {
      const { email: _email, ...safeProfile } = this.currentUser;
      return safeProfile;
    }

    const allUsers = this.getAllRegisteredUsers();
    const user = allUsers.find((u) => u.username === clean);
    if (user) {
      const { email: _email, ...safeProfile } = user;
      return safeProfile;
    }

    // Default mock user profile if pre-seeded
    return {
      id: `usr_${clean}`,
      username: clean,
      name: clean.replace(/_/g, ' ').toUpperCase(),
      avatar: DEFAULT_AVATARS[0],
      bio: 'Участник аниме-сообщества KuroNami.',
      role: 'Отаку',
      level: 3,
      joinedAt: '2026-08-01',
      collectionsCount: 2,
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
    return all.filter((c) => c.userId === usernameOrUserId || c.username === clean);
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
  }

  addGlobalComment(params: {
    animeId: number;
    animeTitle: string;
    animeCover: string;
    episodeNumber?: number;
    content: string;
    timecodeSeconds?: number | null;
    isSpoiler?: boolean;
  }): GlobalComment {
    const user = this.getUser();
    if (!user) throw new Error('Для публикации комментария необходимо войти в аккаунт');

    const newComment: GlobalComment = {
      id: `comm_${Date.now()}`,
      animeId: params.animeId,
      animeTitle: params.animeTitle,
      animeCover: params.animeCover,
      episodeNumber: params.episodeNumber,
      userId: user.id,
      username: user.username,
      userAvatar: user.avatar,
      content: params.content.trim(),
      timecodeSeconds: params.timecodeSeconds,
      isSpoiler: Boolean(params.isSpoiler),
      likesCount: 0,
      createdAt: 'Только что',
    };

    let all = this.getRecentComments(100);
    all.unshift(newComment);
    if (all.length > 50) all = all.slice(0, 50);

    if (typeof window !== 'undefined') {
      localStorage.setItem('kuronami_comments', JSON.stringify(all));
    }

    this.notifyComments();
    return newComment;
  }
}

export const authStore = new AuthStore();
