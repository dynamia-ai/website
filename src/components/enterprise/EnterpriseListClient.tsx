'use client';

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  ShieldCheckIcon,
  CubeTransparentIcon,
  CloudArrowDownIcon,
  ArrowRightIcon,
} from '@heroicons/react/24/outline';
import MainLayout from '@/components/layout/MainLayout';
import ProductCard from '@/components/enterprise/ProductCard';
import HamiOriginBanner from '@/components/enterprise/HamiOriginBanner';
import ProductScope from '@/components/enterprise/ProductScope';
import TrustBlock from '@/components/enterprise/TrustBlock';
import { getProducts, getLatestRelease } from '@/lib/enterprise';
import { captureAttribution } from '@/utils/utm';
import type { Locale } from '@/types/enterprise';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface EnterpriseListClientProps {
  locale: Locale;
}

export default function EnterpriseListClient({ locale }: EnterpriseListClientProps) {
  const { t } = useTranslation();
  const products = getProducts();
  const totalReleases = products.reduce((sum, p) => sum + p.releases.length, 0);
  const gaCount = products.filter((p) => p.status === 'ga').length;
  const totalArtifacts = products.reduce(
    (sum, p) =>
      sum +
      p.releases.reduce((s, r) => s + r.artifacts.filter((a) => a.type !== 'install-doc').length, 0),
    0,
  );

  useEffect(() => {
    captureAttribution();
  }, []);

  return (
    <MainLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white dark:bg-gray-900">
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-[0.04] dark:opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />
        <div className="absolute -top-32 -left-20 w-[480px] h-[480px] rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-20 w-[480px] h-[480px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm md:text-base font-semibold uppercase tracking-wider mb-6">
              <ShieldCheckIcon className="h-4 w-4 md:h-5 md:w-5" />
              {t('enterprise.list.heroBadge')}
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
              {t('enterprise.list.title')}
            </h1>
            <p className="mt-5 text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
              {t('enterprise.list.subtitle')}
            </p>

            <div className="mt-8 flex justify-center gap-3 flex-wrap">
              <a
                href={locale === 'zh' ? '/zh/apply-trial' : '/apply-trial'}
                className="inline-flex items-center gap-1.5 px-6 py-3 rounded-md bg-primary text-white font-semibold hover:bg-primary-dark shadow-sm hover:shadow-md transition-all"
              >
                {t('enterprise.list.heroApplyTrial')}
                <ArrowRightIcon className="h-4 w-4" />
              </a>
            </div>
          </motion.div>

          {/* Stats strip */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
          >
            {[
              {
                value: products.length,
                label: t('enterprise.list.statEditions'),
                icon: CubeTransparentIcon,
              },
              {
                value: gaCount,
                label: t('enterprise.list.statGA'),
                icon: ShieldCheckIcon,
              },
              {
                value: totalReleases,
                label: t('enterprise.list.statReleases'),
                icon: CloudArrowDownIcon,
              },
              {
                value: totalArtifacts,
                label: t('enterprise.list.statArtifacts'),
                icon: CloudArrowDownIcon,
              },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-xl border border-gray-200/80 dark:border-gray-700/80 bg-white/60 dark:bg-gray-900/60 backdrop-blur p-4 text-center"
              >
                <s.icon className="h-5 w-5 text-primary mx-auto mb-2" />
                <div className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {s.value}
                </div>
                <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Product matrix */}
      <section className="py-16 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <HamiOriginBanner locale={locale} />
          </div>

          <div className="flex items-end justify-between mb-8 flex-wrap gap-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100">
                {t('enterprise.list.matrixTitle')}
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('enterprise.list.matrixDesc')}
              </p>
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('enterprise.list.matrixCount', { count: products.length })}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product, index) => (
              <motion.div
                key={product.id}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <ProductCard
                  product={product}
                  locale={locale}
                  latestVersion={getLatestRelease(product)?.version}
                />
              </motion.div>
            ))}
          </div>

          <div className="mt-20">
            <ProductScope locale={locale} />
          </div>

          <div className="mt-20">
            <TrustBlock locale={locale} />
          </div>

          <div className="mt-16 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-primary/[0.03] dark:from-gray-900 dark:to-primary/[0.06] p-8 md:p-10">
            <div className="flex items-center justify-between gap-6 flex-wrap">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-100">
                  {t('enterprise.list.helpTitle')}
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl">
                  {t('enterprise.list.helpDesc')}
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <a
                  href={locale === 'zh' ? '/zh/apply-trial' : '/apply-trial'}
                  className="inline-flex items-center px-5 py-2.5 rounded-md bg-primary text-white font-medium hover:bg-primary-dark shadow-sm hover:shadow-md transition-all"
                >
                  {t('enterprise.list.applyTrial')}
                </a>
                <a
                  href={locale === 'zh' ? '/zh/pricing' : '/pricing'}
                  className="inline-flex items-center px-5 py-2.5 rounded-md border border-primary text-primary font-medium hover:bg-primary/5 transition-colors"
                >
                  {t('enterprise.list.viewPricing')}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
