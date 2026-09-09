'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import MainLayout from '@/components/layout/MainLayout';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const CaseCetcCloud: React.FC = () => {
  const t = useTranslations();

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 pt-20 pb-12 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="text-center max-w-5xl mx-auto"
          >
            <div className="flex justify-center mb-6">
              <div className="flex items-center space-x-8">
                <div className="w-24 h-24 bg-gray-50 dark:bg-white/95 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center p-2">
                  <Image
                    src="/images/case-studies/icons/cetc-cloud.png"
                    alt="CETC Cloud Logo"
                    width={96}
                    height={54}
                    className="w-full h-auto"
                  />
                </div>
                <div className="text-4xl text-gray-400 dark:text-gray-500">+</div>
                <div className="w-24 h-24 bg-white dark:bg-white/95 rounded-lg shadow-sm p-2 flex items-center justify-center">
                  <Image
                    src="/hami.svg"
                    alt="HAMi Logo"
                    width={80}
                    height={80}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 sm:text-5xl mb-6">
              {t('caseStudiesPage.h1Prefix')}
              {t('cases.cetcCloud.title')}
            </h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              {t('cases.cetcCloud.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(function () {
              const stats = t.raw('cases.cetcCloud.stats');
              return Array.isArray(stats)
                ? stats
                : [
                    { value: '15×', label: 'dev Pod capacity gain' },
                    { value: '87.5%', label: 'per-card VRAM reclaimed' },
                    { value: '80%', label: 'per-card compute kept schedulable' },
                  ];
            })().map((stat: any, index: number) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-gray-600 dark:text-gray-300">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
                {t('cases.cetcCloud.overview.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                {t('cases.cetcCloud.overview.description')}
              </p>
              <div className="space-y-4">
                {(function () {
                  const keyPoints = t.raw('cases.cetcCloud.overview.keyPoints');
                  return Array.isArray(keyPoints)
                    ? keyPoints
                    : ['Portable appliance', 'Production + dev on one device', 'Kubernetes + HAMi foundation'];
                })().map((point: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-600 dark:text-gray-300">{point}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-md bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-800 dark:to-gray-800 rounded-lg p-8">
                <div className="text-center">
                  <div className="w-24 h-16 bg-gray-50 dark:bg-white/95 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mx-auto mb-4 flex items-center justify-center p-2">
                    <Image
                      src="/images/case-studies/icons/cetc-cloud.png"
                      alt="CETC Cloud Logo"
                      width={96}
                      height={54}
                      className="w-full h-auto"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('cases.cetcCloud.companyCard.name')}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{t('cases.cetcCloud.companyCard.description')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Case Information */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
              {t('cases.cetcCloud.info.title')}
            </h2>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
              {(function () {
                const rows = t.raw('cases.cetcCloud.info.rows');
                return Array.isArray(rows) ? rows : [];
              })().map((row: { label: string; value: string }, index: number) => (
                <div
                  key={index}
                  className={`grid grid-cols-1 sm:grid-cols-3 gap-2 px-6 py-4 ${
                    index % 2 === 0 ? 'bg-white dark:bg-gray-800/60' : ''
                  } border-b border-gray-200 dark:border-gray-700 last:border-b-0`}
                >
                  <div className="font-semibold text-gray-900 dark:text-gray-100">{row.label}</div>
                  <div className="sm:col-span-2 text-gray-600 dark:text-gray-300">{row.value}</div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-sm text-gray-500 dark:text-gray-400 text-center">
              {t('cases.cetcCloud.sourceLabel')}{' '}
              <a
                href="https://www.cncf.io/case-studies/cetc-cloud/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary-dark font-medium underline"
              >
                CNCF Case Study
              </a>
            </p>
          </motion.div>
        </div>
      </section>

      {/* Challenges */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('cases.cetcCloud.challenge.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              {t('cases.cetcCloud.challenge.description')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto dark:[&>*]:bg-gray-800 dark:[&>*]:border-gray-700">
            {(function () {
              const challenges = t.raw('cases.cetcCloud.challenge.points');
              return Array.isArray(challenges)
                ? challenges
                : [
                    { title: 'Very different workload profiles', description: 'Online serving, batch ingestion, and interactive dev workloads use GPUs in different ways.' },
                    { title: 'Whole-card binding exhausts devices', description: 'Long-term exclusive binding quickly exhausts limited portable devices.' },
                    { title: 'Over-partitioning introduces new risks', description: 'Finest partitioning amplifies VRAM shortage, jitter, and fault propagation.' },
                    { title: 'A need for differentiated policies', description: 'Each workload type should describe its own needs; the platform places resources.' },
                  ];
            })().map((challenge: any, index: number) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{challenge.title}</h3>
                    <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{challenge.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('cases.cetcCloud.solution.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              {t('cases.cetcCloud.solution.description')}
            </p>
          </motion.div>

          {/* Resource Contract */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 border border-gray-200 dark:border-gray-700 mb-8"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center mr-3">
                <Image src="/hami.svg" alt="HAMi" width={24} height={24} className="w-full h-auto" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t('cases.cetcCloud.solution.resourceContract.title')}
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{t('cases.cetcCloud.solution.resourceContract.description')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(function () {
                const features = t.raw('cases.cetcCloud.solution.resourceContract.features');
                return Array.isArray(features)
                  ? features
                  : ['Self-declared resources', 'Device-state-aware scheduling', 'Traceable scheduling results'];
              })().map((feature: string, index: number) => (
                <div key={index} className="bg-green-50 dark:bg-gray-800 p-4 rounded-lg border border-green-100 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{feature}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Workload Strategy */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 border border-gray-200 dark:border-gray-700 mb-8"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t('cases.cetcCloud.solution.workloadStrategy.title')}
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{t('cases.cetcCloud.solution.workloadStrategy.description')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(function () {
                const features = t.raw('cases.cetcCloud.solution.workloadStrategy.features');
                return Array.isArray(features)
                  ? features
                  : ['Stable online boundaries', 'Off-peak batch queues', 'Load-corrected configuration'];
              })().map((feature: string, index: number) => (
                <div key={index} className="bg-blue-50 dark:bg-gray-800 p-4 rounded-lg border border-blue-100 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{feature}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Dev Sharing */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/50 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {t('cases.cetcCloud.solution.devSharing.title')}
              </h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">{t('cases.cetcCloud.solution.devSharing.description')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(function () {
                const features = t.raw('cases.cetcCloud.solution.devSharing.features');
                return Array.isArray(features)
                  ? features
                  : ['Multiple Pods, one GPU', 'Same declarations as production', '30 concurrent dev Pods validated'];
              })().map((feature: string, index: number) => (
                <div key={index} className="bg-purple-50 dark:bg-gray-800 p-4 rounded-lg border border-purple-100 dark:border-gray-700">
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{feature}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {t('cases.cetcCloud.results.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('cases.cetcCloud.results.description')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto mb-12">
            {(function () {
              const resultItems = t.raw('cases.cetcCloud.results.items');
              return Array.isArray(resultItems)
                ? resultItems
                : [
                    { title: 'Dev Pod Capacity', value: '2 → 30', description: '15× the original capacity' },
                    { title: 'VRAM Reclaimed', value: '87.5%', description: '56 GB freed on one card' },
                    { title: 'Compute Reclaimed', value: '80%', description: 'Remaining compute schedulable' },
                    { title: 'Performance Impact', value: '< 5%', description: 'Throughput within 5% of exclusive use' },
                  ];
            })().map((item: any, index: number) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center"
              >
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">{item.title}</h3>
                <p className="text-2xl font-bold text-primary my-3">{item.value}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Embedding single-card comparison */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center">
              {t('cases.cetcCloud.results.table.title')}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
              {t('cases.cetcCloud.results.table.description')}
            </p>
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <table className="min-w-full bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {t('cases.cetcCloud.results.table.metricLabel')}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {t('cases.cetcCloud.results.table.withoutLabel')}
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-primary">
                      {t('cases.cetcCloud.results.table.withLabel')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {(function () {
                    const tableRows = t.raw('cases.cetcCloud.results.table.rows');
                    return Array.isArray(tableRows) ? tableRows : [];
                  })().map((row: { metric: string; without: string; with: string }, index: number) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-gray-50 dark:bg-gray-800/60' : ''}>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">{row.metric}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{row.without}</td>
                      <td className="px-6 py-4 text-sm text-primary font-medium">{row.with}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lessons */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 text-center">
              {t('cases.cetcCloud.lessons.title')}
            </h2>
            <div className="space-y-4">
              {(function () {
                const lessonPoints = t.raw('cases.cetcCloud.lessons.points');
                return Array.isArray(lessonPoints) ? lessonPoints : [];
              })().map((point: string, index: number) => (
                <div key={index} className="flex items-start bg-gray-50 dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex-shrink-0 mr-4">
                    <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Conclusion & CTA */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {t('cases.cetcCloud.conclusion.title')}
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
              {t('cases.cetcCloud.conclusion.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/Project-HAMi/HAMi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                {t('cases.cetcCloud.cta.exploreHami')}
              </a>
              <a
                href="mailto:info@dynamia.ai"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:bg-gray-900 transition-colors"
              >
                {t('cases.cetcCloud.cta.contactUs')}
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
};

export default CaseCetcCloud;
