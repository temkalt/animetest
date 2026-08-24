import React from 'react';

export default function WatchPageLoading() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-2 sm:px-4 pb-12 animate-pulse">
      {/* Header Deck Skeleton */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-zinc-900 border border-zinc-800">
        <div className="h-7 w-36 rounded bg-zinc-800" />
        <div className="h-7 w-48 rounded bg-zinc-800 hidden sm:block" />
      </div>

      {/* 16:9 Video Player Deck Skeleton */}
      <div className="relative w-full aspect-[16/9] sm:aspect-[21/10] max-h-[70vh] rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full border-2 border-zinc-700 border-t-white animate-spin" />
          <p className="text-xs text-zinc-500 font-mono">Подготовка видеоплеера Full HD...</p>
        </div>
      </div>

      {/* Episode Navigation & Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-8 w-2/3 rounded-lg bg-zinc-900" />
          <div className="h-4 w-1/3 rounded bg-zinc-900" />
          <div className="h-20 rounded-xl bg-zinc-900 border border-zinc-800" />
        </div>
        <div className="space-y-3">
          <div className="h-6 w-32 rounded bg-zinc-900" />
          <div className="grid grid-cols-4 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-9 rounded-lg bg-zinc-900 border border-zinc-800" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
