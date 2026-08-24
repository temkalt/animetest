import React from 'react';

export default function AnimeDetailsLoading() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 pb-16 animate-pulse">
      {/* Top Banner Skeleton */}
      <div className="relative w-full aspect-[21/9] sm:aspect-[2.8/1] min-h-[220px] rounded-2xl bg-zinc-900 border border-zinc-800/80 overflow-hidden" />

      {/* Main Grid: Poster + Meta */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Left Column: Poster & Action Buttons */}
        <div className="md:col-span-1 space-y-4">
          <div className="aspect-[3/4] rounded-xl bg-zinc-900 border border-zinc-800" />
          <div className="h-10 rounded-lg bg-zinc-800" />
          <div className="h-9 rounded-lg bg-zinc-900 border border-zinc-800" />
        </div>

        {/* Right Column: Title, Badges, Metrics, Synopsis */}
        <div className="md:col-span-3 space-y-5">
          <div className="flex items-center gap-2">
            <div className="h-6 w-20 rounded bg-zinc-800" />
            <div className="h-6 w-24 rounded bg-zinc-800" />
          </div>

          <div className="space-y-2">
            <div className="h-8 w-3/4 rounded-lg bg-zinc-800" />
            <div className="h-4 w-1/2 rounded bg-zinc-900" />
          </div>

          {/* Metric Panels */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 rounded-lg bg-zinc-900 border border-zinc-800" />
            ))}
          </div>

          {/* Genres */}
          <div className="flex items-center gap-2 pt-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-6 w-16 rounded-lg bg-zinc-800" />
            ))}
          </div>

          {/* Synopsis */}
          <div className="space-y-2 pt-2">
            <div className="h-4 w-full rounded bg-zinc-900" />
            <div className="h-4 w-full rounded bg-zinc-900" />
            <div className="h-4 w-2/3 rounded bg-zinc-900" />
          </div>
        </div>
      </div>

      {/* Episode Grid Skeleton */}
      <div className="space-y-4 pt-4 border-t border-zinc-800/80">
        <div className="h-6 w-36 rounded bg-zinc-800" />
        <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-10 gap-2.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-10 rounded-lg bg-zinc-900 border border-zinc-800" />
          ))}
        </div>
      </div>
    </div>
  );
}
