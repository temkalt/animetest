import React from 'react';

export default function CatalogLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 pb-16 animate-pulse">
      {/* Header & Filter Controls Skeleton */}
      <div className="space-y-2">
        <div className="h-8 w-44 rounded-lg bg-zinc-900" />
        <div className="h-4 w-72 rounded bg-zinc-900" />
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-9 w-28 rounded-lg bg-zinc-900 border border-zinc-800 shrink-0" />
        ))}
      </div>

      {/* Grid of Anime Cards Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
        {Array.from({ length: 18 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="aspect-[3/4] rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden" />
            <div className="h-4 w-5/6 rounded bg-zinc-900" />
            <div className="h-3 w-1/2 rounded bg-zinc-900/60" />
          </div>
        ))}
      </div>
    </div>
  );
}
