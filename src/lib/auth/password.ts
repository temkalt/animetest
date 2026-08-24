import crypto from 'crypto';
import { UserProfile } from '@/types';

const SECRET_KEY = process.env.AUTH_SECRET || 'kuronami_production_secret_key_2026_x89_secure';

/**
 * Hashes a plaintext password using PBKDF2 with a secure salt.
 */
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString('hex');
    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString('hex')}`);
    });
  });
}

/**
 * Verifies a password against the stored salt:hash string.
 */
export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (!storedHash || !storedHash.includes(':')) {
      return resolve(false);
    }
    const [salt, key] = storedHash.split(':');
    if (!salt || !key) return resolve(false);

    crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
      if (err) return resolve(false);
      const keyBuffer = Buffer.from(key, 'hex');
      const match = crypto.timingSafeEqual(derivedKey, keyBuffer);
      resolve(match);
    });
  });
}

/**
 * Generates a signed, tamper-proof session token (HMAC-SHA256).
 */
export function createSessionToken(payload: { id: string; email: string; username: string }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
    })
  ).toString('base64url');

  const signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(`${header}.${body}`)
    .digest('base64url');

  return `${header}.${body}.${signature}`;
}

/**
 * Verifies a signed session token and returns the decoded payload.
 */
export function verifySessionToken(token: string): { id: string; email: string; username: string; exp?: number } | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, body, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(`${header}.${body}`)
      .digest('base64url');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Removes sensitive fields (password hash, etc.) before returning to client.
 */
export function sanitizeUser(user: any): UserProfile {
  const username = user.username || (user.name ? user.name.toLowerCase().replace(/\s+/g, '_') : 'otaku');
  return {
    id: user.id,
    username,
    name: user.name || username,
    email: user.email,
    avatar: user.avatar || user.image || 'https://s4.anilist.co/file/anilistcdn/character/large/b40-MNypXsxSRb1R.png',
    banner: user.banner || undefined,
    bio: user.bio || 'Исследователь вселенной KuroNami.',
    role: user.role || 'Отаку',
    level: user.level || 1,
    joinedAt: user.createdAt
      ? new Date(user.createdAt).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    collectionsCount: user.collectionsCount || 0,
  };
}
