'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/components/layout/MainLayout';

interface CaseStudyCard {
  slug: string;
  titleKey: string;
  subtitleKey: string;
  logos?: Array<{ src: string; alt: string; width: number; height: number }>;
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const CaseStudiesList: React.FC = () => {
  const { t } = useTranslation();
  const pathname = usePathname();
  const currentLocale = pathname?.startsWith('/zh') ? 'zh' : 'en';

  const cases: CaseStudyCard[] = [
    {
      slug: 'sf-technology-effective-gpu',
      titleKey: 'cases.sfTechnologyEffectiveGpu.title',
      subtitleKey: 'cases.sfTechnologyEffectiveGpu.subtitle',
      logos: [
        { src: '/sf-tech.svg', alt: 'SF Tech Logo', width: 40, height: 40 },
        { src: '/hami.svg', alt: 'HAMi Logo', width: 36, height: 36 },
      ],
    },
    {
      slug: 'prep-edu-hami',
      titleKey: 'cases.prepEduHami.title',
      subtitleKey: 'cases.prepEduHami.subtitle',
      logos: [
        { src: '/images/solutions/icons/prep-logo.svg', alt: 'PREP EDU Logo', width: 44, height: 44 },
        { src: '/hami.svg', alt: 'HAMi Logo', width: 36, height: 36 },
      ],
    },
    {
      slug: 'telecom-gpu',
      titleKey: 'cases.telecomGpu.title',
      subtitleKey: 'cases.telecomGpu.subtitle',
    },
  ];

  const basePath = currentLocale === 'zh' ? '/zh/case-studies' : '/case-studies';

  return (
    <MainLayout>
      <section className="bg-gradient-to-b from-white to-gray-50 pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
              {t('caseStudiesPage.title')}
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              {t('caseStudiesPage.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cases.map((item, index) => (
              <motion.article
                key={item.slug}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col p-6"
              >
                <div className="flex items-center gap-3 mb-4">
                  {item.logos ? (
                    <div className="flex items-center gap-3">
                      {item.logos.map((logo) => (
                        <div
                          key={logo.src}
                          className="w-12 h-12 bg-white rounded-lg border border-gray-100 flex items-center justify-center"
                        >
                          <Image
                            src={logo.src}
                            alt={logo.alt}
                            width={logo.width}
                            height={logo.height}
                            className="h-auto w-auto"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-primary-light flex items-center justify-center text-primary font-semibold">
                      {currentLocale === 'zh' ? '通信' : 'Tel'}
                    </div>
                  )}
                </div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  {t(item.titleKey)}
                </h2>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                  {t(item.subtitleKey)}
                </p>
                <div className="mt-auto">
                  <Link
                    href={`${basePath}/${item.slug}`}
                    className="text-primary hover:text-primary-dark font-medium"
                  >
                    {t('caseStudiesPage.cardButton')} →
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              {t('caseStudiesPage.cta.title')}
            </h2>
            <p className="text-gray-600 mb-8">
              {t('caseStudiesPage.cta.description')}
            </p>
            <Link
              href={currentLocale === 'zh' ? '/zh/request-demo' : '/request-demo'}
              className="inline-flex items-center px-6 py-3 rounded-md bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
            >
              {t('caseStudiesPage.cta.button')}
            </Link>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default CaseStudiesList;
