'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import type { EnterpriseProduct, Locale } from '@/types/enterprise';
import { pickI18n, getLatestRelease } from '@/lib/enterprise';

interface ProductCardProps {
  product: EnterpriseProduct;
  locale: Locale;
  /** Optional override; otherwise computed from latest release */
  latestVersion?: string;
}

const STATUS_LABEL: Record<string, { en: string; zh: string }> = {
  ga: { en: 'Generally Available', zh: '正式版' },
  beta: { en: 'Beta', zh: 'Beta' },
  eol: { en: 'End of Life', zh: '已停止维护' },
};

const STATUS_DOT: Record<string, string> = {
  ga: 'bg-emerald-500',
  beta: 'bg-amber-500',
  eol: 'bg-gray-400',
};

const PRODUCT_VISUAL: Record<string, { kind: 'hami' | 'mark'; src?: string }> = {
  'hami-enterprise': { kind: 'hami', src: '/hami.svg' },
  'hami-ai-platform': { kind: 'mark' },
};

const TAG_EN_MAP: Record<string, string> = {
  'GPU 虚拟化': 'GPU Virtualization',
  '异构算力': 'Heterogeneous Compute',
  '多集群': 'Multi-Cluster',
  '调度': 'Scheduling',
  '资源池化': 'Resource Pooling',
  '租户隔离': 'Tenant Isolation',
};

export default function ProductCard({ product, locale }: ProductCardProps) {
  const { t } = useTranslation();
  const latest = getLatestRelease(product);
  const href = locale === 'zh' ? `/zh/enterprise/${product.id}` : `/enterprise/${product.id}`;
  const productName = pickI18n(product.name, locale);
  const visual = PRODUCT_VISUAL[product.id] ?? { kind: 'mark' };
  const statusInfo = STATUS_LABEL[product.status] ?? STATUS_LABEL.ga;
  const artifactCount = latest
    ? latest.artifacts.filter((a) => a.type !== 'install-doc').length
    : 0;

  return (
    <Link
      href={href}
      className="group flex flex-col h-full rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm transition-all overflow-hidden"
    >
      <div className="p-7 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
              {visual.kind === 'hami' && visual.src ? (
                <Image
                  src={visual.src}
                  alt=""
                  width={28}
                  height={28}
                  className="h-6 w-6"
                  aria-hidden="true"
                />
              ) : (
                /* clean geometric mark for HAMi AI Platform */
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 text-gray-700 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.6}
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-tight line-clamp-2">
                {productName}
              </h3>
              <div className="mt-1 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                <span className={`inline-block w-1.5 h-1.5 rounded-full ${STATUS_DOT[product.status] ?? STATUS_DOT.ga}`} />
                <span>{statusInfo[locale]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 mb-5">
          {pickI18n(product.tagline, locale)}
        </p>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-6">
            {product.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 rounded text-[11px] text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700"
              >
                {locale === 'en' ? TAG_EN_MAP[tag] ?? tag : tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta strip */}
        <dl className="grid grid-cols-2 gap-y-2 gap-x-4 mt-auto pb-5 text-xs">
          <div>
            <dt className="text-gray-400 dark:text-gray-500 uppercase tracking-wider text-[10px]">
              {t('enterprise.list.metaVersion') || 'Version'}
            </dt>
            <dd className="mt-0.5 font-medium text-gray-900 dark:text-gray-100 tabular-nums">
              {latest?.version ?? '—'}
            </dd>
          </div>
          <div>
            <dt className="text-gray-400 dark:text-gray-500 uppercase tracking-wider text-[10px]">
              {t('enterprise.list.metaReleased') || 'Released'}
            </dt>
            <dd className="mt-0.5 font-medium text-gray-900 dark:text-gray-100 tabular-nums">
              {latest?.releasedAt ?? '—'}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-gray-400 dark:text-gray-500 uppercase tracking-wider text-[10px]">
              {t('enterprise.list.metaArtifacts') || 'Artifacts'}
            </dt>
            <dd className="mt-0.5 text-gray-700 dark:text-gray-300">
              {t('enterprise.list.artifactCount', { count: artifactCount })}
            </dd>
          </div>
        </dl>

        {/* CTA */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">
            {t('enterprise.list.viewDetail')}
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary group-hover:gap-2 transition-all">
            {t('enterprise.list.downloadCta')}
            <ArrowRightIcon className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
