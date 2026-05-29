'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import {
  ArrowLeftIcon,
  BookOpenIcon,
  ArrowDownTrayIcon,
  ChatBubbleLeftRightIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline';
import type { EnterpriseProduct, Release } from '@/types/enterprise';
import { hasLocalInstallDoc } from '@/lib/enterprise';
import { localizedPath } from '@/utils/i18n';

interface ProductHeroProps { product: EnterpriseProduct; latest: Release | undefined; onJumpDownload?: () => void; }

const STATUS_DOT: Record<string, string> = {
  ga: 'bg-emerald-500',
  beta: 'bg-amber-500',
  eol: 'bg-gray-400',
};

const TAG_EN_MAP: Record<string, string> = {
  'GPU 虚拟化': 'GPU Virtualization',
  '异构算力': 'Heterogeneous Compute',
  '多集群': 'Multi-Cluster',
  '调度': 'Scheduling',
  '资源池化': 'Resource Pooling',
  '租户隔离': 'Tenant Isolation',
};

const ACTION_SHADOW_CLASS = 'shadow-sm hover:shadow-md transition-all';

const SECONDARY_ACTION_CLASS = `inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 ${ACTION_SHADOW_CLASS}`;

export default function ProductHero({ product, latest, onJumpDownload }: ProductHeroProps) {
  const t = useTranslations();
  const locale = useLocale();
  const et = useTranslations('enterprise');
  const backHref = localizedPath('/products', locale);
  const pd = (et.raw('productsData') as any)[product.id];
  const productName = pd?.name ?? product.name.en;
  const statusLabel = et(`status.${product.status}` as any) || et('status.ga');
  const showInstallGuide = hasLocalInstallDoc(product);
  const installHref = localizedPath(`/products/${product.id}/install`, locale);

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
                {statusLabel}
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
              {pd?.tagline ?? product.tagline.en}
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
            className={`inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-dark ${ACTION_SHADOW_CLASS}`}
          >
            <ArrowDownTrayIcon className="h-4 w-4" />
            {t('enterprise.detail.downloadLatest')}
          </button>
          {showInstallGuide && (
            <Link href={installHref} className={SECONDARY_ACTION_CLASS}>
              <BookOpenIcon className="h-4 w-4" />
              {t('enterprise.detail.openInstallGuide')}
            </Link>
          )}
          <Link
            href={localizedPath('/apply-trial', locale)}
            className={SECONDARY_ACTION_CLASS}
          >
            <ChatBubbleLeftRightIcon className="h-4 w-4" />
            {t('enterprise.list.applyTrial')}
          </Link>
        </div>
      </div>
    </section>
  );
}
