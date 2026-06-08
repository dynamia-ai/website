'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { localizedPath } from '@/utils/i18n';
import {
  CheckIcon,
  MinusIcon,
  ArrowRightIcon,
  CpuChipIcon,
  ChartBarIcon,
  BuildingOffice2Icon,
  ServerStackIcon,
} from '@heroicons/react/24/outline';

interface GroupMeta {
  id: string;
  Icon: React.ComponentType<{ className?: string }>;
  rows: { oss: boolean; commercial: boolean; enterprise: boolean }[];
}

const GROUP_META: GroupMeta[] = [
  { id: 'gpu-core', Icon: CpuChipIcon, rows: [
    { oss: true, commercial: true, enterprise: true },
    { oss: true, commercial: true, enterprise: true },
    { oss: false, commercial: true, enterprise: true },
    { oss: false, commercial: true, enterprise: true },
    { oss: false, commercial: true, enterprise: true },
    { oss: false, commercial: true, enterprise: true },
    { oss: false, commercial: true, enterprise: true },
    { oss: false, commercial: true, enterprise: true },
    { oss: true, commercial: true, enterprise: true },
    { oss: false, commercial: true, enterprise: true },
    { oss: false, commercial: true, enterprise: true },
    { oss: true, commercial: true, enterprise: true },
    { oss: false, commercial: true, enterprise: true },
    { oss: false, commercial: true, enterprise: true },
  ]},
  { id: 'gpu-vendors', Icon: ServerStackIcon, rows: [
    { oss: true, commercial: true, enterprise: true },
    { oss: false, commercial: true, enterprise: true },
    { oss: false, commercial: true, enterprise: true },
    { oss: false, commercial: true, enterprise: true },
    { oss: false, commercial: true, enterprise: true },
    { oss: false, commercial: true, enterprise: true },
    { oss: false, commercial: true, enterprise: true },
    { oss: false, commercial: true, enterprise: true },
    { oss: false, commercial: true, enterprise: true },
    { oss: false, commercial: true, enterprise: true },
  ]},
  { id: 'multi-cluster', Icon: ChartBarIcon, rows: [
    { oss: false, commercial: false, enterprise: true },
    { oss: false, commercial: false, enterprise: true },
    { oss: false, commercial: false, enterprise: true },
    { oss: false, commercial: false, enterprise: true },
    { oss: false, commercial: false, enterprise: true },
    { oss: false, commercial: false, enterprise: true },
    { oss: false, commercial: false, enterprise: true },
  ]},
  { id: 'enterprise-ops', Icon: BuildingOffice2Icon, rows: [
    { oss: false, commercial: false, enterprise: true },
    { oss: false, commercial: false, enterprise: true },
    { oss: false, commercial: false, enterprise: true },
    { oss: false, commercial: false, enterprise: true },
    { oss: false, commercial: false, enterprise: true },
    { oss: false, commercial: false, enterprise: true },
    { oss: false, commercial: false, enterprise: true },
  ]},
];

const MATRIX_GRID =
  'grid grid-cols-[minmax(11rem,1fr)_minmax(7rem,9rem)_minmax(7.5rem,9.5rem)_minmax(7.5rem,9.5rem)]';

interface ScopeCtaCardProps {
  href: string;
  title: string;
  subtitle: string;
  external?: boolean;
}

function ScopeCtaCard({ href, title, subtitle, external }: ScopeCtaCardProps) {
  const className =
    'group flex h-full items-center justify-between gap-3 rounded-xl border border-[var(--primary)] bg-white dark:bg-gray-900 px-5 py-4 transition-all duration-200 hover:bg-primary/[0.04] dark:hover:bg-primary/[0.08] hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-950';

  const content = (
    <>
      <div className="min-w-0">
        <div className="text-sm font-semibold leading-snug text-[var(--primary)]">{title}</div>
        <div className="mt-0.5 text-xs text-gray-600 dark:text-gray-400">{subtitle}</div>
      </div>
      <ArrowRightIcon
        className="h-4 w-4 shrink-0 text-gray-800 dark:text-gray-200 transition-[color,transform] duration-200 ease-out group-hover:translate-x-0.5 group-hover:text-[var(--primary)]"
        aria-hidden
      />
    </>
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {content}
    </Link>
  );
}

