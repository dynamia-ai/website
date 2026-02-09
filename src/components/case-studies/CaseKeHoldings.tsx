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

const CaseKeHoldings: React.FC = () => {
  const { t } = useTranslation();

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-white to-gray-50 pt-20 pb-12">
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
                <div className="w-24 h-24 bg-gray-50 rounded-lg border border-gray-200 shadow-sm flex items-center justify-center">
                  <Image
                    src="/logos/beike.png"
                    alt="Ke Holdings Logo"
                    width={80}
                    height={80}
                    className="w-full h-auto"
                  />
                </div>
                <div className="text-4xl text-gray-400">+</div>
                <div className="w-24 h-24 bg-white rounded-lg shadow-sm p-2 flex items-center justify-center">
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
            <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl mb-6">
              {t('caseStudiesPage.h1Prefix')}
              {t('cases.keHoldings.title')}
            </h1>
            <p className="mt-4 text-xl text-gray-600 leading-relaxed">
              {t('cases.keHoldings.subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(function() {
              const stats = t('cases.keHoldings.stats', { returnObjects: true });
              return Array.isArray(stats)
                ? stats
                : [
                    { value: '3x', label: 'GPU utilization improvement' },
                    { value: '10,000+', label: 'pods running simultaneously' },
                    { value: '10M+', label: 'daily requests processed' }
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
                <div className="text-4xl font-bold text-[#0FD05D] mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Company Overview */}
      <section className="py-16 bg-gray-50">
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
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                {t('cases.keHoldings.overview.title')}
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                {t('cases.keHoldings.overview.description')}
              </p>
              <div className="space-y-4">
                {(function() {
                  const keyPoints = t('cases.keHoldings.overview.keyPoints', { returnObjects: true });
                  return Array.isArray(keyPoints)
                    ? keyPoints
                    : ['中国领先的房产交易服务平台', '集中化机器学习平台', '跨业务单元的 AI 基础设施', '大规模 GPU 集群需求'];
                }()).map((point: string, index: number) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-6 w-6 text-[#0FD05D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="ml-3 text-base text-gray-600">{point}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center">
              <div className="w-full max-w-md bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-8">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-50 rounded-lg border border-gray-200 shadow-sm mx-auto mb-4 flex items-center justify-center">
                    <Image
                      src="/logos/beike.png"
                      alt="Ke Holdings Logo"
                      width={80}
                      height={80}
                      className="w-full h-auto"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t('cases.keHoldings.companyCard.name')}</h3>
                  <p className="text-gray-600 text-sm">{t('cases.keHoldings.companyCard.description')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Challenges */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('cases.keHoldings.challenge.title')}
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              {t('cases.keHoldings.challenge.description')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {(function() {
              const challenges = t('cases.keHoldings.challenge.points', { returnObjects: true });
              return Array.isArray(challenges)
                ? challenges
                : [
                    { title: 'Scale and Complexity', description: '5 clusters across public and private clouds, thousands of GPU cards' },
                    { title: 'Hybrid-cloud Environment', description: 'Managing GPU resources across multiple cloud providers' },
                    { title: 'Diverse Workload Requirements', description: 'Training vs inference with different resource needs' },
                    { title: 'Low GPU Utilization', description: 'Only 13% initial utilization rate' }
                  ];
            }()).map((challenge: any, index: number) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-gray-50 p-6 rounded-lg border border-gray-200"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{challenge.title}</h3>
                    <p className="text-gray-700 text-sm leading-relaxed">{challenge.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {t('cases.keHoldings.solution.title')}
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              {t('cases.keHoldings.solution.description')}
            </p>
            <p className="text-lg text-gray-700 font-medium">
              {t('cases.keHoldings.solution.platform')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(function() {
              const features = t('cases.keHoldings.solution.features', { returnObjects: true });
              return Array.isArray(features)
                ? features
                : [
                    { title: 'Multi-scenario Support', description: 'Supports inference, A/B testing, and training tasks on same infrastructure' },
                    { title: 'Advanced Optimization', description: 'Acceleration for inference frameworks, datasets, models, and fault tolerance' },
                    { title: 'Multi-framework Support', description: 'PyTorch, DeepSpeed, Megatron, VLLM, RLHF, SGLang' },
                    { title: 'AI Asset Management', description: 'Unified management of resource pools, models, images, queues, and monitoring' }
                  ];
            }()).map((feature: any, index: number) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white p-6 rounded-lg border border-green-100"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-8 h-8 bg-[#0FD05D] rounded-full flex items-center justify-center mr-4">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-gray-700 leading-relaxed text-sm">{feature.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Architecture */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="mt-12 bg-white rounded-lg p-8 border border-gray-200"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {t('cases.keHoldings.solution.architecture.title')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                  <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                  {t('cases.keHoldings.solution.architecture.gpuCluster.title')}
                </h4>
                <p className="text-gray-700 text-sm mb-3">{t('cases.keHoldings.solution.architecture.gpuCluster.description')}</p>
                <div className="space-y-2">
                  {(function() {
                    const gpuItems = t('cases.keHoldings.solution.architecture.gpuCluster.items', { returnObjects: true });
                    return Array.isArray(gpuItems)
                      ? gpuItems
                      : ['Native NVIDIA device plugin', 'High-performance GPUs (H200, H100)', 'Dedicated for LLM training', 'Full GPU resource allocation'];
                  }()).map((item: string, i: number) => (
                    <div key={i} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h4 className="font-bold text-gray-900 mb-3 flex items-center">
                  <svg className="w-6 h-6 text-green-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                  </svg>
                  {t('cases.keHoldings.solution.architecture.vgpuCluster.title')}
                </h4>
                <p className="text-gray-700 text-sm mb-3">{t('cases.keHoldings.solution.architecture.vgpuCluster.description')}</p>
                <div className="space-y-2">
                  {(function() {
                    const vgpuItems = t('cases.keHoldings.solution.architecture.vgpuCluster.items', { returnObjects: true });
                    return Array.isArray(vgpuItems)
                      ? vgpuItems
                      : ['HAMi GPU memory virtualization', 'GPUs (H20, V100, A100, 4090)', 'Fine-grained allocation (1-2GB)', 'Small model inference'];
                  }()).map((item: string, i: number) => (
                    <div key={i} className="flex items-center text-sm text-gray-600">
                      <svg className="w-4 h-4 text-green-600 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t('cases.keHoldings.results.title')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('cases.keHoldings.results.description')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {(function() {
              const resultItems = t('cases.keHoldings.results.items', { returnObjects: true });
              return Array.isArray(resultItems)
                ? resultItems
                : [
                    { title: "GPU Utilization", value: "13% → 37%", description: "Nearly 3x improvement" },
                    { title: "Platform Scale", value: "10,000+ pods", description: "Running simultaneously" },
                    { title: "Daily Requests", value: "10M+", description: "Processed per day" },
                    { title: "Cluster Coverage", value: "5 clusters", description: "Public and private cloud" },
                    { title: "Zero Downtime", value: "100%", description: "During transition and operation" },
                    { title: "Workload Types", value: "Unified", description: "Training and inference on same platform" }
                  ];
            }()).map((item: any, index: number) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-gray-50 p-6 rounded-lg border border-gray-200 text-center"
              >
                <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-2xl font-bold text-[#0FD05D] my-3">{item.value}</p>
                <p className="text-gray-600 text-sm">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HAMi Integration */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t('cases.keHoldings.hamiIntegration.title')}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {t('cases.keHoldings.hamiIntegration.description')}
            </p>
          </motion.div>

          <div className="space-y-6">
            {(function() {
              const points = t('cases.keHoldings.hamiIntegration.points', { returnObjects: true });
              return Array.isArray(points)
                ? points
                : [
                    'Kubernetes serves as the foundation for stable operations with robust scheduling',
                    'HAMi enables GPU multiplexing and heterogeneous scheduling optimization',
                    'Dual-cluster approach separates workloads based on resource requirements',
                    'Seamless integration between public and private cloud environments'
                  ];
            }()).map((point: string, index: number) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-white p-6 rounded-lg border-l-4 border-[#0FD05D]"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#0FD05D] rounded-full flex items-center justify-center mr-4 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{point}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Future Plans */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="max-w-4xl mx-auto mb-12 text-center"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t('cases.keHoldings.futurePlans.title')}
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              {t('cases.keHoldings.futurePlans.description')}
            </p>
          </motion.div>

          <div className="space-y-6 max-w-4xl mx-auto">
            {(function() {
              const plans = t('cases.keHoldings.futurePlans.plans', { returnObjects: true });
              return Array.isArray(plans)
                ? plans
                : [
                    'Adopting heterogeneous devices: Huawei Ascend and other non-NVIDIA accelerators',
                    'Cloud expansion: Integration with Alibaba Cloud',
                    'Advanced scheduling policies: network topology-awareness, card type specification, UUID-based allocation'
                  ];
            }()).map((plan: string, index: number) => (
              <motion.div
                key={index}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-green-200"
              >
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-6 h-6 bg-[#0FD05D] rounded-full flex items-center justify-center mr-4 mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{plan}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Conclusion & CTA */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              {t('cases.keHoldings.conclusion.title')}
            </h2>
            <p className="text-lg text-gray-700 mb-8">
              {t('cases.keHoldings.conclusion.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://github.com/Project-HAMi/HAMi"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#0FD05D] hover:bg-[#0AB04D] transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                {t('cases.keHoldings.cta.exploreHami')}
              </a>
              <a
                href="mailto:info@dynamia.ai"
                className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                {t('cases.keHoldings.cta.contactUs')}
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </MainLayout>
  );
};

export default CaseKeHoldings;
