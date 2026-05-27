'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Cog6ToothIcon, ShieldCheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

import {
  COOKIE_PREFERENCES_EVENT,
  CookieConsentPreferences,
  DEFAULT_COOKIE_CONSENT,
  createCookieConsentRecord,
  readCookieConsent,
  writeCookieConsent,
} from '@/lib/cookieConsent';

const configurableCategories: Array<Exclude<keyof CookieConsentPreferences, 'necessary'>> = [
  'analytics',
  'marketing',
  'functional',
];

const CookieConsentManager: React.FC = () => {
  const t = useTranslations();
  const locale = useLocale();
  const [mounted, setMounted] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<CookieConsentPreferences>(DEFAULT_COOKIE_CONSENT);

  const currentLocale = locale === 'zh' ? 'zh' : 'en';
  const cookiePolicyHref = currentLocale === 'zh' ? '/zh/cookies-policy' : '/cookies-policy';

  useEffect(() => {
    const existingConsent = readCookieConsent();
    setMounted(true);

    if (currentLocale === 'zh') return;

    if (existingConsent) {
      setPreferences({
        necessary: true,
        analytics: existingConsent.analytics,
        marketing: existingConsent.marketing,
        functional: existingConsent.functional,
      });
      return;
    }

    setShowBanner(true);
  }, [currentLocale]);

  useEffect(() => {
    const handleOpenPreferences = () => {
      const existingConsent = readCookieConsent();
      if (existingConsent) {
        setPreferences({
          necessary: true,
          analytics: existingConsent.analytics,
          marketing: existingConsent.marketing,
          functional: existingConsent.functional,
        });
      }

      setShowBanner(false);
      setShowPreferences(true);
    };

    window.addEventListener(COOKIE_PREFERENCES_EVENT, handleOpenPreferences);

    return () => {
      window.removeEventListener(COOKIE_PREFERENCES_EVENT, handleOpenPreferences);
    };
  }, []);

  const saveConsent = (nextPreferences: CookieConsentPreferences) => {
    writeCookieConsent(createCookieConsentRecord(nextPreferences));
    setPreferences(nextPreferences);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const acceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
    });
  };

  const rejectAll = () => {
    saveConsent(DEFAULT_COOKIE_CONSENT);
  };

  const savePreferences = () => {
    saveConsent({
      ...preferences,
      necessary: true,
    });
  };

  const updatePreference = (
    category: Exclude<keyof CookieConsentPreferences, 'necessary'>,
    enabled: boolean,
  ) => {
    setPreferences((currentPreferences) => ({
      ...currentPreferences,
      [category]: enabled,
    }));
  };

  if (!mounted) return null;

  return (
    <>
      {showBanner && !showPreferences && (
        <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="flex gap-4">
              <div className="hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary-light text-primary sm:flex">
                <ShieldCheckIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {t('cookieConsent.bannerTitle')}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {t('cookieConsent.bannerDescription')}{' '}
                  <Link href={cookiePolicyHref} className="font-medium text-primary hover:text-primary-dark">
                    {t('cookieConsent.cookiePolicy')}
                  </Link>
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => setShowPreferences(true)}
                className="inline-flex items-center justify-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
              >
                <Cog6ToothIcon className="h-4 w-4" />
                {t('cookieConsent.manage')}
              </button>
              <button
                type="button"
                onClick={rejectAll}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
              >
                {t('cookieConsent.reject')}
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
              >
                {t('cookieConsent.accept')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPreferences && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-gray-950/60 px-4 py-6 sm:items-center">
          <div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl dark:bg-gray-950">
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-5 dark:border-gray-800">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {t('cookieConsent.preferencesTitle')}
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                  {t('cookieConsent.preferencesDescription')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPreferences(false)}
                className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-200"
                aria-label={t('cookieConsent.close')}
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
              <div className="space-y-4">
                <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {t('cookieConsent.categories.necessary.title')}
                      </h3>
                      <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
                        {t('cookieConsent.categories.necessary.description')}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary-light px-3 py-1 text-xs font-medium text-primary">
                      {t('cookieConsent.alwaysOn')}
                    </span>
                  </div>
                </div>

                {configurableCategories.map((category) => (
                  <label
                    key={category}
                    className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-gray-200 p-4 transition-colors hover:border-gray-300 dark:border-gray-800 dark:hover:border-gray-700"
                  >
                    <span>
                      <span className="block text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {t(`cookieConsent.categories.${category}.title`)}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-gray-600 dark:text-gray-300">
                        {t(`cookieConsent.categories.${category}.description`)}
                      </span>
                    </span>
                    <input
                      type="checkbox"
                      checked={preferences[category]}
                      onChange={(event) => updatePreference(category, event.target.checked)}
                      className="mt-1 h-5 w-5 flex-shrink-0 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-gray-200 px-6 py-5 dark:border-gray-800 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={rejectAll}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-900"
              >
                {t('cookieConsent.reject')}
              </button>
              <button
                type="button"
                onClick={savePreferences}
                className="rounded-md border border-primary px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary-light"
              >
                {t('cookieConsent.save')}
              </button>
              <button
                type="button"
                onClick={acceptAll}
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-dark"
              >
                {t('cookieConsent.accept')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CookieConsentManager;
