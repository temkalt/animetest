'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { DEFAULT_AVATARS } from '@/lib/auth/user-store';
import { Sparkles, Check, Link as LinkIcon, Upload, Image as ImageIcon } from 'lucide-react';

export const AVATAR_PRESETS = [
  { url: DEFAULT_AVATARS[0], name: 'Kuro 01' },
  { url: DEFAULT_AVATARS[1], name: 'Kuro 02' },
  { url: DEFAULT_AVATARS[2], name: 'Kuro 03' },
  { url: DEFAULT_AVATARS[3], name: 'Kuro 04' },
  { url: DEFAULT_AVATARS[4], name: 'Kuro 05' },
  { url: DEFAULT_AVATARS[5], name: 'Kuro 06' },
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
}) => {
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const displayName = nickname?.trim() ? nickname.trim() : 'Новый Пользователь';

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim().startsWith('http') || customUrlInput.trim().startsWith('data:image')) {
      onSelect(customUrlInput.trim());
      setShowCustomInput(false);
      setCustomUrlInput('');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onSelect(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-3">
      {/* Live Profile Card Preview */}
      <div className="relative overflow-hidden rounded-lg p-3 bg-zinc-900 border border-zinc-800">
        <div className="flex items-center gap-3">
          {/* Main Avatar Preview */}
          <div className="relative flex-shrink-0">
            <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-zinc-800 bg-zinc-950">
              <Image
                src={selectedAvatar || DEFAULT_AVATARS[0]}
                alt="Avatar"
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 px-1 py-0.5 rounded bg-zinc-800 text-[10px] font-mono font-bold text-zinc-300 border border-zinc-700 shadow-sm">
              LV.1
            </div>
          </div>

          {/* Profile Handle Details */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-zinc-100 truncate">
                @{displayName.toLowerCase().replace(/\s+/g, '_')}
              </span>
              <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-400 border border-zinc-700">
                Новичок
              </span>
            </div>

            {/* EXP Progress Bar */}
            <div className="w-full bg-zinc-950 rounded h-1.5 overflow-hidden border border-zinc-800">
              <div className="h-full bg-zinc-300 w-[15%]" />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>0 / 100 XP</span>
              <span className="text-zinc-400">Профиль активен</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Avatars Selection & Custom Avatar Link */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-medium text-zinc-400">
          <span className="flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-zinc-500" />
            <span>Выберите аватар или загрузите свой</span>
          </span>
          <button
            type="button"
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="text-zinc-300 hover:text-white underline underline-offset-2 transition-colors cursor-pointer"
          >
            {showCustomInput ? 'Скрыть ссылку' : 'Свой URL / Файл'}
          </button>
        </div>

        {/* Custom Avatar URL or Upload Drawer */}
        {showCustomInput && (
          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="Вставьте ссылку на картинку"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-9 pr-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyCustomUrl}
                disabled={!customUrlInput.trim()}
                className="px-3 py-2 rounded-lg bg-zinc-100 text-zinc-900 hover:bg-white text-sm font-medium disabled:opacity-40 transition-colors cursor-pointer"
              >
                Применить
              </button>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs text-zinc-400">
              <span>Или загрузите файл:</span>
              <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 cursor-pointer transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Выбрать фото</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        )}

        {/* Grid of Avatars */}
        <div className="grid grid-cols-6 gap-3 p-2 rounded-lg bg-zinc-900 border border-zinc-800">
          {AVATAR_PRESETS.map((av, idx) => {
            const isSelected = selectedAvatar === av.url;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => onSelect(av.url)}
                className={`group relative aspect-square rounded-lg overflow-hidden transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-2 border-zinc-300 shadow-sm scale-105'
                    : 'border border-zinc-700 opacity-60 hover:opacity-100 hover:border-zinc-500'
                }`}
                title={av.name}
              >
                <Image
                  src={av.url}
                  alt={av.name}
                  fill
                  className="object-cover transition-transform duration-150 group-hover:scale-105"
                  sizes="48px"
                />
                {isSelected && (
                  <div className="absolute inset-0 bg-zinc-950/40 flex items-center justify-center">
                    <div className="w-5 h-5 rounded-full bg-zinc-100 text-zinc-900 flex items-center justify-center shadow-sm">
                      <Check className="w-3 h-3 stroke-[3]" />
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
