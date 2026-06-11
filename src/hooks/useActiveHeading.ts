'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { TocItem } from '@/types/blog';

const DEFAULT_OFFSET = 120;
const SCROLL_DEBOUNCE_MS = 100;

function pickActiveHeading(toc: TocItem[], offset: number): string | null {
  const viewportHeight = window.innerHeight;
  let bestId: string | null = null;
  let bestDistance = Infinity;
  let bestLevel = Infinity;

  const consider = (item: TocItem, distance: number) => {
    const isCloser =
      distance < bestDistance ||
      (distance === bestDistance && item.level < bestLevel);
    if (isCloser) {
      bestDistance = distance;
      bestLevel = item.level;
      bestId = item.id;
    }
  };

  // Pass 1: visible headings at or below the offset line
  for (const item of toc) {
    const el = document.getElementById(item.id);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    const visible = rect.top < viewportHeight && rect.bottom > offset;
    if (!visible) continue;

    const delta = rect.top - offset;
    if (delta < 0) continue;
    consider(item, delta);
  }

  // Pass 2: closest visible heading to the offset line
  if (!bestId) {
    for (const item of toc) {
      const el = document.getElementById(item.id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      if (rect.top < viewportHeight && rect.bottom > offset) {
        consider(item, Math.abs(rect.top - offset));
      }
    }
  }

  return bestId;
}

/**
 * Track the active TOC heading while scrolling.
 * Two-pass visibility pick (same model as blog TableOfContents) with debounce.
 */
export function useActiveHeading(toc: TocItem[], offset = DEFAULT_OFFSET) {
  const [activeId, setActiveId] = useState<string | null>(toc[0]?.id ?? null);
  const isScrollingRef = useRef(false);

  const updateActiveHeading = useCallback(() => {
    if (isScrollingRef.current || toc.length === 0) return;

    const nextId = pickActiveHeading(toc, offset);
    if (nextId) {
      setActiveId((prev) => (prev === nextId ? prev : nextId));
    }
  }, [toc, offset]);

  useEffect(() => {
    if (toc.length === 0) return;

    let debounceId = 0;
    const scheduleUpdate = () => {
      window.clearTimeout(debounceId);
      debounceId = window.setTimeout(updateActiveHeading, SCROLL_DEBOUNCE_MS);
    };

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });
    updateActiveHeading();

    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.clearTimeout(debounceId);
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

      let finished = false;
      const finishScroll = () => {
        if (finished) return;
        finished = true;
        isScrollingRef.current = false;
        updateActiveHeading();
      };

      const fallbackId = window.setTimeout(finishScroll, 800);
      window.addEventListener(
        'scrollend',
        () => {
          window.clearTimeout(fallbackId);
          finishScroll();
        },
        { once: true },
      );
    },
    [offset, updateActiveHeading],
  );

  return { activeId, scrollToHeading };
}