export default function ProductScope() {
  const t = useTranslations('enterprise');
  const locale = useLocale();
  const c = t.raw('scope');
  const scopeGroups = t.raw('scope.groups');
  const hamiHref = localizedPath('/products/hami-enterprise', locale);
  const entHref = localizedPath('/products/hami-ai-platform', locale);

  const totals = {
    oss: GROUP_META.reduce((s, g) => s + g.rows.filter((r) => r.oss).length, 0),
    commercial: GROUP_META.reduce((s, g) => s + g.rows.filter((r) => r.commercial).length, 0),
    enterprise: GROUP_META.reduce((s, g) => s + g.rows.filter((r) => r.enterprise).length, 0),
  };

  const renderCell = (
    on: boolean,
    accent: 'mid' | 'primary' = 'mid',
    bgClass = '',
  ) => (
    <div
      className={`px-3 py-3.5 flex items-center justify-center border-l border-gray-100 dark:border-gray-800 ${bgClass}`}
    >
      {on ? (
        <CheckIcon
          className={`h-5 w-5 ${
            accent === 'primary' ? 'text-primary' : 'text-gray-700 dark:text-gray-300'
          }`}
          strokeWidth={2.5}
        />
      ) : (
        <MinusIcon className="h-5 w-5 text-gray-300 dark:text-gray-700" />
      )}
    </div>
  );

  return (
    <section className="space-y-10">
      <div className="text-center max-w-3xl mx-auto">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
          {c.title}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{c.subtitle}</p>
      </div>

      {/* Decision banner */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 md:p-8">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-gray-500 dark:text-gray-400 mb-5 text-center">
          {c.decisionTitle}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          {c.decisionRows.map((r: { scenario: string; choice: string }, i: number) => (
            <div key={i} className="flex items-start gap-3">
              <span
                className="mt-0.5 block h-10 w-1 shrink-0 rounded-full bg-[var(--primary)]"
                aria-hidden
              />
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  {r.scenario}
                </p>
                <span className="mt-2 inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                  {c.recommendPrefix}{r.choice}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Comparison matrix · 3 columns */}
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <div className="min-w-[44rem]">
        {/* Header row */}
        <div
          className={`${MATRIX_GRID} border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50`}
        >
          <div className="px-5 py-5 text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            {c.columns.feature}
          </div>
          <div className="px-3 py-4 text-center border-l border-gray-200 dark:border-gray-700">
            <div className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {c.columns.oss}
            </div>
            {c.columns.ossSub ? (
              <div className="mt-1 text-[11px] text-gray-500 dark:text-gray-400 leading-snug">
                {c.columns.ossSub}
              </div>
            ) : null}
          </div>
          <div className="px-3 py-4 text-center border-l border-gray-200 dark:border-gray-700">
            <div className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {c.columns.commercial}
            </div>
            {c.columns.commercialSub ? (
              <div className="mt-1 text-[11px] text-primary/80 dark:text-primary/70 leading-snug">
                {c.columns.commercialSub}
              </div>
            ) : null}
          </div>
          <div className="px-3 py-4 text-center border-l border-gray-200 dark:border-gray-700 bg-primary/5 dark:bg-primary/10">
            <div className="text-sm font-bold text-primary leading-tight">{c.columns.enterprise}</div>
            {c.columns.enterpriseSub ? (
              <div className="mt-1 text-[11px] text-primary/80 dark:text-primary/70 leading-snug">
                {c.columns.enterpriseSub}
              </div>
            ) : null}
          </div>
        </div>

        {/* Group rows */}
        {GROUP_META.map((g, gIdx) => {
          const Icon = g.Icon;
          const dg = scopeGroups[gIdx];
          return (
            <div key={g.id} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <div
                className={`${MATRIX_GRID} bg-gray-50/60 dark:bg-gray-800/40 border-t border-gray-200 dark:border-gray-700`}
              >
                <div className="px-5 py-4 flex items-center gap-2.5">
                  <Icon className="h-5 w-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-base font-semibold text-gray-900 dark:text-gray-100">
                      {dg.title}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 leading-snug mt-0.5">
                      {dg.desc}
                    </div>
                  </div>
                </div>
                <div className="border-l border-gray-200 dark:border-gray-700" />
                <div className="border-l border-gray-200 dark:border-gray-700" />
                <div className="border-l border-gray-200 dark:border-gray-700 bg-primary/5 dark:bg-primary/10" />
              </div>

              {g.rows.map((row, idx) => (
                <div
                  key={idx}
                  className={`${MATRIX_GRID} hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors`}
                >
                  <div className="px-5 py-3.5 text-[15px] text-gray-700 dark:text-gray-300 flex items-center leading-snug">
                    {dg.rows[idx].feature}
                  </div>
                  {renderCell(row.oss)}
                  {renderCell(row.commercial)}
                  {renderCell(
                    row.enterprise,
                    'primary',
                    'bg-primary/[0.04] dark:bg-primary/[0.07]',
                  )}
                </div>
              ))}
            </div>
          );
        })}

        {/* Footer summary */}
        <div
          className={`${MATRIX_GRID} bg-gray-50 dark:bg-gray-800/50 border-t-2 border-gray-200 dark:border-gray-700`}
        >
          <div className="px-5 py-4">
            <div className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold">
              {c.totalsLabel}
            </div>
            <p className="mt-1 text-[11px] text-gray-400 dark:text-gray-500 leading-snug max-w-[14rem]">
              {c.totalsHint}
            </p>
          </div>
          <div className="px-3 py-4 text-center border-l border-gray-200 dark:border-gray-700">
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
              {totals.oss}
            </div>
          </div>
          <div className="px-3 py-4 text-center border-l border-gray-200 dark:border-gray-700">
            <div className="text-lg font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
              {totals.commercial}
            </div>
          </div>
          <div className="px-3 py-4 text-center border-l border-gray-200 dark:border-gray-700 bg-primary/5 dark:bg-primary/10">
            <div className="text-lg font-semibold text-primary tabular-nums">
              {totals.enterprise}
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>

      {/* Bottom CTAs · 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ScopeCtaCard
          href={c.cta.ossHref}
          title={c.cta.ossLabel}
          subtitle={c.cta.ossLink}
          external
        />
        <ScopeCtaCard
          href={hamiHref}
          title={c.cta.commercialLabel}
          subtitle={c.cta.commercialLink}
        />
        <ScopeCtaCard
          href={entHref}
          title={c.cta.enterpriseLabel}
          subtitle={c.cta.enterpriseLink}
        />
      </div>

    </section>
  );
}
