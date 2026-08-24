'use client';

import { useState, useEffect } from 'react';

function getRussianPlural(num: number, one: string, two: string, five: string): string {
  const n = Math.abs(num) % 100;
  const n1 = n % 10;
  if (n > 10 && n < 20) return five;
  if (n1 > 1 && n1 < 5) return two;
  if (n1 === 1) return one;
  return five;
}

/**
 * Parses any date format (ISO-8601, timestamp number, Date object, or ID with timestamp).
 */
export function parseDateInput(input: string | number | Date | null | undefined, fallbackId?: string): Date | null {
  if (!input && !fallbackId) return null;

  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  if (typeof input === 'number') {
    const ts = input < 1e11 ? input * 1000 : input;
    const d = new Date(ts);
    return isNaN(d.getTime()) ? null : d;
  }

  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (!trimmed) return null;

    const directDate = new Date(trimmed);
    if (!isNaN(directDate.getTime())) {
      return directDate;
    }

    if (/^\d+$/.test(trimmed)) {
      const num = parseInt(trimmed, 10);
      const ts = num < 1e11 ? num * 1000 : num;
      const d = new Date(ts);
      if (!isNaN(d.getTime())) return d;
    }
  }

  const idToParse = typeof input === 'string' && input.includes('_') ? input : fallbackId;
  if (idToParse) {
    const match = idToParse.match(/(?:comment|usr|ep_comm)_(\d{10,13})/);
    if (match && match[1]) {
      const num = parseInt(match[1], 10);
      const ts = num < 1e11 ? num * 1000 : num;
      const d = new Date(ts);
      if (!isNaN(d.getTime())) return d;
    }
  }

  return null;
}

/**
 * Formats a date into a truthful, precise Russian relative time string.
 */
export function formatRelativeTime(
  dateInput: string | number | Date | null | undefined,
  fallbackId?: string
): string {
  const date = parseDateInput(dateInput, fallbackId);
  if (!date) {
    return typeof dateInput === 'string' && dateInput ? dateInput : 'только что';
  }

  const now = Date.now();
  const diffMs = now - date.getTime();

  if (diffMs < 5000) {
    return 'только что';
  }

  const diffSeconds = Math.floor(diffMs / 1000);
  if (diffSeconds < 60) {
    return `${diffSeconds} ${getRussianPlural(diffSeconds, 'секунду', 'секунды', 'секунд')} назад`;
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes} ${getRussianPlural(diffMinutes, 'минуту', 'минуты', 'минут')} назад`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} ${getRussianPlural(diffHours, 'час', 'часа', 'часов')} назад`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} ${getRussianPlural(diffDays, 'день', 'дня', 'дней')} назад`;
  }

  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 5) {
    return `${diffWeeks} ${getRussianPlural(diffWeeks, 'неделю', 'недели', 'недель')} назад`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths} ${getRussianPlural(diffMonths, 'месяц', 'месяца', 'месяцев')} назад`;
  }

  const day = date.getDate().toString().padStart(2, '0');
  const months = ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

/**
 * Live React Hook that returns an actively updating relative time string.
 * Automatically ticks every interval (e.g. 5-10s for recent items, 30s for older items).
 */
export function useRelativeTime(
  dateInput: string | number | Date | null | undefined,
  fallbackId?: string,
  baseIntervalMs = 10000
): string {
  const [, setTick] = useState(0);

  useEffect(() => {
    const date = parseDateInput(dateInput, fallbackId);
    if (!date) return;

    const diffMs = Math.abs(Date.now() - date.getTime());
    const intervalMs = diffMs < 60000 ? 5000 : diffMs < 3600000 ? 15000 : baseIntervalMs;

    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [dateInput, fallbackId, baseIntervalMs]);

  return formatRelativeTime(dateInput, fallbackId);
}
