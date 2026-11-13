'use client';

import {useEffect, useState} from 'react';
import Image from 'next/image';
import {useLocale, useTranslations} from 'next-intl';
import {localizedPath} from '@/utils/i18n';
import {websitePath} from '@/lib/site/links';

interface WhyTab {
  title: string;
  subtitle: string;
  description: string;
}

const FEATURE_TAB_IMAGES = [
  '/images/features/feature1.svg',
  '/images/features/feature2.svg',
  '/images/features/feature3.svg',
  '/images/features/feature4.svg',
  '/images/features/feature5.svg',
  '/images/features/feature6.svg',
] as const;

const FEATURE_AUTOPLAY_MS = 10000;
const FEATURE_PROGRESS_TICK_MS = 50;

export default function HomeWhySection() {
  const t = useTranslations('sitePages.home');
  const locale = useLocale();
  const tabs = (t.raw('why.tabs') as WhyTab[]) ?? [];
  const slides = tabs.slice(0, FEATURE_TAB_IMAGES.length).map((tab, index) => ({
    ...tab,
    image: FEATURE_TAB_IMAGES[index],
  }));

  const [activeTab, setActiveTab] = useState(0);
  const [featureProgress, setFeatureProgress] = useState(0);
  const [playedFeatureTabs, setPlayedFeatureTabs] = useState<number[]>([]);

  useEffect(() => {
    if (slides.length === 0) return;
    if (activeTab >= slides.length) {
      setActiveTab(0);
      setFeatureProgress(0);
      setPlayedFeatureTabs([]);
    }
  }, [activeTab, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const id = setTimeout(() => {
      setActiveTab((prev) => {
        const next = (prev + 1) % slides.length;
        setPlayedFeatureTabs((played) =>
          next === 0 ? [] : Array.from(new Set([...played, prev])),
        );
        setFeatureProgress(0);
        return next;
      });
    }, FEATURE_AUTOPLAY_MS);
    return () => clearTimeout(id);
  }, [activeTab, slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const startedAt = Date.now();
    const id = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      setFeatureProgress(Math.min((elapsed / FEATURE_AUTOPLAY_MS) * 100, 100));
    }, FEATURE_PROGRESS_TICK_MS);
    return () => clearInterval(id);
  }, [activeTab, slides.length]);

  if (!slides.length) return null;

  const active = slides[activeTab] ?? slides[0];

  return (
    <section className="why-main py-12 md:py-24" id="why-us">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="why-main-title font-bold">{t('why.title')}</h2>
        </div>

        <div className="mb-8 md:mb-12 px-2">
          <div className="flex items-center gap-2 md:gap-3" role="tablist" aria-label={t('why.title')}>
            {slides.map((tab, index) => {
              const isPlayed = playedFeatureTabs.includes(index);
              const isActive = activeTab === index;
              return (
                <button
                  key={tab.title}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={tab.title}
                  className="group cursor-pointer flex-1 py-1 touch-manipulation"
                  onClick={() => {
                    if (index === activeTab) return;
                    setActiveTab(index);
                    setFeatureProgress(0);
                    setPlayedFeatureTabs(
                      Array.from({length: index}, (_, playedIndex) => playedIndex),
                    );
                  }}
                >
                  <span
                    className={`why-main-track relative block h-1.5 w-full overflow-hidden rounded-full transition-colors duration-200 ${
                      isPlayed ? 'is-played' : ''
                    }`}
                  >
                    <span
                      className={`why-main-fill absolute left-0 top-0 h-full rounded-full transition-[width] duration-75 ease-linear ${
                        isPlayed ? 'is-played' : ''
                      }`}
                      style={{
                        width: isPlayed ? '100%' : isActive ? `${featureProgress}%` : '0%',
                      }}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-center">
          <div className="lg:col-span-2 flex justify-center">
            <div className="w-full">
              <div className="why-main-media rounded-xl border p-3 md:p-4 shadow-sm">
                <Image
                  src={active.image}
                  alt={active.title}
                  width={600}
                  height={400}
                  quality={90}
                  priority={activeTab === 0}
                  className="rounded-lg w-full h-auto"
                  style={{objectFit: 'contain'}}
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div key={activeTab} className="why-main-copy space-y-3 md:space-y-4">
              <h3 className="why-main-subtitle font-bold">{active.subtitle}</h3>
              <p className="why-main-body leading-relaxed">{active.description}</p>
              <div className="pt-2 md:pt-4">
                <a
                  href={localizedPath(websitePath('/products'), locale)}
                  className="why-main-cta group inline-flex items-center px-4 py-2 border border-primary text-sm font-medium rounded-md text-primary transition-colors duration-200 ease-out"
                >
                  {t('why.learnMore')}
                  <svg
                    aria-hidden="true"
                    className="h-4 w-4 ml-2 transition-transform duration-200 ease-out group-hover:translate-x-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
