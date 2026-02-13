"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/components/layout/MainLayout';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function Solutions() {
  const { t } = useTranslation();
  const pathname = usePathname();
  const currentLocale = pathname?.startsWith('/zh') ? 'zh' : 'en';
  
  const categoriesData = t('solutions.categories', { returnObjects: true });
  const categories = Array.isArray(categoriesData)
    ? categoriesData
    : [
        {
          title: "人工智能/机器学习",
          description: "优化您的机器学习基础设施，加速训练和推理",
          learnMore: "了解更多"
        },
        {
          title: "高性能计算",
          description: "高效扩展您的高性能计算工作负载",
          learnMore: "了解更多"
        },
        {
          title: "边缘计算",
          description: "通过优化的资源分配将您的计算能力扩展到边缘",
          learnMore: "了解更多"
        }
      ];

  return (
    <MainLayout>
      <div className="py-16 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 sm:text-4xl">
              {t('solutions.title')}
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 dark:text-gray-500 sm:mt-4">
              {t('solutions.subtitle')}
            </p>
          </div>

          <div className="mt-16">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
              {categories.map((category, index) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  variants={fadeIn}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg"
                >
                  <div className="h-48 bg-primary-light flex items-center justify-center">
                    <div className="w-24 h-24 bg-primary-light rounded-full flex items-center justify-center">
                      <span className="text-primary font-bold">{category.title.split('/')[0]}</span>
                    </div>
                  </div>
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{category.title}</h3>
                    <p className="mt-2 text-base text-gray-500 dark:text-gray-400 dark:text-gray-500">{category.description}</p>
                    <div className="mt-4">
                      <Link
                        href={`/solutions/${category.title.toLowerCase().replace(/\//g, '-')}`}
                        className="text-primary hover:text-primary-dark font-medium"
                      >
                        {category.learnMore} &rarr;
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="mt-16 bg-primary-lighter rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('solutions.customSolutions.title')}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  {t('solutions.customSolutions.description')}
                </p>
                <Link
                  href="/contact"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
                >
                  {t('solutions.customSolutions.contactButton')}
                </Link>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('solutions.successStories.title')}</h3>
                <p className="text-gray-500 dark:text-gray-400 dark:text-gray-500 mb-6">{t('solutions.successStories.subtitle')}</p>
                <Link
                  href={currentLocale === 'zh' ? '/zh/case-studies' : '/case-studies'}
                  className="text-primary hover:text-primary-dark font-medium"
                >
                  {t('solutions.successStories.viewAllButton')} &rarr;
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              {t('solutions.readyForChallenge')}
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/apply-trial"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark transition-colors"
              >
                {t('navigation.freeTrial')}
              </Link>
              <Link
                href="/request-demo"
                className="inline-flex items-center px-6 py-3 border border-primary text-base font-medium rounded-md text-primary bg-white dark:bg-gray-900 hover:bg-gray-50 dark:bg-gray-900 transition-colors"
              >
                {t('navigation.requestDemo')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 
