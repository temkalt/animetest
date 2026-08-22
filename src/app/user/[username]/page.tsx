'use client';

import React, { useEffect, useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Calendar, Layers } from 'lucide-react';
import { authStore } from '@/lib/auth/user-store';
import { UserProfile, UserCollection } from '@/types';

export default function UserProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const [profile, setProfile] = useState<Omit<UserProfile, 'email'> | null>(null);
  const [collections, setCollections] = useState<UserCollection[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rawUser = decodeURIComponent(username || '');
    const pub = authStore.getPublicProfile(rawUser);
    setProfile(pub);
    const cols = authStore.getUserCollections(rawUser);
    setCollections(cols.filter((c) => c.isPublic));
    setLoading(false);
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-600 border-t-zinc-100 rounded-full animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
        <p className="text-zinc-400">Пользователь не найден</p>
        <Link href="/" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
          На главную
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-16 pt-4">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Назад
      </Link>

      {/* Profile header */}
      <div className="flex items-start gap-5 p-6 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm">
        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700 shrink-0">
          <Image
            src={profile.avatar}
            alt={profile.name}
            fill
            sizes="80px"
            className="object-cover w-full h-full"
          />
        </div>
        <div className="space-y-1.5">
          <h1 className="text-xl font-bold text-zinc-100">{profile.name}</h1>
          <p className="text-sm text-zinc-400 font-mono">@{profile.username}</p>
          {profile.bio && <p className="text-sm text-zinc-300 mt-2 font-sans">{profile.bio}</p>}
          <div className="flex items-center gap-3 pt-2 text-xs text-zinc-500 font-mono">
            <span className="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300">
              {profile.role}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {profile.joinedAt}
            </span>
          </div>
        </div>
      </div>

      {/* User collections */}
      {collections.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-zinc-400" />
            <h2 className="text-lg font-semibold text-zinc-100">Коллекции пользователя</h2>
            <span className="text-sm text-zinc-500 font-mono">({collections.length})</span>
          </div>
          <div className="space-y-2.5">
            {collections.map((col) => (
              <div
                key={col.id}
                className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5 hover:border-zinc-700 transition-colors"
              >
                <h3 className="text-sm font-semibold text-zinc-100">{col.title}</h3>
                {col.description && <p className="text-xs text-zinc-400">{col.description}</p>}
                <div className="flex items-center gap-3 pt-1 text-xs text-zinc-500 font-mono">
                  <span>{col.animeIds.length} тайтлов</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
