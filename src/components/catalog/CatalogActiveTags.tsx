import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import { getRussianGenre } from './catalog-data';

interface CatalogActiveTagsProps {
  activeParams: {
    genre?: string;
    status?: string;
    format?: string;
    season?: string;
    year?: string;
    search?: string;
  };
  onRemoveParam: (key: string) => void;
  onResetAll: () => void;
}

export const CatalogActiveTags: React.FC<CatalogActiveTagsProps> = ({
  activeParams,
  onRemoveParam,
  onResetAll,
}) => {
  const activeTags: { key: string; label: string; value: string }[] = [];

  if (activeParams.search) {
    activeTags.push({ key: 'search', label: 'Поиск', value: `«${activeParams.search}»` });
  }
  if (activeParams.genre) {
    activeTags.push({ key: 'genre', label: 'Жанр', value: getRussianGenre(activeParams.genre) });
  }
  if (activeParams.status) {
    const statusMap: Record<string, string> = {
      RELEASING: 'Онгоинг',
      FINISHED: 'Завершен',
      NOT_YET_RELEASED: 'Анонс',
    };
    activeTags.push({ key: 'status', label: 'Статус', value: statusMap[activeParams.status] || activeParams.status });
  }
  if (activeParams.format) {
    activeTags.push({ key: 'format', label: 'Формат', value: activeParams.format });
  }
  if (activeParams.season) {
    const seasonMap: Record<string, string> = {
      WINTER: 'Зима',
      SPRING: 'Весна',
      SUMMER: 'Лето',
      FALL: 'Осень',
    };
    activeTags.push({ key: 'season', label: 'Сезон', value: seasonMap[activeParams.season] || activeParams.season });
  }
  if (activeParams.year) {
    activeTags.push({ key: 'year', label: 'Год', value: activeParams.year });
  }

  if (activeTags.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 p-3 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 backdrop-blur-sm">
      <span className="text-xs text-zinc-500 font-medium ml-1">Активные фильтры:</span>
      {activeTags.map((tag) => (
        <span
          key={tag.key}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-zinc-800/90 border border-zinc-700/60 text-xs text-zinc-200 font-medium shadow-sm animate-in fade-in zoom-in-95 duration-150"
        >
          <span className="text-zinc-400">{tag.label}:</span>
          <span className="text-violet-300 font-semibold">{tag.value}</span>
          <button
            onClick={() => onRemoveParam(tag.key)}
            className="p-0.5 hover:bg-zinc-700 text-zinc-400 hover:text-zinc-100 rounded-md transition-colors ml-0.5"
            aria-label={`Удалить фильтр ${tag.label}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      {activeTags.length > 1 && (
        <button
          onClick={onResetAll}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-medium transition-colors ml-auto"
        >
          <RotateCcw className="w-3 h-3" />
          Сбросить все
        </button>
      )}
    </div>
  );
};
