'use client';

import { realtimeHub } from '@/lib/utils/realtime';

export interface AnimeViewStat {
  id: number;
  title: string;
  coverImage: string;
  score?: number;
  format?: string;
  viewsCount: number;
  lastViewedAt: string;
}

class UserActivityManager {
  private listeners: Array<(stats: AnimeViewStat[]) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      realtimeHub.on('views_updated', () => {
        const data = this.getMostWatched();
        this.listeners.forEach((l) => l(data));
      });
    }
  }

  getAllViewStats(): AnimeViewStat[] {
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

  recordAnimeView(anime: {
    id: number;
    title: string;
    coverImage: string;
    score?: number;
    format?: string;
  }) {
    if (typeof window === 'undefined') return;

    let cleanCover = anime.coverImage?.trim() || '';
    if (cleanCover && !cleanCover.startsWith('http')) {
      cleanCover = '';
    }
    // Try to normalize known banner URLs if we still accidentally got one
    if (cleanCover.includes('banner')) {
      cleanCover = cleanCover.replace('banner', 'cover');
    }

    try {
      const all = this.getAllViewStats();
      const existing = all.find((item) => item.id === anime.id);

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
          title: anime.title,
          coverImage: cleanCover,
          score: anime.score || 0,
          format: anime.format || 'TV',
          viewsCount: 1,
          lastViewedAt: new Date().toISOString(),
        });
      }

      localStorage.setItem('kuronami_anime_views', JSON.stringify(all));
      this.notifyListeners();
    } catch (err) {
      console.error('Error recording anime view:', err);
    }
  }

  subscribe(listener: (stats: AnimeViewStat[]) => void) {
    this.listeners.push(listener);
    listener(this.getMostWatched());
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
