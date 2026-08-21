import React from 'react';
import Link from 'next/link';
import { AnimeResolver } from '@/lib/api/resolver';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { Search, Filter, ChevronLeft, ChevronRight, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

interface CatalogProps {
  searchParams: Promise<{
    page?: string;
    genre?: string;
    format?: string;
    status?: string;
    season?: string;
    year?: string;
    search?: string;
    sort?: string;
  }>;
}

const GENRES = [
  { label: 'Все жанры', value: '' },
  { label: 'Экшен (Action)', value: 'Action' },
  { label: 'Приключения', value: 'Adventure' },
  { label: 'Комедия', value: 'Comedy' },
  { label: 'Драма', value: 'Drama' },
  { label: 'Фэнтези', value: 'Fantasy' },
  { label: 'Ужасы', value: 'Horror' },
  { label: 'Меха', value: 'Mecha' },
  { label: 'Мистика', value: 'Mystery' },
  { label: 'Психология', value: 'Psychological' },
  { label: 'Романтика', value: 'Romance' },
  { label: 'Фантастика (Sci-Fi)', value: 'Sci-Fi' },
  { label: 'Повседневность', value: 'Slice of Life' },
  { label: 'Спорт', value: 'Sports' },
  { label: 'Сверхъестественное', value: 'Supernatural' },
  { label: 'Триллер', value: 'Thriller' },
];

const STATUSES = [
  { label: 'Все статусы', value: '' },
  { label: 'Онгоинг (Выходит)', value: 'RELEASING' },
  { label: 'Завершён', value: 'FINISHED' },
  { label: 'Анонс', value: 'NOT_YET_RELEASED' },
];

const FORMATS = [
  { label: 'Все форматы', value: '' },
  { label: 'TV Сериал', value: 'TV' },
  { label: 'Фильм', value: 'MOVIE' },
  { label: 'OVA / ONA', value: 'OVA' },
  { label: 'Спешл', value: 'SPECIAL' },
];

const SORTS = [
  { label: 'По популярности', value: 'POPULARITY_DESC' },
  { label: 'По рейтингу', value: 'SCORE_DESC' },
  { label: 'В тренде сейчас', value: 'TRENDING_DESC' },
  { label: 'Новинки', value: 'START_DATE_DESC' },
];

export const revalidate = 1800;

export default async function CatalogPage({ searchParams }: CatalogProps) {
  const params = await searchParams;
  const currentPage = Math.max(1, parseInt(params.page || '1', 10));
  const activeGenre = params.genre || undefined;
  const activeStatus = params.status || undefined;
  const activeFormat = params.format || undefined;
  const activeSort = params.sort ? [params.sort] : ['POPULARITY_DESC', 'TRENDING_DESC'];
  const searchQuery = params.search || undefined;

  const { items: animeList, pageInfo } = await AnimeResolver.searchCatalog({
    page: currentPage,
    perPage: 36,
    genre: activeGenre,
    status: activeStatus,
    format: activeFormat,
    season: params.season,
    seasonYear: params.year ? parseInt(params.year, 10) : undefined,
    search: searchQuery,
    sort: activeSort,
  });

  const totalPages = Math.min(pageInfo.lastPage || 100, 500);

  const makeUrl = (newParams: Record<string, string | number | undefined>) => {
    const merged = {
      genre: activeGenre,
      status: activeStatus,
      format: activeFormat,
      sort: params.sort,
      search: searchQuery,
      page: currentPage,
      ...newParams,
    };
    const search = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && (k !== 'page' || v !== 1)) {
        search.set(k, String(v));
      }
    });
    const qs = search.toString();
    return qs ? `/catalog?${qs}` : '/catalog';
  };

  const hasActiveFilters = !!(activeGenre || activeStatus || activeFormat || searchQuery);

  return (
    <div className="space-y-8">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
            Каталог аниме
          </h1>
          <p className="text-xs text-zinc-400 font-sans">
            Исследуйте тысячи тайтлов с мгновенной фильтрацией по жанрам и годам
          </p>
        </div>

        {/* Search in catalog form */}
        <form action="/catalog" method="GET" className="flex items-center gap-2 max-w-sm w-full">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              name="search"
              defaultValue={searchQuery || ''}
              placeholder="Поиск в каталоге..."
              className="w-full bg-[#0E1118] border border-white/[0.08] rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/60 transition-all font-sans"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            Найти
          </button>
        </form>
      </div>

      {/* Filter Control Bar */}
      <div className="p-4 rounded-2xl bg-[#0E1118] border border-white/[0.07] shadow-lg space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Genre Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Жанр</label>
            <div className="relative">
              <select
                aria-label="Фильтр по жанру"
                value={activeGenre || ''}
                onChange={(e) => {
                  window.location.href = makeUrl({ genre: e.target.value, page: 1 });
                }}
                className="w-full bg-[#090A0F] text-xs text-zinc-200 border border-white/[0.08] rounded-xl px-3 py-2 appearance-none focus:outline-none focus:border-indigo-500/60 cursor-pointer"
              >
                {GENRES.map((g) => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Status Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Статус</label>
            <select
              aria-label="Фильтр по статусу релиза"
              value={activeStatus || ''}
              onChange={(e) => {
                window.location.href = makeUrl({ status: e.target.value, page: 1 });
              }}
              className="w-full bg-[#090A0F] text-xs text-zinc-200 border border-white/[0.08] rounded-xl px-3 py-2 appearance-none focus:outline-none focus:border-indigo-500/60 cursor-pointer"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Format Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Формат</label>
            <select
              aria-label="Фильтр по формату аниме"
              value={activeFormat || ''}
              onChange={(e) => {
                window.location.href = makeUrl({ format: e.target.value, page: 1 });
              }}
              className="w-full bg-[#090A0F] text-xs text-zinc-200 border border-white/[0.08] rounded-xl px-3 py-2 appearance-none focus:outline-none focus:border-indigo-500/60 cursor-pointer"
            >
              {FORMATS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="space-y-1">
            <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">Сортировка</label>
            <select
              aria-label="Сортировка результатов"
              value={params.sort || 'POPULARITY_DESC'}
              onChange={(e) => {
                window.location.href = makeUrl({ sort: e.target.value, page: 1 });
              }}
              className="w-full bg-[#090A0F] text-xs text-zinc-200 border border-white/[0.08] rounded-xl px-3 py-2 appearance-none focus:outline-none focus:border-indigo-500/60 cursor-pointer"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-zinc-500 font-mono">Активные фильтры:</span>
              {activeGenre && (
                <Link
                  href={makeUrl({ genre: '', page: 1 })}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-mono"
                >
                  <span>{activeGenre}</span>
                  <X className="w-3 h-3" />
                </Link>
              )}
              {activeStatus && (
                <Link
                  href={makeUrl({ status: '', page: 1 })}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[11px] font-mono"
                >
                  <span>{activeStatus}</span>
                  <X className="w-3 h-3" />
                </Link>
              )}
              {activeFormat && (
                <Link
                  href={makeUrl({ format: '', page: 1 })}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[11px] font-mono"
                >
                  <span>{activeFormat}</span>
                  <X className="w-3 h-3" />
                </Link>
              )}
              {searchQuery && (
                <Link
                  href={makeUrl({ search: '', page: 1 })}
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-mono"
                >
                  <span>«{searchQuery}»</span>
                  <X className="w-3 h-3" />
                </Link>
              )}
            </div>

            <Link
              href="/catalog"
              className="text-[11px] text-zinc-400 hover:text-white font-mono transition-colors"
            >
              Сбросить все
            </Link>
          </div>
        )}
      </div>

      {/* Grid of Results */}
      {animeList.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#0E1118] border border-white/[0.08] text-center space-y-3">
          <Filter className="w-8 h-8 text-zinc-600 mx-auto" />
          <h3 className="text-base font-bold text-white">Ничего не найдено</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            Попробуйте изменить параметры поиска или сбросить фильтры.
          </p>
          <Link
            href="/catalog"
            className="inline-block px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold shadow-sm"
          >
            Сбросить фильтры
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {animeList.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          {currentPage > 1 && (
            <Link
              href={makeUrl({ page: currentPage - 1 })}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0E1118] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-zinc-300 transition-all"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Назад</span>
            </Link>
          )}

          <div className="px-3 py-1.5 rounded-xl bg-[#0E1118] border border-white/[0.08] text-xs font-mono text-zinc-400">
            Страница <span className="text-white font-bold">{currentPage}</span> из {totalPages}
          </div>

          {currentPage < totalPages && (
            <Link
              href={makeUrl({ page: currentPage + 1 })}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0E1118] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-medium text-zinc-300 transition-all"
            >
              <span>Вперёд</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
