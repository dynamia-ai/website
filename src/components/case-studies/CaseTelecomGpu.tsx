'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import { localizedPath } from '@/utils/i18n';
import MainLayout from '@/components/layout/MainLayout';

// 动画配置
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

interface ResultItem {title: string; value: string; description: string}
function localizedList<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  return value && typeof value === 'object' ? Object.values(value) as T[] : [];
}

const CaseTelecomGpu: React.FC = () => {
  const t = useTranslations();
  const locale = useLocale();

  return (
    <MainLayout>
      {/* 案例标题区域 */}
      <section className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 pt-20 pb-12 transition-colors duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 sm:text-5xl mb-6">
              {t('caseStudiesPage.h1Prefix')}
              {t('cases.telecomGpu.title')}
            </h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              {t('cases.telecomGpu.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* 案例概览 */}
      <section className="py-16 bg-white dark:bg-gray-900">
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
                {t('cases.telecomGpu.overview.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                {t('cases.telecomGpu.overview.description')}
              </p>
              <div className="space-y-4">
                {localizedList<string>(t.raw('cases.telecomGpu.overview.keyPoints')).map((point: string, index: number) => (
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
              <Image
                src={t('cases.telecomGpu.overview.image')}
                alt="Telecom GPU Virtualization"
                width={540}
                height={360}
                className="rounded-lg shadow-lg object-cover bg-white dark:bg-white/95 border border-gray-200 dark:border-gray-700 p-2"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* 挑战与解决方案 */}
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
              {t('cases.telecomGpu.challenge.title')}
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* 挑战 */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t('cases.telecomGpu.challenge.subtitle')}
              </h3>
              <ul className="space-y-4 text-gray-600 dark:text-gray-300">
                {localizedList<string>(t.raw('cases.telecomGpu.challenge.points')).map((challenge: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 text-red-500 mr-2">&#8226;</div>
                    <p>{challenge}</p>
                  </li>
                ))}
              </ul>
            </motion.div>
            
            {/* 解决方案 */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {t('cases.telecomGpu.solution.subtitle')}
              </h3>
              <ul className="space-y-4 text-gray-600 dark:text-gray-300">
                {localizedList<string>(t.raw('cases.telecomGpu.solution.points')).map((solution: string, index: number) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 text-green-500 mr-2">&#8226;</div>
                    <p>{solution}</p>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 架构图 */}
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
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {t('cases.telecomGpu.architecture.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('cases.telecomGpu.architecture.description')}
            </p>
          </motion.div>
          
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex justify-center"
          >
            <Image
              src={t('cases.telecomGpu.architecture.image')}
              alt="Architecture Diagram"
              width={900}
              height={500}
              className="rounded-lg shadow-lg object-contain bg-white dark:bg-white/95 border border-gray-200 dark:border-gray-700 p-2"
            />
          </motion.div>
        </div>
      </section>

      {/* 实施成果 */}
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
              {t('cases.telecomGpu.results.title')}
            </h2>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* 成果卡片 */}
            {localizedList<ResultItem>(t.raw('cases.telecomGpu.results.items')).map((item: ResultItem, index: number) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center"
              >
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{item.title}</h3>
                <p className="text-4xl font-bold text-primary my-4">{item.value}</p>
                <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 联系我们 */}
      <section className="py-16 bg-primary-light">
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
              {t('cases.telecomGpu.cta.title')}
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
              {t('cases.telecomGpu.cta.description')}
            </p>
            <a
              href={localizedPath('/apply-trial', locale)}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary hover:bg-primary-dark"
            >
              {t('cases.telecomGpu.cta.button')}
            </a>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
};

export default CaseTelecomGpu;
