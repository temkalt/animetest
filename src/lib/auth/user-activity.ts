'use client';

import { realtimeHub } from '@/lib/utils/realtime';

export interface AnimeViewStat {
  id: number;
  animeId?: number;
  title: string;
  coverImage: string;
  score?: number;
  format?: string;
  viewsCount: number;
  lastViewedAt: string;
}

class UserActivityManager {
  private listeners: Array<(stats: AnimeViewStat[]) => void> = [];
  private cachedStats: AnimeViewStat[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      realtimeHub.on('views_updated', () => {
        this.fetchMostWatched().then((data) => {
          this.listeners.forEach((l) => l(data));
        });
      });

      // Initial load
      this.fetchMostWatched();
    }
  }

  async fetchMostWatched(limit = 12): Promise<AnimeViewStat[]> {
    try {
      const res = await fetch(`/api/views?limit=${limit}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.mostWatched)) {
          const formatted: AnimeViewStat[] = data.mostWatched.map((item: any) => ({
            id: item.animeId || item.id,
            animeId: item.animeId || item.id,
            title: item.title,
            coverImage: item.coverImage,
            score: item.score,
            format: item.format,
            viewsCount: item.viewsCount,
            lastViewedAt: item.lastViewedAt,
          }));

          this.cachedStats = formatted;
          if (typeof window !== 'undefined') {
            localStorage.setItem('kuronami_anime_views', JSON.stringify(formatted));
          }
          return formatted;
        }
      }
    } catch {}

    return this.getAllViewStats().slice(0, limit);
  }

  getAllViewStats(): AnimeViewStat[] {
    if (this.cachedStats.length > 0) return this.cachedStats;
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem('kuronami_anime_views');
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getMostWatched(limit = 8): AnimeViewStat[] {
    const all = this.getAllViewStats();
    return all.sort((a, b) => b.viewsCount - a.viewsCount).slice(0, limit);
  }

  async recordAnimeView(anime: {
    id: number;
    title: string;
    coverImage: string;
    score?: number;
    format?: string;
  }) {
    if (typeof window === 'undefined' || !anime.id) return;

    let cleanCover = anime.coverImage?.trim() || '';
    if (cleanCover && !cleanCover.startsWith('http')) {
      cleanCover = '';
    }
    if (cleanCover.includes('banner')) {
      cleanCover = cleanCover.replace('banner', 'cover');
    }

    // 1. Optimistic local update
    try {
      const all = this.getAllViewStats();
      const existing = all.find((item) => item.id === anime.id || item.animeId === anime.id);

      if (existing) {
        existing.viewsCount += 1;
        existing.lastViewedAt = new Date().toISOString();
        if (anime.title) existing.title = anime.title;
        if (cleanCover) existing.coverImage = cleanCover;
        if (anime.score !== undefined) existing.score = anime.score;
        if (anime.format) existing.format = anime.format;
      } else {
        all.push({
          id: anime.id,
          animeId: anime.id,
          title: anime.title,
          coverImage: cleanCover,
          score: anime.score || 0,
          format: anime.format || 'TV',
          viewsCount: 1,
          lastViewedAt: new Date().toISOString(),
        });
      }

      this.cachedStats = all;
      localStorage.setItem('kuronami_anime_views', JSON.stringify(all));
      this.notifyListeners();
    } catch {}

    // 2. Server persistence
    try {
      await fetch('/api/views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animeId: anime.id,
          title: anime.title,
          coverImage: cleanCover,
          score: anime.score,
          format: anime.format,
        }),
      });
    } catch {}
  }

  subscribe(listener: (stats: AnimeViewStat[]) => void) {
    this.listeners.push(listener);
    listener(this.getMostWatched());
    this.fetchMostWatched().then((stats) => listener(stats));
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners() {
    const data = this.getMostWatched();
    this.listeners.forEach((l) => l(data));
    realtimeHub.emit('views_updated');
  }
}

export const userActivity = new UserActivityManager();
