'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import type { EnterpriseProduct } from '@/types/enterprise';
import { getLatestRelease } from '@/lib/enterprise';
import { localizedPath } from '@/utils/i18n';

interface ProductCardProps {
  product: EnterpriseProduct;
  /** Optional override; otherwise computed from latest release */
  latestVersion?: string;
}

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

const CARD_SHELL: Record<string, string> = {
  'hami-enterprise':
    'border-gray-200/90 dark:border-gray-700/80 bg-gradient-to-br from-white to-primary/[0.04] dark:from-gray-900 dark:to-primary/[0.07] hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md',
  'hami-ai-platform':
    'border-gray-200/90 dark:border-gray-700/80 bg-gradient-to-br from-white to-gray-50/90 dark:from-gray-900 dark:to-gray-950/90 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md',
};

const ICON_SHELL =
  'rounded-xl border border-gray-200/80 dark:border-gray-700/70 bg-gray-50 dark:bg-gray-800/90';

const EYEBROW_I18N_KEY: Partial<Record<string, string>> = {
  'hami-enterprise': 'enterprise.list.cardEyebrowHamiEnterprise',
  'hami-ai-platform': 'enterprise.list.cardEyebrowHamiAiPlatform',
};

export default function ProductCard({ product }: ProductCardProps) {
  const locale = useLocale();
  const t = useTranslations();
  const et = useTranslations('enterprise');
  const latest = getLatestRelease(product);
  const href = localizedPath(`/products/${product.id}`, locale);
  const pd = et.raw('productsData') as any;
  const productName = pd[product.id]?.name ?? product.name.en;
  const visual = PRODUCT_VISUAL[product.id] ?? { kind: 'mark' };
  const statusLabel = et(`status.${product.status}` as any) || et('status.ga');
  const artifactCount = latest
    ? latest.artifacts.filter((a) => a.type !== 'install-doc').length
    : 0;

  const shellClass = CARD_SHELL[product.id] ?? CARD_SHELL['hami-ai-platform'];
  const eyebrowKey = EYEBROW_I18N_KEY[product.id];

  return (
    <Link
      href={href}
      className={`group flex flex-col h-full rounded-2xl border transition-all duration-300 overflow-hidden hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950 ${shellClass}`}
    >
      <div className="p-6 md:p-7 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div
              className={`flex-shrink-0 w-11 h-11 flex items-center justify-center overflow-hidden ${ICON_SHELL}`}
            >
              {visual.kind === 'hami' && visual.src ? (
                <Image
                  src={visual.src}
                  alt=""
                  width={28}
                  height={28}
                  className="h-6 w-6 object-contain"
                  aria-hidden="true"
                />
              ) : (
                /* clean geometric mark for HAMi AI Platform */
                <svg
                  viewBox="0 0 24 24"
                  className="h-6 w-6 text-gray-700 dark:text-gray-200"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                </svg>
              )}
            </div>
            <div className="min-w-0 pt-0.5">
              {eyebrowKey ? (
                <p className="text-[11px] font-medium uppercase tracking-wide text-primary/90 dark:text-primary/80 mb-0.5">
                  {t(eyebrowKey)}
                </p>
              ) : null}
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-tight line-clamp-2">
                {productName}
              </h3>
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[product.status] ?? STATUS_DOT.ga}`}
                />
                <span>{statusLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-2 mb-4">
          {pd[product.id]?.tagline ?? product.tagline.en}
        </p>

        {/* Tags */}
        {product.tags && product.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {product.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-gray-100/90 dark:bg-gray-800/80 px-2.5 py-0.5 text-[11px] text-gray-600 dark:text-gray-300 border border-transparent"
              >
                {locale === 'en' ? TAG_EN_MAP[tag] ?? tag : tag}
              </span>
            ))}
          </div>
        )}

        {/* Meta strip */}
        <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 border-t border-gray-100/90 dark:border-gray-800 pt-4 text-xs">
          <div>
            <span className="text-gray-400 dark:text-gray-500 uppercase tracking-wider text-[10px]">
              {t('enterprise.list.metaVersion') || 'Version'}
            </span>
            <p className="mt-0.5 font-medium text-gray-900 dark:text-gray-100 tabular-nums">
              {latest?.version ?? '—'}
            </p>
          </div>
          <div>
            <span className="text-gray-400 dark:text-gray-500 uppercase tracking-wider text-[10px]">
              {t('enterprise.list.metaReleased') || 'Released'}
            </span>
            <p className="mt-0.5 font-medium text-gray-900 dark:text-gray-100 tabular-nums">
              {latest?.releasedAt ?? '—'}
            </p>
          </div>
          <div className="w-full sm:w-auto sm:ml-auto sm:text-right">
            <span className="text-gray-400 dark:text-gray-500 uppercase tracking-wider text-[10px]">
              {t('enterprise.list.metaArtifacts') || 'Artifacts'}
            </span>
            <p className="mt-0.5 text-gray-700 dark:text-gray-300">
              {t('enterprise.list.artifactCount', { count: artifactCount })}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="pt-4 mt-1 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end text-sm">
          <span className="inline-flex items-center gap-1.5 font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200 group-hover:text-primary">
            <span>{t('enterprise.list.downloadCta')}</span>
            <ArrowRightIcon
              className="h-4 w-4 shrink-0 text-gray-400 transition-[color,transform] duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-primary"
              aria-hidden
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
