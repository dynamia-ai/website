'use client';

import { useEffect, type RefObject } from 'react';
import { useTranslations } from 'next-intl';
import { enhanceCodeBlocks } from '@/lib/code-block-enhancer';

/** Enhance markdown doc content: code-block UI (copy button, language badge). */
export function useDocContentEnhancements(
  containerRef: RefObject<HTMLDivElement | null>,
  html: string,
) {
  const t = useTranslations('enterprise');

  useEffect(() => {
    const container = containerRef.current;
    return enhanceCodeBlocks({
      container,
      labels: {
        copy: t('codeLabels.copy'),
        copied: t('codeLabels.copied'),
        failed: t('codeLabels.failed'),
        aria: t('codeLabels.aria'),
      },
    });
  }, [containerRef, html, t]);
}
