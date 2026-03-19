'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import MainLayout from '@/components/layout/MainLayout';

// Animation configurations
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

const CaseNio: React.FC = () => {
  const { t } = useTranslation();

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
                <div className="w-24 h-24 bg-gray-50 dark:bg-white/95 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm flex items-center justify-center">
                  <Image
                    src="/images/case-studies/icons/nio.svg"
                    alt="NIO Logo"
                    width={80}
                    height={80}
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
              {t('cases.nio.title')}
            </h1>
            <p className="mt-4 text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              {t('cases.nio.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(function() {
              const stats = t('cases.nio.stats', { returnObjects: true });
              return Array.isArray(stats)
                ? stats
                : [
                    { value: '600', label: 'GPUs across ~80 nodes' },
                    { value: '10×', label: 'GPU utilization improvement in CI' },
                    { value: '30%', label: 'reduction in GPU hours for simulation' }
                  ];
            }()).map((stat: any, index: number) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-[#76b900] mb-2">{stat.value}</div>
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
                {t('cases.nio.overview.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                {t('cases.nio.overview.description')}
              </p>
              <div className="space-y-4">
                {(function() {
                  const keyPoints = t('cases.nio.overview.keyPoints', { returnObjects: true });
                  return Array.isArray(keyPoints)
                    ? keyPoints
                    : [
                        'Large-scale GPU cluster: 600 GPUs across ~80 nodes',
                        'Diverse autonomous driving workloads: training, simulation, CI/testing, inference',
                        'Focus on GPU performance optimization and resource planning',
                        'Hybrid GPU sharing strategy for different workload types'
                      ];
                }()).map((point: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-[#76b900]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                  <div className="w-20 h-20 bg-gray-50 dark:bg-white/95 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm mx-auto mb-4 flex items-center justify-center">
                    <Image
                      src="/images/case-studies/icons/nio.svg"
                      alt="NIO Logo"
                      width={80}
                      height={80}
                      className="w-full h-auto"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{t('cases.nio.companyCard.name')}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{t('cases.nio.companyCard.description')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Challenges */}
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
              {t('cases.nio.challenge.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
              {t('cases.nio.challenge.description')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto dark:[&>*]:bg-gray-800 dark:[&>*]:border-gray-700">
            {(function() {
              const challenges = t('cases.nio.challenge.points', { returnObjects: true });
              return Array.isArray(challenges)
                ? challenges
                : [
                    { title: 'CI and Testing Tasks', description: 'Most execution time spent on CPU-intensive operations with 5–10% GPU utilization' },
                    { title: 'Simulation Workloads', description: 'Low compute requirements suitable for concurrent execution on shared GPUs' },
                    { title: 'Online Inference', description: 'Many services require only ¼ or ½ of a GPU' },
                    { title: 'Limited GPU Cluster', description: 'Time-based billing from public cloud providers makes low utilization costly' }
                  ];
            }()).map((challenge: any, index: number) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
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

      {/* Solution - Approaches */}
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
              {t('cases.nio.solution.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-4">
              {t('cases.nio.solution.description')}
            </p>
          </motion.div>

          {/* Evaluated Approaches */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
              {t('cases.nio.solution.approaches.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {(function() {
                const approaches = t('cases.nio.solution.approaches.items', { returnObjects: true });
                return Array.isArray(approaches)
                  ? approaches
                  : [
                      { title: 'NVIDIA MIG', description: 'Strong isolation but predefined partition sizes' },
                      { title: 'Time-Slicing', description: 'Minimal overhead but lacks strict limits' },
                      { title: 'HAMi (CNCF Sandbox)', description: 'Fine-grained control over memory and compute' }
                    ];
              }()).map((approach: any, index: number) => (
                <motion.div
                  key={index}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  variants={fadeIn}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className={`p-6 rounded-lg border ${
                    index === 2
                      ? 'bg-green-50 border-green-200 dark:bg-gray-800 dark:border-green-700'
                      : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                  }`}
                >
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{approach.title}</h4>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">{approach.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Production Strategy */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700 max-w-6xl mx-auto"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('cases.nio.solution.productionStrategy.title')}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              {t('cases.nio.solution.productionStrategy.description')}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(function() {
                const items = t('cases.nio.solution.productionStrategy.items', { returnObjects: true });
                return Array.isArray(items)
                  ? items
                  : [
                      'MIG: Algorithm development and strong isolation environments',
                      'HAMi: CI tasks and selected inference and simulation workloads',
                      'Time-slicing: Workloads that can tolerate resource contention'
                    ];
              }()).map((item: string, index: number) => (
                <div
                  key={index}
                  className="bg-blue-50 dark:bg-gray-700 p-4 rounded-lg border border-blue-100 dark:border-gray-600"
                >
                  <p className="text-gray-900 dark:text-gray-100 text-sm font-medium">{item}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Implementation Details */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 rounded-lg p-8 border border-green-200 dark:border-gray-700 max-w-6xl mx-auto"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {t('cases.nio.solution.implementation.title')}
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4 font-semibold">
              {t('cases.nio.solution.implementation.scale')}
            </p>
            <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
              <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">
                {t('cases.nio.solution.implementation.resourceDesign.title')}
              </h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-3">
                {t('cases.nio.solution.implementation.resourceDesign.description')}
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-xs italic">
                {t('cases.nio.solution.implementation.resourceDesign.insight')}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results */}
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
              {t('cases.nio.results.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('cases.nio.results.description')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {(function() {
              const resultItems = t('cases.nio.results.items', { returnObjects: true });
              return Array.isArray(resultItems)
                ? resultItems
                : [
                    { title: "CI Workloads Utilization", value: "5% → 30-50%", description: "4× improvement in CI pipelines" },
                    { title: "Simulation GPU Hours", value: "-30%", description: "Reduction in GPU hours" },
                    { title: "Simulation Task Duration", value: "3 days → 2 days", description: "End-to-end time reduction" },
                    { title: "Deployment Scale", value: "400-560 GPUs", description: "Across 50-70 nodes using HAMi" },
                    { title: "Total Infrastructure", value: "600 GPUs", description: "Across ~80 nodes" },
                    { title: "Strategy", value: "Hybrid", description: "HAMi + MIG + Time-slicing" }
                  ];
            }()).map((item: any, index: number) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 text-center"
              >
                <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-2">{item.title}</h3>
                <p className="text-2xl font-bold text-[#76b900] my-3">{item.value}</p>
                <p className="text-gray-600 dark:text-gray-300 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Lessons Learned */}
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
              {t('cases.nio.lessonsLearned.title')}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {t('cases.nio.lessonsLearned.description')}
            </p>
          </motion.div>

          <div className="space-y-6 max-w-5xl mx-auto">
            {(function() {
              const lessons = t('cases.nio.lessonsLearned.points', { returnObjects: true });
              return Array.isArray(lessons)
                ? lessons
                : [
                    { title: 'GPU Partitioning Optimization', description: 'Each workload has an optimal partition size. Over-fragmentation can reduce efficiency.' },
                    { title: 'Performance Validation', description: 'Version upgrades require performance validation with phased upgrade strategy.' },
                    { title: 'Production Safety', description: 'Device plugin upgrades follow blue–green deployment process for online inference.' },
                    { title: 'Toolchain Compatibility', description: 'Certain compiler features may conflict with GPU interception mechanisms.' }
                  ];
            }()).map((lesson: any, index: number) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg border-l-4 border-[#76b900] shadow-sm"
              >
                <h4 className="font-bold text-gray-900 dark:text-gray-100 mb-2">{lesson.title}</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm">{lesson.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Quote */}
      <section className="py-16 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto text-center"
          >
            <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 p-8 rounded-2xl border border-green-100 dark:border-gray-700">
              <svg className="w-12 h-12 text-[#76b900] mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
              </svg>
              <blockquote className="text-xl italic text-gray-700 dark:text-gray-300 mb-6">
                &ldquo;{t('cases.nio.quote.text')}&rdquo;
              </blockquote>
              <div className="text-center">
                <div className="font-bold text-gray-900 dark:text-gray-100">{t('cases.nio.quote.author')}</div>
              </div>
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
              {t('cases.nio.conclusion.title')}
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
              {t('cases.nio.conclusion.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/Project-HAMi/HAMi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#76b900] hover:bg-[#0AB04D] transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                {t('cases.nio.cta.exploreHami')}
              </a>
              <a
                href="mailto:info@dynamia.ai"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:bg-gray-900 transition-colors"
              >
                {t('cases.nio.cta.contactUs')}
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
};

export default CaseNio;
