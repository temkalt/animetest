import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface CatalogPaginationProps {
  currentPage: number;
  lastPage: number;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
  isPending?: boolean;
}

export const CatalogPagination: React.FC<CatalogPaginationProps> = ({
  currentPage,
  lastPage,
  hasNextPage,
  onPageChange,
  isPending = false,
}) => {
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (lastPage <= maxVisible + 2) {
      for (let i = 1; i <= lastPage; i++) pages.push(i);
    } else {
      pages.push(1);
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(lastPage - 1, currentPage + 1);

      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < lastPage - 1) pages.push('...');
      pages.push(lastPage);
    }
    return pages;
  };

  return (
    <nav aria-label="Пагинация каталога" className="flex items-center justify-center gap-1 sm:gap-2 mt-10 mb-4 select-none">
      {/* First Page */}
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage <= 1 || isPending}
        className="p-2 sm:px-3 sm:py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none transition-all"
        title="Первая страница"
        aria-label="Перейти на первую страницу"
      >
        <ChevronsLeft className="w-4 h-4" />
      </button>

      {/* Prev Page */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1 || isPending}
        className="p-2 sm:px-3 sm:py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none transition-all"
        title="Предыдущая страница"
        aria-label="Перейти на предыдущую страницу"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((num, idx) =>
          typeof num === 'number' ? (
            <button
              key={`page-${num}`}
              onClick={() => onPageChange(num)}
              disabled={isPending}
              aria-current={currentPage === num ? 'page' : undefined}
              className={`min-w-[36px] sm:min-w-[40px] h-9 sm:h-10 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                currentPage === num
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30 border border-violet-500/50'
                  : 'bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
              }`}
            >
              {num}
            </button>
          ) : (
            <span key={`dots-${idx}`} className="px-1 text-zinc-600 text-sm font-bold">
              {num}
            </span>
          )
        )}
      </div>

      {/* Next Page */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={(!hasNextPage && currentPage >= lastPage) || isPending}
        className="p-2 sm:px-3 sm:py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none transition-all"
        title="Следующая страница"
        aria-label="Перейти на следующую страницу"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Last Page */}
      <button
        onClick={() => onPageChange(lastPage)}
        disabled={currentPage >= lastPage || isPending}
        className="p-2 sm:px-3 sm:py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-40 disabled:pointer-events-none transition-all"
        title="Последняя страница"
        aria-label="Перейти на последнюю страницу"
      >
        <ChevronsRight className="w-4 h-4" />
      </button>
    </nav>
  );
};
