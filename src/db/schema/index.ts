import {
  pgTable,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  jsonb,
  primaryKey,
  index,
  uniqueIndex,
  real,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { AdapterAccountType } from 'next-auth/adapters';

// --- AUTH.JS V5 SCHEMAS ---

export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  emailVerified: timestamp('email_verified', { mode: 'date' }),
  image: text('image'),
  role: varchar('role', { length: 50 }).default('user').notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});

export const accounts = pgTable(
  'accounts',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 255 }).$type<AdapterAccountType>().notNull(),
    provider: varchar('provider', { length: 255 }).notNull(),
    providerAccountId: varchar('provider_account_id', { length: 255 }).notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: varchar('token_type', { length: 255 }),
    scope: varchar('scope', { length: 255 }),
    id_token: text('id_token'),
    session_state: varchar('session_state', { length: 255 }),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ]
);

export const sessions = pgTable('sessions', {
  sessionToken: varchar('session_token', { length: 255 }).primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: varchar('identifier', { length: 255 }).notNull(),
    token: varchar('token', { length: 255 }).notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => [
    primaryKey({ columns: [vt.identifier, vt.token] }),
  ]
);

// --- ANIME CATALOG ---

export const animeCatalog = pgTable(
  'anime_catalog',
  {
    id: integer('id').primaryKey(), // AniList ID
    malId: integer('mal_id'),
    shikimoriId: varchar('shikimori_id', { length: 100 }),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    titleRomaji: text('title_romaji').notNull(),
    titleEnglish: text('title_english'),
    titleNative: text('title_native'),
    titleRussian: text('title_russian'),
    synopsisRu: text('synopsis_ru'),
    synopsisEn: text('synopsis_en'),
    format: varchar('format', { length: 50 }).notNull(),
    status: varchar('status', { length: 50 }).notNull(),
    season: varchar('season', { length: 20 }),
    seasonYear: integer('season_year'),
    episodesCount: integer('episodes_count'),
    durationMinutes: integer('duration_minutes'),
    coverImage: text('cover_image').notNull(),
    coverImageColor: varchar('cover_image_color', { length: 20 }),
    bannerImage: text('banner_image'),
    genres: jsonb('genres').$type<string[]>().default([]).notNull(),
    tags: jsonb('tags').$type<{ id: number; name: string; rank: number }[]>().default([]).notNull(),
    studios: jsonb('studios').$type<string[]>().default([]).notNull(),
    averageScore: real('average_score'),
    popularity: integer('popularity'),
    isAdult: boolean('is_adult').default(false).notNull(),
    relationsTree: jsonb('relations_tree').$type<{
      id: number;
      relationType: string;
      title: string;
      format: string;
      cover: string;
    }[]>().default([]),
    nextAiringEpisode: jsonb('next_airing_episode').$type<{
      episode: number;
      airingAt: number;
    }>(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('anime_slug_idx').on(table.slug),
    index('anime_year_season_idx').on(table.seasonYear, table.season),
  ]
);

export const episodes = pgTable(
  'episodes',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    animeId: integer('anime_id')
      .notNull()
      .references(() => animeCatalog.id, { onDelete: 'cascade' }),
    episodeNumber: real('episode_number').notNull(),
    titleRu: text('title_ru'),
    titleEn: text('title_en'),
    thumbnail: text('thumbnail'),
    durationSeconds: integer('duration_seconds'),
    isFiller: boolean('is_filler').default(false).notNull(),
    introStartSeconds: integer('intro_start_seconds'),
    introEndSeconds: integer('intro_end_seconds'),
    outroStartSeconds: integer('outro_start_seconds'),
    outroEndSeconds: integer('outro_end_seconds'),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('anime_episode_unique_idx').on(table.animeId, table.episodeNumber),
  ]
);

export const voiceoversSources = pgTable(
  'voiceovers_sources',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    episodeId: text('episode_id')
      .notNull()
      .references(() => episodes.id, { onDelete: 'cascade' }),
    provider: varchar('provider', { length: 50 }).notNull(),
    teamName: varchar('team_name', { length: 100 }).notNull(),
    type: varchar('type', { length: 20 }).notNull(),
    streamUrl: text('stream_url').notNull(),
    qualities: jsonb('qualities').$type<string[]>().default(['1080p']).notNull(),
    isDirectHls: boolean('is_direct_hls').default(true).notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('episode_team_idx').on(table.episodeId, table.teamName),
  ]
);

export const watchHistory = pgTable(
  'watch_history',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    animeId: integer('anime_id')
      .notNull()
      .references(() => animeCatalog.id, { onDelete: 'cascade' }),
    episodeNumber: real('episode_number').notNull(),
    currentTimeSeconds: real('current_time_seconds').notNull(),
    durationSeconds: real('duration_seconds').notNull(),
    isCompleted: boolean('is_completed').default(false).notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex('user_anime_history_idx').on(table.userId, table.animeId),
    index('user_history_updated_idx').on(table.userId, table.updatedAt),
  ]
);

export const bookmarks = pgTable(
  'bookmarks',
  {
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    animeId: integer('anime_id')
      .notNull()
      .references(() => animeCatalog.id, { onDelete: 'cascade' }),
    status: varchar('status', { length: 30 }).notNull(),
    score: integer('score'),
    isFavorite: boolean('is_favorite').default(false).notNull(),
    customFolder: varchar('custom_folder', { length: 100 }),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.animeId] }),
  ]
);

export const episodeComments = pgTable(
  'episode_comments',
  {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    episodeId: text('episode_id').notNull(),
    animeId: integer('anime_id').notNull(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    userName: varchar('user_name', { length: 255 }).notNull(),
    userAvatar: text('user_avatar'),
    parentId: text('parent_id'),
    timecodeSeconds: integer('timecode_seconds'),
    content: text('content').notNull(),
    isSpoiler: boolean('is_spoiler').default(false).notNull(),
    likesCount: integer('likes_count').default(0).notNull(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (table) => [
    index('episode_comments_idx').on(table.episodeId, table.createdAt),
  ]
);

// --- RELATIONS ---

export const usersRelations = relations(users, ({ many }) => ({
  history: many(watchHistory),
  bookmarks: many(bookmarks),
  comments: many(episodeComments),
}));

export const animeCatalogRelations = relations(animeCatalog, ({ many }) => ({
  episodes: many(episodes),
  bookmarks: many(bookmarks),
}));

export const episodesRelations = relations(episodes, ({ one, many }) => ({
  anime: one(animeCatalog, {
    fields: [episodes.animeId],
    references: [animeCatalog.id],
  }),
  sources: many(voiceoversSources),
}));
