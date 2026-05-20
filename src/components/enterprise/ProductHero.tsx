'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeftIcon,
  BookOpenIcon,
  ArrowDownTrayIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import type { EnterpriseProduct, Locale, Release } from '@/types/enterprise';
import { pickI18n, hasLocalInstallDoc } from '@/lib/enterprise';

interface ProductHeroProps {
  product: EnterpriseProduct;
  latest: Release | undefined;
  locale: Locale;
  onJumpDownload?: () => void;
}

const STATUS_DOT: Record<string, string> = {
  ga: 'bg-emerald-500',
  beta: 'bg-amber-500',
  eol: 'bg-gray-400',
};

const STATUS_LABEL: Record<string, { en: string; zh: string }> = {
  ga: { en: 'Generally Available', zh: '正式版' },
  beta: { en: 'Beta', zh: 'Beta' },
  eol: { en: 'End of Life', zh: '已停止维护' },
};

const TAG_EN_MAP: Record<string, string> = {
  'GPU 虚拟化': 'GPU Virtualization',
  '异构算力': 'Heterogeneous Compute',
  '多集群': 'Multi-Cluster',
  '调度': 'Scheduling',
  '资源池化': 'Resource Pooling',
  '租户隔离': 'Tenant Isolation',
};

export default function ProductHero({ product, latest, locale, onJumpDownload }: ProductHeroProps) {
  const { t } = useTranslation();
  const backHref = locale === 'zh' ? '/zh/products' : '/products';
  const productName = pickI18n(product.name, locale);
  const statusInfo = STATUS_LABEL[product.status] ?? STATUS_LABEL.ga;
  const showInstallGuide = hasLocalInstallDoc(product);
  const installHref = locale === 'zh'
    ? `/zh/products/${product.id}/install`
    : `/products/${product.id}/install`;

  return (
    <section className="relative overflow-hidden border-b border-gray-200 dark:border-gray-800">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 dark:from-primary/10 dark:via-transparent dark:to-primary/10 pointer-events-none" />
      <div
        className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary mb-6"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          {t('enterprise.detail.backToList')}
        </Link>

        <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${STATUS_DOT[product.status] ?? STATUS_DOT.ga}`} />
                {statusInfo[locale]}
              </span>
              {latest && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 tabular-nums">
                  {latest.version}
                </span>
              )}
              {latest && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <CalendarDaysIcon className="h-3.5 w-3.5" />
                  {latest.releasedAt}
                </span>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {productName}
            </h1>
            <p className="mt-2 text-lg text-gray-600 dark:text-gray-300 max-w-3xl">
              {pickI18n(product.tagline, locale)}
            </p>

            {product.tags && product.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  >
                    {locale === 'en' ? TAG_EN_MAP[tag] ?? tag : tag}
                  </span>
                ))}
              </div>
            )}
        </div>

        {/* Quick-actions row */}
        <div className="mt-8 flex gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onJumpDownload}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-dark shadow-sm hover:shadow-md transition-all"
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            {t('enterprise.detail.downloadLatest')}
          </button>
          {showInstallGuide && (
            <Link
              href={installHref}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:border-primary hover:text-primary transition-all"
            >
              <BookOpenIcon className="h-4 w-4" />
              {t('enterprise.detail.openInstallGuide')}
            </Link>
          )}
          {product.docsUrl && (
            <a
              href={product.docsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:border-primary hover:text-primary transition-all"
            >
              <BookOpenIcon className="h-4 w-4" />
              {t('enterprise.detail.openDocs')}
            </a>
          )}
          <Link
            href={locale === 'zh' ? '/zh/apply-trial' : '/apply-trial'}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 text-sm font-semibold hover:border-primary hover:text-primary transition-all"
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            {t('enterprise.detail.contactCta')}
          </Link>
        </div>
      </div>
    </section>
  );
}
