import Link from 'next/link';
import {getLocale, getTranslations} from 'next-intl/server';
import {localizedPath} from '@/utils/i18n';

export default async function SolutionsPage() {
  const t = await getTranslations('solutions');
  const nav = await getTranslations('navigation');
  const locale = await getLocale();

  const categoriesData = t.raw('categories');
  const categories: {title: string; description: string}[] = Object.values(categoriesData);

  return (
    <div className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 sm:text-4xl">{t('title')}</h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 sm:mt-4">{t('subtitle')}</p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {categories.map((category) => (
              <div key={category.title} className="bg-white dark:bg-gray-900 overflow-hidden shadow rounded-lg">
                <div className="h-48 bg-primary-light flex items-center justify-center">
                  <div className="w-24 h-24 bg-primary-light rounded-full flex items-center justify-center">
                    <span className="text-primary font-bold">{category.title.split('/')[0]}</span>
                  </div>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{category.title}</h3>
                  <p className="mt-2 text-base text-gray-500 dark:text-gray-400">{category.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 bg-primary-lighter rounded-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('customSolutions.title')}</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">{t('customSolutions.description')}</p>
              <Link
                href={localizedPath('/apply-trial', locale)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
              >
                {t('customSolutions.contactButton')}
              </Link>
            </div>
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">{t('successStories.title')}</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">{t('successStories.subtitle')}</p>
              <Link
                href={localizedPath('/case-studies', locale)}
                className="text-primary hover:text-primary-dark font-medium"
              >
                {t('successStories.viewAllButton')} &rarr;
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">{t('readyForChallenge')}</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href={localizedPath('/apply-trial', locale)}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark transition-colors"
            >
              {nav('freeTrial')}
            </Link>
            <Link
              href={localizedPath('/apply-trial', locale)}
              className="inline-flex items-center px-6 py-3 border border-primary text-base font-medium rounded-md text-primary bg-white dark:bg-gray-900 hover:bg-gray-50 transition-colors"
            >
              {nav('freeTrial')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
