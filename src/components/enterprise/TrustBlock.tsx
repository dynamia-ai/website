'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { localizedPath, shortenDescription } from '@/utils/i18n';

const COMPANIES = [
  { name: 'Company 8', logo: '/logos/company8.svg' },
  { name: 'Company 6', logo: '/logos/company6.png' },
  { name: 'Company 7', logo: '/logos/company7.png' },
  { name: 'Company 9', logo: '/logos/company9.svg' },
  { name: 'OpenCSG', logo: '/logos/opencsg.svg' },
];

const CASE_LINKS = [
  {
    slug: 'sf-technology',
    titleKey: 'navigation.caseSfTechnology',
    descKey: 'navigation.caseSfTechnologyDesc',
    logos: [
      { src: '/images/case-studies/icons/sf-tech.svg', alt: 'SF Technology', width: 40, height: 40 },
      { src: '/hami.svg', alt: 'HAMi', width: 32, height: 32 },
    ],
  },
  {
    slug: 'prep-edu',
    titleKey: 'navigation.casePrepEdu',
    descKey: 'navigation.casePrepEduDesc',
    logos: [
      { src: '/images/case-studies/icons/prep-logo.svg', alt: 'PREP EDU', width: 44, height: 44 },
      { src: '/hami.svg', alt: 'HAMi', width: 32, height: 32 },
    ],
  },
  {
    slug: 'ke-holdings',
    titleKey: 'navigation.caseKeHoldings',
    descKey: 'navigation.caseKeHoldingsDesc',
    logos: [
      { src: '/images/case-studies/icons/beike.png', alt: 'Ke Holdings', width: 40, height: 40 },
      { src: '/hami.svg', alt: 'HAMi', width: 32, height: 32 },
    ],
  },
] as const;

export default function TrustBlock() {
  const t = useTranslations();
  const locale = useLocale();
  const caseRoot = localizedPath('/case-studies', locale);

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-center text-base font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
          {t('enterprise.trust.deployedBy')}
        </h2>
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
          {COMPANIES.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-center h-16 bg-white dark:bg-gray-900 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm p-3"
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

      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 md:p-8">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 mb-3">
          {t('enterprise.trust.contactEyebrow')}
        </div>
        <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm">
          {locale === 'zh' && (
            <a
              href="tel:4000267800"
              className="inline-flex items-center gap-2 text-gray-900 dark:text-gray-100 hover:text-primary transition-colors"
            >
              <span className="text-gray-400 dark:text-gray-500">
                {t('enterprise.trust.contactPhone')}
              </span>
              <span className="font-semibold tabular-nums">400-026-7800</span>
            </a>
          )}
          <a
            href="mailto:info@dynamia.ai"
            className="inline-flex items-center gap-2 text-gray-900 dark:text-gray-100 hover:text-primary transition-colors"
          >
            <span className="text-gray-400 dark:text-gray-500">
              {t('enterprise.trust.contactEmail')}
            </span>
            <span className="font-semibold">info@dynamia.ai</span>
          </a>
        </div>
      </div>

      <div>
        <div className="text-center max-w-3xl mx-auto mb-8">
          <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            {t('enterprise.trust.caseTitle')}
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            {t('enterprise.trust.caseDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CASE_LINKS.map((item) => (
            <Link
              key={item.slug}
              href={`${caseRoot}/${item.slug}`}
              className="group flex flex-col h-full rounded-2xl border border-gray-200/90 dark:border-gray-700/80 bg-white dark:bg-gray-900 p-6 transition-all duration-300 hover:border-primary/35 hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
            >
              <div className="flex items-center gap-2.5 mb-4">
                {item.logos.map((logo) => {
                  const isRaster = logo.src.endsWith('.png') || logo.src.endsWith('.webp');
                  return (
                    <div
                      key={logo.src}
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border ${
                        isRaster
                          ? 'border-gray-200/90 bg-gray-50 dark:border-gray-700 dark:bg-white/95'
                          : 'border-gray-200/80 bg-white dark:border-gray-700 dark:bg-white/95'
                      }`}
                    >
                      <Image
                        src={logo.src}
                        alt={logo.alt}
                        width={logo.width}
                        height={logo.height}
                        className={`object-contain ${isRaster ? 'max-h-7 max-w-8' : 'h-7 w-7 dark:p-0.5'}`}
                      />
                    </div>
                  );
                })}
              </div>
              <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 group-hover:text-[var(--primary)] transition-colors">
                {t(item.titleKey)}
              </h4>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 flex-1">
                {shortenDescription(String(t(item.descKey)), (t.raw('enterprise.trust.truncationLength') as number) || 140)}
              </p>
              <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-gray-900 dark:text-gray-100 transition-colors group-hover:text-[var(--primary)]">
                {t('enterprise.trust.readCase')}
                <ArrowRightIcon
                  className="h-4 w-4 shrink-0 text-gray-400 transition-[color,transform] duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-[var(--primary)]"
                  aria-hidden
                />
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href={caseRoot}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--primary)] bg-white dark:bg-gray-900 px-5 py-2.5 text-sm font-semibold text-[var(--primary)] transition-all hover:bg-primary/[0.06] dark:hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950"
          >
            {t('enterprise.trust.viewAllCases')}
            <ArrowRightIcon className="h-4 w-4 shrink-0" aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  );
}
