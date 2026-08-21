'use client';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  banner?: string;
  bio?: string;
  role: string;
  level: number;
  joinedAt: string;
}

export const DEFAULT_AVATARS = [
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1563089145-599997674d42?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=150&auto=format&fit=crop&q=80',
];

const GUEST_USER: UserProfile = {
  id: 'guest',
  name: 'Гость Отаку',
  email: 'guest@kuronami.io',
  avatar: DEFAULT_AVATARS[0],
  bio: 'Любитель качественного аниме и захватывающих историй.',
  role: 'Otaku Explorer',
  level: 1,
  joinedAt: '2026-08-21',
};

class AuthStore {
  private currentUser: UserProfile | null = null;
  private listeners: Array<(user: UserProfile | null) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('kuronami_current_user');
      if (saved) {
        try {
          this.currentUser = JSON.parse(saved);
        } catch {
          this.currentUser = GUEST_USER;
        }
      }
    }
  }

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

  subscribe(listener: (user: UserProfile | null) => void) {
    this.listeners.push(listener);
    listener(this.getUser());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l(this.currentUser));
  }

  register(params: { name: string; email: string; password?: string; avatar?: string }): UserProfile {
    const newUser: UserProfile = {
      id: `user_${Date.now()}`,
      name: params.name.trim(),
      email: params.email.trim().toLowerCase(),
      avatar: params.avatar || DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)],
      bio: 'Новый исследователь вселенной KuroNami.',
      role: 'Новичок Отаку',
      level: 1,
      joinedAt: new Date().toISOString().split('T')[0],
    };

    if (typeof window !== 'undefined') {
      const allUsers = this.getAllRegisteredUsers();
      allUsers.push(newUser);
      localStorage.setItem('kuronami_users', JSON.stringify(allUsers));
      localStorage.setItem('kuronami_current_user', JSON.stringify(newUser));
    }

    this.currentUser = newUser;
    this.notify();
    return newUser;
  }

  login(email: string): UserProfile {
    const cleanEmail = email.trim().toLowerCase();
    const allUsers = this.getAllRegisteredUsers();
    const existing = allUsers.find((u) => u.email === cleanEmail);

    const userToSet = existing || {
      id: `user_${Date.now()}`,
      name: cleanEmail.split('@')[0],
      email: cleanEmail,
      avatar: DEFAULT_AVATARS[0],
      bio: 'Исследователь вселенной KuroNami.',
      role: 'Отаку',
      level: 1,
      joinedAt: new Date().toISOString().split('T')[0],
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem('kuronami_current_user', JSON.stringify(userToSet));
    }

    this.currentUser = userToSet;
    this.notify();
    return userToSet;
  }

  loginAsGuest(): UserProfile {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kuronami_current_user', JSON.stringify(GUEST_USER));
    }
    this.currentUser = GUEST_USER;
    this.notify();
    return GUEST_USER;
  }

  logout() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kuronami_current_user');
    }
    this.currentUser = null;
    this.notify();
  }

  updateProfile(updates: Partial<UserProfile>): UserProfile | null {
    if (!this.currentUser) return null;
    this.currentUser = { ...this.currentUser, ...updates };

    if (typeof window !== 'undefined') {
      localStorage.setItem('kuronami_current_user', JSON.stringify(this.currentUser));
      const allUsers = this.getAllRegisteredUsers().map((u) =>
        u.id === this.currentUser?.id ? this.currentUser! : u
      );
      localStorage.setItem('kuronami_users', JSON.stringify(allUsers));
    }

    this.notify();
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
}

export const authStore = new AuthStore();
