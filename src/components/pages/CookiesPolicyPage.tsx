import {getTranslations} from 'next-intl/server';
import {DocumentTextIcon, CogIcon} from '@heroicons/react/24/outline';
import TextWithBreaks from '@/components/TextWithBreaks';

export default async function CookiesPolicyPage() {
  const t = await getTranslations('cookiesPolicy');
  const footer = await getTranslations('footer');
  const sections = t.raw('sections');
  const policySections = Array.isArray(sections) ? sections : [];

  return (
    <>
      <div className="bg-gradient-to-r from-primary-light to-primary-lighter py-10 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block p-3 bg-white dark:bg-gray-900 rounded-full mb-4">
            <CogIcon className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200 mb-2">{t('title')}</h1>
          <p className="text-gray-600 dark:text-gray-300">{t('lastUpdated')}</p>
        </div>
      </div>

      <main className="py-8 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800 p-8">
            <div className="prose prose-lg max-w-none">
              <div className="flex items-start mb-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                <DocumentTextIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 mr-3 flex-shrink-0 mt-1" />
                <div className="text-gray-700 dark:text-gray-300">
                  <TextWithBreaks text={t('intro')} />
                </div>
              </div>

              <div className="space-y-8">
                {(policySections as Array<{title: string; content: string}>).map((section, index) => (
                  <div key={index} className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">{section.title}</h2>
                    <div className="text-gray-700 dark:text-gray-300">
                      <TextWithBreaks text={section.content} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">{footer('copyright')}</p>
          </div>
        </div>
      </main>
    </>
  );
}
