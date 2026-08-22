'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { DEFAULT_AVATARS } from '@/lib/auth/user-store';
import { Check, Link as LinkIcon, Upload, Sparkles, User } from 'lucide-react';

export const AVATAR_PRESETS = [
  { url: DEFAULT_AVATARS[0], name: 'Луффи' },
  { url: DEFAULT_AVATARS[1], name: 'Годжо' },
  { url: DEFAULT_AVATARS[2], name: 'Макима' },
  { url: DEFAULT_AVATARS[3], name: 'Танджиро' },
  { url: DEFAULT_AVATARS[4], name: 'Леви' },
  { url: DEFAULT_AVATARS[5], name: 'Фрирен' },
  { url: DEFAULT_AVATARS[6], name: 'Мегуми' },
  { url: DEFAULT_AVATARS[7], name: 'Пауэр' },
];

interface AvatarSelectorProps {
  selectedAvatar: string;
  onSelect: (avatarUrl: string) => void;
  nickname?: string;
  compact?: boolean;
}

// Fallback safe avatar component that avoids browser broken image icon
const SafeAvatarImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Sync if prop changes
  React.useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  if (hasError || !imgSrc) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-zinc-800 text-zinc-400 ${className}`}>
        <User className="w-1/2 h-1/2" />
      </div>
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      unoptimized
      sizes="64px"
      className={`object-cover transition-transform duration-200 ${className}`}
      onError={() => {
        setHasError(true);
        if (src !== DEFAULT_AVATARS[0]) {
          setImgSrc(DEFAULT_AVATARS[0]);
        }
      }}
    />
  );
};

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
      <div className="relative overflow-hidden rounded-xl p-3.5 bg-zinc-950/80 border border-zinc-800/80 shadow-inner">
        <div className="flex items-center gap-3.5">
          {/* Main Avatar Preview */}
          <div className="relative flex-shrink-0">
            <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-zinc-700/80 bg-zinc-900 shadow-md">
              <SafeAvatarImage
                src={selectedAvatar || DEFAULT_AVATARS[0]}
                alt="Avatar preview"
              />
            </div>
            <div className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-zinc-800 text-[10px] font-mono font-bold text-zinc-200 border border-zinc-700 shadow-sm">
              LV.1
            </div>
          </div>

          {/* Profile Handle Details */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-zinc-100 truncate">
                @{displayName.toLowerCase().replace(/\s+/g, '_')}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-zinc-800/90 text-[10px] font-medium text-zinc-300 border border-zinc-700">
                Новичок
              </span>
            </div>

            {/* EXP Progress Bar */}
            <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden border border-zinc-800">
              <div className="h-full bg-gradient-to-r from-zinc-400 to-white w-[25%] rounded-full" />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500">
              <span>0 / 100 XP</span>
              <span className="text-zinc-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Готов к просмотру
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Avatars Selection & Upload Actions */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs font-medium text-zinc-400 px-0.5">
          <span className="flex items-center gap-1.5 text-zinc-300">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            <span>Выберите аниме-аватар</span>
          </span>
          <button
            type="button"
            onClick={() => setShowCustomInput(!showCustomInput)}
            className="text-xs text-zinc-400 hover:text-zinc-200 underline underline-offset-2 transition-colors cursor-pointer"
          >
            {showCustomInput ? 'Скрыть URL' : 'Вставить URL'}
          </button>
        </div>

        {/* Grid of Preset Avatars (8 anime character avatars in 2 neat rows) */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 p-2 rounded-xl bg-zinc-950/60 border border-zinc-800">
          {AVATAR_PRESETS.map((av, idx) => {
            const isSelected = selectedAvatar === av.url;
            return (
              <motion.button
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.95 }}
                key={idx}
                type="button"
                onClick={() => onSelect(av.url)}
                className={`group relative aspect-square rounded-lg overflow-hidden transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-950 shadow-md'
                    : 'border border-zinc-700/60 opacity-70 hover:opacity-100 hover:border-zinc-400'
                }`}
                title={av.name}
              >
                <SafeAvatarImage
                  src={av.url}
                  alt={av.name}
                />
                
                {/* Overlay with character name tooltip on hover */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent py-0.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[9px] font-medium text-white truncate block text-center leading-tight">
                    {av.name}
                  </span>
                </div>

                {isSelected && (
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-white text-zinc-950 flex items-center justify-center shadow-sm">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Direct Photo Upload Button */}
        <label className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-dashed border-zinc-700 hover:border-zinc-500 font-medium text-xs cursor-pointer transition-all">
          <Upload className="w-3.5 h-3.5 text-zinc-400" />
          <span>Загрузить своё фото с устройства</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {/* Optional Custom Image URL Drawer */}
        {showCustomInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2"
          >
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <LinkIcon className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="url"
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-500 transition-colors"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyCustomUrl}
                disabled={!customUrlInput.trim()}
                className="px-3 py-1.5 rounded-lg bg-white text-zinc-950 hover:bg-zinc-200 text-xs font-semibold disabled:opacity-40 transition-colors cursor-pointer"
              >
                Применить
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
