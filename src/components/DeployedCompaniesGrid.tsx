'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';

export interface DeployedCompany {
  id: string;
  name: string;
  logo: string | Partial<Record<string, string>>;
}

/** Production-deployed customer logos — edit here to update home + enterprise pages. */
export const DEPLOYED_COMPANIES: DeployedCompany[] = [
  { id: 'sf-tech', name: 'SF Technology', logo: '/logos/company8.svg' },
  { id: '4paradigm', name: '4Paradigm', logo: '/logos/company6.png' },
  { id: 'daocloud', name: 'DaoCloud', logo: '/logos/company7.png' },
  { id: 'cloudpilot', name: 'CloudPilot AI', logo: '/logos/company9.svg' },
  { id: 'opencsg', name: 'OpenCSG', logo: '/logos/opencsg.svg' },
  {
    id: 'intsig',
    name: 'IntSig',
    logo: { zh: '/logos/intsig-zh.png', en: '/logos/intsig-en.png', de: '/logos/intsig-en.png' },
  },
];

export function resolveCompanyLogo(company: DeployedCompany, locale: string): string {
  if (typeof company.logo === 'string') return company.logo;
  return company.logo[locale] ?? company.logo.en ?? Object.values(company.logo)[0] ?? '';
}

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

interface DeployedCompaniesGridProps {
  variant?: 'home' | 'enterprise';
  className?: string;
}

export default function DeployedCompaniesGrid({
  variant = 'enterprise',
  className,
}: DeployedCompaniesGridProps) {
  const locale = useLocale();
  const isHome = variant === 'home';

  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto',
        isHome && 'md:gap-8',
        className,
      )}
    >
      {DEPLOYED_COMPANIES.map((company, index) => {
        const cardClassName = cn(
          'flex items-center justify-center bg-white dark:bg-gray-900 rounded-lg p-3',
          isHome ? 'h-16 md:h-20 shadow-sm md:p-4' : 'h-16 border border-gray-100 dark:border-gray-800 shadow-sm',
        );

        const logo = (
          <div className="w-full h-full rounded-md flex items-center justify-center dark:bg-white/95 dark:px-3 dark:py-2 dark:shadow-sm">
            <Image
              src={resolveCompanyLogo(company, locale)}
              alt={company.name}
              width={200}
              height={40}
              className={cn(
                'object-contain w-auto',
                isHome ? 'max-h-12 md:max-h-14' : 'max-h-10',
              )}
            />
          </div>
        );

        if (isHome) {
          return (
            <motion.div
              key={company.id}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={cardClassName}
            >
              {logo}
            </motion.div>
          );
        }

        return (
          <div key={company.id} className={cardClassName}>
            {logo}
          </div>
        );
      })}
    </div>
  );
}
