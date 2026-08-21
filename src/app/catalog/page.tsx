import React from 'react';
import Link from 'next/link';
import { AnimeResolver } from '@/lib/api/resolver';
import { AnimeCard } from '@/components/anime/AnimeCard';
import { Sparkles, Search, Filter, ChevronLeft, ChevronRight, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

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
  { label: 'Меха (Роботы)', value: 'Mecha' },
  { label: 'Мистика / Детектив', value: 'Mystery' },
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
  { label: 'Полнометражный фильм', value: 'MOVIE' },
  { label: 'OVA / ONA', value: 'OVA' },
  { label: 'Спешл', value: 'SPECIAL' },
];

const SORTS = [
  { label: 'По популярности', value: 'POPULARITY_DESC' },
  { label: 'По рейтингу (Оценка)', value: 'SCORE_DESC' },
  { label: 'В тренде сейчас', value: 'TRENDING_DESC' },
  { label: 'Новинки (Дата выхода)', value: 'START_DATE_DESC' },
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

  // Helper to build URL with query params
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
    const str = search.toString();
    return str ? `/catalog?${str}` : '/catalog';
  };

  return (
    <div className="space-y-8">
      {/* 1. Header & Quick Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest font-semibold">
              Глобальная база 20,000+ тайтлов
            </span>
          </div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-white">
            Каталог всех аниме
          </h1>
        </div>

        {/* Search Input In Catalog */}
        <form action="/catalog" method="GET" className="w-full md:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            name="search"
            defaultValue={searchQuery || ''}
            placeholder="Поиск по названию в каталоге..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#0E1017] border border-white/10 text-white text-xs font-sans placeholder-slate-500 focus:outline-none focus:border-violet-500 shadow-inner"
          />
        </form>
      </div>

      {/* 2. Faceted Filters & Sorting Controls */}
      <div className="p-5 rounded-3xl bg-[#0E1017] border border-white/5 space-y-4 shadow-xl">
        {/* Genre Tags Scrollable Row */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Жанры:</span>
            {activeGenre && (
              <Link href={makeUrl({ genre: undefined, page: 1 })} className="text-rose-400 hover:underline">
                Сбросить жанр ✕
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {GENRES.map((g) => {
              const isSelected = (!activeGenre && g.value === '') || activeGenre === g.value;
              return (
                <Link
                  key={g.value}
                  href={makeUrl({ genre: g.value || undefined, page: 1 })}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-mono whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-violet-600 text-white font-bold shadow-[0_0_12px_rgba(139,92,246,0.5)] border border-violet-400'
                      : 'bg-[#141722] hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
                  }`}
                >
                  {g.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Status, Format & Sorting Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-white/5">
          {/* Status */}
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400">Статус релиза:</span>
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {STATUSES.map((s) => (
                <Link
                  key={s.value}
                  href={makeUrl({ status: s.value || undefined, page: 1 })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                    (!activeStatus && s.value === '') || activeStatus === s.value
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Format */}
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400">Формат:</span>
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {FORMATS.map((f) => (
                <Link
                  key={f.value}
                  href={makeUrl({ format: f.value || undefined, page: 1 })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                    (!activeFormat && f.value === '') || activeFormat === f.value
                      ? 'bg-violet-500/20 text-violet-300 border border-violet-500/40 font-bold'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {f.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Sort */}
          <div className="space-y-1">
            <span className="text-[11px] font-mono text-slate-400">Сортировка:</span>
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {SORTS.map((st) => (
                <Link
                  key={st.value}
                  href={makeUrl({ sort: st.value, page: 1 })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                    (!params.sort && st.value === 'POPULARITY_DESC') || params.sort === st.value
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                      : 'bg-white/5 text-slate-400 hover:text-white'
                  }`}
                >
                  {st.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Anime Grid (36 per page) */}
      {animeList.length === 0 ? (
        <div className="p-16 rounded-3xl bg-[#0E1017] border border-white/5 text-center space-y-3">
          <Filter className="w-10 h-10 mx-auto text-slate-600 mb-2" />
          <h3 className="text-lg font-bold font-display text-white">Ничего не найдено</h3>
          <p className="text-xs text-slate-400 font-mono">
            Попробуйте изменить выбранные фильтры или ввести другое название в строке поиска.
          </p>
          <Link
            href="/catalog"
            className="inline-block px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-mono font-bold"
          >
            Сбросить все фильтры
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {animeList.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      )}

      {/* 4. Complete Pagination Controls */}
      <div className="p-4 rounded-3xl bg-[#0E1017] border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs font-mono text-slate-400">
          Страница <span className="text-white font-bold">{currentPage}</span> из{' '}
          <span className="text-white font-bold">{totalPages}</span>
        </div>

        {/* Stepper Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {/* First Page */}
          {currentPage > 1 && (
            <Link
              href={makeUrl({ page: 1 })}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-mono"
            >
              « Первая
            </Link>
          )}

          {/* Prev Page */}
          {currentPage > 1 && (
            <Link
              href={makeUrl({ page: currentPage - 1 })}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </Link>
          )}

          {/* Surrounding Pages (e.g. -2, -1, current, +1, +2) */}
          {Array.from({ length: 5 }).map((_, idx) => {
            const pageNum = currentPage - 2 + idx;
            if (pageNum < 1 || pageNum > totalPages) return null;
            const isCurrent = pageNum === currentPage;
            return (
              <Link
                key={pageNum}
                href={makeUrl({ page: pageNum })}
                className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-mono font-bold transition-all ${
                  isCurrent
                    ? 'bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.5)] border border-violet-400'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
                }`}
              >
                {pageNum}
              </Link>
            );
          })}

          {/* Next Page */}
          {currentPage < totalPages && (
            <Link
              href={makeUrl({ page: currentPage + 1 })}
              className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}

          {/* Last Page */}
          {currentPage < totalPages && (
            <Link
              href={makeUrl({ page: totalPages })}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-mono"
            >
              Последняя »
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
