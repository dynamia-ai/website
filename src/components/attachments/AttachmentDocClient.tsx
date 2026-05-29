'use client';

import React, { useEffect, useRef } from 'react';
import {
  ClockIcon,
  PaperClipIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import MainLayout from '@/components/layout/MainLayout';
import { enhanceCodeBlocks } from '@/lib/code-block-enhancer';
import { useActiveHeading } from '@/hooks/useActiveHeading';
import type { Locale } from '@/types/enterprise';
import type { TocItem } from '@/types/blog';

interface AttachmentDocClientProps {
  title: string;
  description?: string;
  lastUpdated?: string;
  html: string;
  toc?: TocItem[];
  locale: Locale;
}

const CHROME = {
  en: {
    label: 'Attachment',
    lastUpdated: 'Last updated',
    tocTitle: 'On this page',
  },
  zh: {
    label: '附件',
    lastUpdated: '最后更新',
    tocTitle: '本页目录',
  },
} as const;

export default function AttachmentDocClient({
  title,
  description,
  lastUpdated,
  html,
  toc = [],
  locale,
}: AttachmentDocClientProps) {
  const labels = CHROME[locale] ?? CHROME.en;
  const contentRef = useRef<HTMLDivElement | null>(null);
  const { activeId, scrollToHeading } = useActiveHeading(toc);

  useEffect(() => {
    const cleanup = enhanceCodeBlocks({ container: contentRef.current, locale });
    return cleanup;
  }, [html, locale]);

  return (
    <MainLayout>
      <section className="relative overflow-hidden border-b border-gray-200 dark:border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 dark:from-primary/10 dark:via-transparent dark:to-primary/10 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold uppercase tracking-wider mb-2">
            <PaperClipIcon className="h-4 w-4" />
            {labels.label}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-3xl">{description}</p>
          )}
          {lastUpdated && (
            <div className="mt-3 inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <ClockIcon className="h-4 w-4" />
              {labels.lastUpdated}: {lastUpdated}
            </div>
          )}
        </div>
      </section>

      <article className="py-10 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 xl:grid-cols-[1fr_16rem] gap-8 xl:gap-12">
          <div
            ref={contentRef}
            className="install-doc-content attachment-content w-full min-w-0"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          {toc.length > 0 && (
            <aside className="hidden xl:block">
              <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    <ListBulletIcon className="h-4 w-4" />
                    {labels.tocTitle}
                  </div>
                  <nav className="space-y-1 text-sm">
                    {toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          scrollToHeading(item.id);
                        }}
                        className={`block py-1 leading-snug transition-colors ${
                          item.level === 1 ? 'pl-0 font-medium' : item.level === 2 ? 'pl-3' : 'pl-6 text-xs'
                        } ${
                          activeId === item.id
                            ? 'text-primary font-medium border-l-2 border-primary -ml-px'
                            : 'text-gray-600 dark:text-gray-400 hover:text-primary'
                        }`}
                      >
                        {item.text}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            </aside>
          )}
        </div>
      </article>
    </MainLayout>
  );
}
