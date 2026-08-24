'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const NavigationProgressBar: React.FC = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Complete progress on route change
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    const raf = requestAnimationFrame(() => {
      setProgress(100);
      timer = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
      }, 150);
    });

    return () => {
      cancelAnimationFrame(raf);
      if (timer) clearTimeout(timer);
    };
  }, [pathname, searchParams]);

  // Listen to clicks on navigation links to start progress instantly (0ms)
  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (!target) return;

      const href = target.getAttribute('href');
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('http') ||
        href.startsWith('mailto:') ||
        target.target === '_blank'
      ) {
        return;
      }

      // If clicking same page, ignore
      if (href === pathname) return;

      setIsVisible(true);
      setProgress(35);

      const trickle = setTimeout(() => {
        setProgress((prev) => (prev < 80 ? 75 : prev));
      }, 120);

      return () => clearTimeout(trickle);
    };

    window.addEventListener('click', handleAnchorClick, { capture: true });
    return () => window.removeEventListener('click', handleAnchorClick, { capture: true });
  }, [pathname]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] h-[2px] pointer-events-none bg-transparent">
      <div
        className="h-full bg-gradient-to-r from-zinc-500 via-zinc-200 to-white transition-all ease-out"
        style={{
          width: `${progress}%`,
          transitionDuration: progress === 100 ? '120ms' : '200ms',
        }}
      />
    </div>
  );
};

export const NavigationProgress: React.FC = () => {
  return (
    <Suspense fallback={null}>
      <NavigationProgressBar />
    </Suspense>
  );
};
