import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

function getDatabaseUrl(): string {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (process.env.POSTGRES_URL) return process.env.POSTGRES_URL;
  if (process.env.STORAGE_DATABASE_URL) return process.env.STORAGE_DATABASE_URL;
  if (process.env.STORAGE_POSTGRES_URL) return process.env.STORAGE_POSTGRES_URL;
  if (process.env.STORAGE_URL) return process.env.STORAGE_URL;
  if (process.env.NEON_DATABASE_URL) return process.env.NEON_DATABASE_URL;

  // Search any env var that starts with postgres:// or postgresql://
  for (const [, val] of Object.entries(process.env)) {
    if (typeof val === 'string' && !val.includes('mock') && (val.startsWith('postgres://') || val.startsWith('postgresql://'))) {
      return val;
    }
  }
  return '';
}

const dbUrl = getDatabaseUrl();
export const isPostgresConfigured = Boolean(
  dbUrl &&
  !dbUrl.includes('mock') &&
  (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'))
);

const sqlClient = isPostgresConfigured ? neon(dbUrl) : null;
export const db = sqlClient ? drizzle(sqlClient, { schema }) : null;

let tablesInitialized = false;

/**
 * Automatically creates all tables in Neon/Postgres if they don't exist yet on Vercel.
 */
export async function ensurePostgresTables() {
  if (!sqlClient || tablesInitialized) return;
  try {
    await sqlClient`
      CREATE TABLE IF NOT EXISTS users (
        id text PRIMARY KEY,
        username varchar(100) UNIQUE,
        name varchar(255),
        email varchar(255) NOT NULL UNIQUE,
        password_hash text,
        email_verified timestamp,
        image text,
        avatar text,
        bio text,
        banner text,
        role varchar(50) DEFAULT 'user' NOT NULL,
        level integer DEFAULT 1 NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `;

    await sqlClient`
      CREATE TABLE IF NOT EXISTS episode_comments (
        id text PRIMARY KEY,
        episode_id text NOT NULL,
        anime_id integer NOT NULL,
        anime_title text,
        anime_cover text,
        episode_number real,
        user_id text NOT NULL,
        user_name varchar(255) NOT NULL,
        username varchar(100),
        user_avatar text,
        parent_id text,
        timecode_seconds integer,
        content text NOT NULL,
        is_spoiler boolean DEFAULT false NOT NULL,
        likes_count integer DEFAULT 0 NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `;

    await sqlClient`
      CREATE TABLE IF NOT EXISTS user_collections (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        username varchar(100) NOT NULL,
        title varchar(255) NOT NULL,
        description text DEFAULT '',
        cover_image text,
        is_public boolean DEFAULT true NOT NULL,
        likes_count integer DEFAULT 0 NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `;

    await sqlClient`
      CREATE TABLE IF NOT EXISTS collection_items (
        id text PRIMARY KEY,
        collection_id text NOT NULL REFERENCES user_collections(id) ON DELETE CASCADE,
        anime_id integer NOT NULL,
        created_at timestamp DEFAULT now() NOT NULL
      );
    `;

    await sqlClient`
      CREATE TABLE IF NOT EXISTS anime_view_stats (
        anime_id integer PRIMARY KEY,
        title text NOT NULL,
        cover_image text NOT NULL,
        score real DEFAULT 0,
        format varchar(50) DEFAULT 'TV',
        views_count integer DEFAULT 1 NOT NULL,
        last_viewed_at timestamp DEFAULT now() NOT NULL
      );
    `;

    await sqlClient`
      CREATE TABLE IF NOT EXISTS bookmarks (
        user_id text NOT NULL,
        anime_id integer NOT NULL,
        status varchar(30) NOT NULL,
        score integer,
        is_favorite boolean DEFAULT false NOT NULL,
        custom_folder varchar(100),
        anime_title text,
        anime_cover text,
        anime_format varchar(50),
        anime_score real,
        anime_total_episodes integer,
        created_at timestamp DEFAULT now() NOT NULL,
        updated_at timestamp DEFAULT now() NOT NULL,
        PRIMARY KEY (user_id, anime_id)
      );
    `;

    await sqlClient`
      CREATE TABLE IF NOT EXISTS watch_history (
        id text PRIMARY KEY,
        user_id text NOT NULL,
        anime_id integer NOT NULL,
        episode_number real NOT NULL,
        current_time_seconds real NOT NULL,
        duration_seconds real NOT NULL,
        progress_percentage real DEFAULT 0,
        is_completed boolean DEFAULT false NOT NULL,
        team_name varchar(100),
        anime_title text,
        anime_cover text,
        anime_total_episodes integer,
        anime_format varchar(50),
        updated_at timestamp DEFAULT now() NOT NULL
      );
    `;

    // Safe non-destructive column migrations for existing Postgres tables
    await sqlClient`ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS anime_title text;`;
    await sqlClient`ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS anime_cover text;`;
    await sqlClient`ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS anime_format varchar(50);`;
    await sqlClient`ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS anime_score real;`;
    await sqlClient`ALTER TABLE bookmarks ADD COLUMN IF NOT EXISTS anime_total_episodes integer;`;

    await sqlClient`ALTER TABLE watch_history ADD COLUMN IF NOT EXISTS progress_percentage real DEFAULT 0;`;
    await sqlClient`ALTER TABLE watch_history ADD COLUMN IF NOT EXISTS team_name varchar(100);`;
    await sqlClient`ALTER TABLE watch_history ADD COLUMN IF NOT EXISTS anime_title text;`;
    await sqlClient`ALTER TABLE watch_history ADD COLUMN IF NOT EXISTS anime_cover text;`;
    await sqlClient`ALTER TABLE watch_history ADD COLUMN IF NOT EXISTS anime_total_episodes integer;`;
    await sqlClient`ALTER TABLE watch_history ADD COLUMN IF NOT EXISTS anime_format varchar(50);`;

    tablesInitialized = true;
  } catch (err) {
    console.error('Error ensuring Postgres tables:', err);
  }
}
