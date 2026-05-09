'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import type { Locale } from '@/types/enterprise';

interface TrustBlockProps {
  locale: Locale;
}

const COMPANIES = [
  { name: 'Company 8', logo: '/logos/company8.svg' },
  { name: 'Company 6', logo: '/logos/company6.png' },
  { name: 'Company 7', logo: '/logos/company7.png' },
  { name: 'Company 9', logo: '/logos/company9.svg' },
  { name: 'OpenCSG', logo: '/logos/opencsg.svg' },
];

const CASE_LINKS: Array<{ slug: string; titleKey: string }> = [
  { slug: 'sf-technology', titleKey: 'navigation.caseSfTechnology' },
  { slug: 'prep-edu', titleKey: 'navigation.casePrepEdu' },
  { slug: 'ke-holdings', titleKey: 'navigation.caseKeHoldings' },
];

export default function TrustBlock({ locale }: TrustBlockProps) {
  const { t } = useTranslation();
  const caseRoot = locale === 'zh' ? '/zh/case-studies' : '/case-studies';

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-center text-base font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {t('enterprise.trust.deployedBy')}
        </h2>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {COMPANIES.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-center h-16 bg-white dark:bg-gray-900 rounded-lg shadow-sm p-3"
            >
              <div className="w-full h-full rounded-md flex items-center justify-center dark:bg-white/95 dark:px-3 dark:py-2">
                <Image
                  src={c.logo}
                  alt={c.name}
                  width={200}
                  height={40}
                  className="object-contain max-h-10 w-auto"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 md:p-7">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div className="min-w-0">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 mb-2">
              {t('enterprise.trust.contactEyebrow')}
            </div>
            <div className="flex items-center gap-x-8 gap-y-2 flex-wrap text-sm">
              {locale === 'zh' && (
                <a
                  href="tel:4000267800"
                  className="inline-flex items-center gap-2 text-gray-900 dark:text-gray-100 hover:text-primary transition-colors"
                >
                  <span className="text-gray-400 dark:text-gray-500">{t('enterprise.trust.contactPhone')}</span>
                  <span className="font-semibold tabular-nums">400-026-7800</span>
                </a>
              )}
              <a
                href="mailto:info@dynamia.ai"
                className="inline-flex items-center gap-2 text-gray-900 dark:text-gray-100 hover:text-primary transition-colors"
              >
                <span className="text-gray-400 dark:text-gray-500">{t('enterprise.trust.contactEmail')}</span>
                <span className="font-semibold">info@dynamia.ai</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/15 dark:to-primary/5 border border-primary/20 p-6 md:p-8">
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {t('enterprise.trust.caseTitle')}
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-300 max-w-2xl">
              {t('enterprise.trust.caseDesc')}
            </p>
          </div>
          <Link
            href={caseRoot}
            className="inline-flex items-center gap-1 text-primary font-medium hover:gap-2 transition-all"
          >
            {t('enterprise.trust.viewAllCases')}
            <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CASE_LINKS.map((c) => (
            <Link
              key={c.slug}
              href={`${caseRoot}/${c.slug}`}
              className="rounded-lg bg-white dark:bg-gray-900 p-4 border border-gray-100 dark:border-gray-800 hover:border-primary/40 hover:shadow-sm transition-all group"
            >
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary line-clamp-2">
                {t(c.titleKey)}
              </div>
              <div className="mt-2 inline-flex items-center text-xs text-primary opacity-80">
                {t('enterprise.trust.readCase')}
                <ArrowRightIcon className="h-3 w-3 ml-1" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
