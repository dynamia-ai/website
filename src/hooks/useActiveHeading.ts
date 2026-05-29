'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { TocItem } from '@/types/blog';

const DEFAULT_OFFSET = 120;

/**
 * Track which heading is currently active while scrolling.
 * Uses "last heading above the offset line" — reliable for long sections.
 */
export function useActiveHeading(toc: TocItem[], offset = DEFAULT_OFFSET) {
  const [activeId, setActiveId] = useState<string | null>(toc[0]?.id ?? null);
  const isScrollingRef = useRef(false);

  const updateActiveHeading = useCallback(() => {
    if (isScrollingRef.current || toc.length === 0) return;

    let currentId = toc[0].id;

    for (const item of toc) {
      const el = document.getElementById(item.id);
      if (!el) continue;
      if (el.getBoundingClientRect().top <= offset + 4) {
        currentId = item.id;
      }
    }

    setActiveId((prev) => (prev === currentId ? prev : currentId));
  }, [toc, offset]);

  useEffect(() => {
    if (toc.length === 0) return;

    let rafId = 0;
    const handleScroll = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        updateActiveHeading();
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    updateActiveHeading();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [toc, updateActiveHeading]);

  const scrollToHeading = useCallback(
    (id: string) => {
      const el = document.getElementById(id);
      if (!el) return;

      setActiveId(id);
      isScrollingRef.current = true;

      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });

      window.setTimeout(() => {
        isScrollingRef.current = false;
        updateActiveHeading();
      }, 800);
    },
    [offset, updateActiveHeading],
  );

  return { activeId, scrollToHeading };
}
