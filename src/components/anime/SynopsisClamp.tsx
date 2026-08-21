'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, AlignLeft } from 'lucide-react';

interface SynopsisClampProps {
  synopsisRu?: string | null;
  synopsisEn?: string | null;
}

export const SynopsisClamp: React.FC<SynopsisClampProps> = ({ synopsisRu, synopsisEn }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Clean BBCode and unwanted HTML tags from raw descriptions
  const cleanText = (text?: string | null) => {
    if (!text) return '';
    return text
      .replace(/\[\/?(b|i|u|s|url|character|anime|manga|quote|spoiler|center)(=[^\]]*)?\]/gi, '')
      .replace(/<[^>]+>/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&#39;/g, "'")
      .trim();
  };

  const rawDescription = synopsisRu || synopsisEn;
  const cleanedDescription = cleanText(rawDescription);

  if (!cleanedDescription) {
    return (
      <div className="text-xs sm:text-sm text-zinc-400 font-sans italic">
        Описание для данного тайтла временно подготавливается. Смотрите все серии в высоком разрешении 1080p с выбором студий озвучки.
      </div>
    );
  }

  const isLong = cleanedDescription.length > 280;

  return (
    <div className="space-y-2">
      <div className="relative">
        <p
          className={`text-xs sm:text-sm text-zinc-300 font-sans leading-relaxed transition-all duration-300 ${
            !isExpanded && isLong ? 'line-clamp-3 overflow-hidden' : ''
          }`}
        >
          {cleanedDescription}
        </p>

        {/* Gradient fade overlay when collapsed */}
        {!isExpanded && isLong && (
          <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-[#0E1118] via-[#0E1118]/80 to-transparent pointer-events-none" />
        )}
      </div>

      {isLong && (
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer select-none group"
        >
          <span>{isExpanded ? 'Свернуть описание' : 'Читать полностью'}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" />
          )}
        </button>
      )}
    </div>
  );
};
