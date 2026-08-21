'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { DEFAULT_AVATARS } from '@/lib/auth/user-store';
import { Sparkles, Shield, Zap, Check, Award } from 'lucide-react';

export interface AvatarOption {
  url: string;
  name: string;
  archetype: string;
  tag: string;
}

export const AVATAR_PRESETS: AvatarOption[] = [
  {
    url: DEFAULT_AVATARS[0] || 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=150&auto=format&fit=crop&q=80',
    name: 'Cyber Ronin',
    archetype: 'Кибер-Самурай',
    tag: 'BLADE-NODE',
  },
  {
    url: DEFAULT_AVATARS[1] || 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=150&auto=format&fit=crop&q=80',
    name: 'Netrunner Otaku',
    archetype: 'Нейро-Хакер',
    tag: 'CYBER-SYNC',
  },
  {
    url: DEFAULT_AVATARS[2] || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=150&auto=format&fit=crop&q=80',
    name: 'Neon Valkyrie',
    archetype: 'Неоновая Валькирия',
    tag: 'AURA-BURST',
  },
  {
    url: DEFAULT_AVATARS[3] || 'https://images.unsplash.com/photo-1563089145-599997674d42?w=150&auto=format&fit=crop&q=80',
    name: 'Mecha Pilot',
    archetype: 'Пилот Мехи',
    tag: 'MECHA-LINK',
  },
  {
    url: DEFAULT_AVATARS[4] || 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=150&auto=format&fit=crop&q=80',
    name: 'Astral Weaver',
    archetype: 'Астральный Маг',
    tag: 'MANA-DRIVE',
  },
  {
    url: DEFAULT_AVATARS[5] || 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=150&auto=format&fit=crop&q=80',
    name: 'Shadow Shinobi',
    archetype: 'Призрак Сети',
    tag: 'STEALTH-X',
  },
];

interface AvatarSelectorProps {
  selectedAvatar: string;
  onSelect: (avatarUrl: string) => void;
  nickname?: string;
  compact?: boolean;
}

export const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  selectedAvatar,
  onSelect,
  nickname,
  compact = false,
}) => {
  const currentAvatarInfo =
    AVATAR_PRESETS.find((a) => a.url === selectedAvatar) || AVATAR_PRESETS[0];

  const displayName = nickname?.trim() ? nickname.trim() : 'Новый Отаку';

  return (
    <div className="space-y-3.5">
      {/* Live Level & Otaku Passport Holographic Preview */}
      <div className="relative overflow-hidden rounded-2xl p-3.5 bg-gradient-to-r from-[#0E1324]/90 via-[#0B0E1B]/80 to-[#120D24]/90 border border-cyan-500/25 shadow-[0_0_30px_-8px_rgba(6,182,212,0.25),inset_0_1px_1px_rgba(255,255,255,0.15)]">
        {/* Ambient Top Glow Line */}
        <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-75" />

        <div className="flex items-center gap-3.5">
          {/* Main Avatar Showcase with Neon Glow Ring */}
          <div className="relative flex-shrink-0">
            {/* Animated Glow Halo */}
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500 opacity-75 blur-sm animate-pulse" />

            <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border-2 border-cyan-300 shadow-[0_0_18px_rgba(6,182,212,0.6)] bg-black/60">
              <Image
                src={selectedAvatar}
                alt={currentAvatarInfo.name}
                fill
                className="object-cover"
                sizes="64px"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* Level Badge Overlay */}
            <div className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-md bg-gradient-to-r from-cyan-500 to-blue-600 text-[9px] font-mono font-black text-white shadow-md border border-cyan-300/40">
              LV.1
            </div>
          </div>

          {/* Profile Level Details */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-xs sm:text-sm font-bold font-display text-white truncate drop-shadow-sm">
                  {displayName}
                </span>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-violet-500/20 text-violet-300 border border-violet-500/30 text-[9px] font-mono uppercase tracking-wider flex-shrink-0">
                  {currentAvatarInfo.archetype}
                </span>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold flex-shrink-0">
                0 / 100 XP
              </span>
            </div>

            {/* Cyberpunk EXP Progress Bar */}
            <div className="w-full bg-[#070913] rounded-full h-1.5 p-[1px] border border-white/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '15%' }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-indigo-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"
              />
            </div>

            {/* Telemetry Micro-Badges */}
            <div className="flex items-center gap-2 pt-0.5 text-[9px] font-mono text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <Zap className="w-2.5 h-2.5" />
                +15% XP БОНУС
              </span>
              <span>•</span>
              <span className="text-cyan-300">
                {currentAvatarInfo.tag}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar Picker Scroll/Grid */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-slate-300 font-semibold flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            Выберите аватар персонажа:
          </span>
          <span className="text-slate-500 text-[10px]">
            {AVATAR_PRESETS.length} вариантов
          </span>
        </div>

        <div className="grid grid-cols-6 gap-2 sm:gap-2.5 p-1 rounded-2xl bg-[#060810]/70 border border-white/5">
          {AVATAR_PRESETS.map((av, idx) => {
            const isSelected = selectedAvatar === av.url;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelect(av.url)}
                className={`group relative aspect-square rounded-xl overflow-hidden transition-all duration-300 focus:outline-none ${
                  isSelected
                    ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#08090D] scale-105 shadow-[0_0_16px_rgba(6,182,212,0.7)] z-10'
                    : 'opacity-50 hover:opacity-100 hover:scale-100 border border-white/10 hover:border-violet-400/50'
                }`}
                title={`${av.name} (${av.archetype})`}
              >
                <Image
                  src={av.url}
                  alt={av.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  sizes="48px"
                />

                {/* Selected Checkmark Indicator */}
                {isSelected && (
                  <div className="absolute inset-0 bg-cyan-900/30 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-cyan-400 text-black flex items-center justify-center shadow-lg">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
