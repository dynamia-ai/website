'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import {
  ArrowLeftIcon,
  ClockIcon,
  BookOpenIcon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import MainLayout from '@/components/layout/MainLayout';
import { useDocContentEnhancements } from '@/hooks/useDocContentEnhancements';
import { useActiveHeading } from '@/hooks/useActiveHeading';
import { localizedPath } from '@/utils/i18n';
import type { TocItem } from '@/types/blog';

interface InstallDocClientProps { productId: string; title: string; version?: string; lastUpdated?: string; description?: string; html: string; toc?: TocItem[]; }

// Locale-aware chrome labels — bypass useTranslation so first paint matches URL locale
// (avoids EN/ZH flash on the SSG'd install page).

export default function InstallDocClient({ productId, title, version, lastUpdated, description, html, toc = [] }: InstallDocClientProps) {
  const t = useTranslations('enterprise');
  const locale = useLocale();
  const backHref = localizedPath(`/products/${productId}`, locale);

  const contentRef = useRef<HTMLDivElement | null>(null);
  const { activeId, scrollToHeading } = useActiveHeading(toc);
  useDocContentEnhancements(contentRef, html);

  return (
    <MainLayout>
      <section className="relative overflow-hidden border-b border-gray-200 dark:border-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 dark:from-primary/10 dark:via-transparent dark:to-primary/10 pointer-events-none" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            href={backHref}
            className="flex w-fit items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {t('installDoc.back')}
          </Link>
          <div className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold uppercase tracking-wider mb-2">
            <BookOpenIcon className="h-4 w-4" />
            {t('installDoc.label')}
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-3xl">{description}</p>
          )}
          <div className="mt-3 flex items-center gap-4 flex-wrap text-sm text-gray-500 dark:text-gray-400">
            {version && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                {version}
              </span>
            )}
            {lastUpdated && (
              <span className="inline-flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                {t('installDoc.lastUpdated')}: {lastUpdated}
              </span>
            )}
          </div>
        </div>
      </section>

      <article className="py-10 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 xl:grid-cols-[1fr_16rem] gap-8 xl:gap-12">
          <div
            ref={contentRef}
            className="install-doc-content blog-content w-full min-w-0"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          {toc.length > 0 && (
            <aside className="hidden xl:block">
              <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                    <ListBulletIcon className="h-4 w-4" />
                    {t('installDoc.tocTitle')}
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
                          item.level === 1
                            ? 'pl-0 font-medium'
                            : item.level === 2
                              ? 'pl-3'
                              : item.level === 3
                                ? 'pl-6 text-xs'
                                : 'pl-9 text-xs'
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
