'use client';

import {useEffect, useState} from 'react';
import Image from 'next/image';
import {useLocale, useTranslations} from 'next-intl';
import SiteArrow from '@/components/layout/SiteArrow';
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
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
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
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setFeatureProgress(100);
      return;
    }
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
    <section className="why-main" id="why-us">
      <div className="wrap why-main-inner">
        <div className="why-main-heading">
          <h2 className="why-main-title">{t('why.title')}</h2>
        </div>

        <div className="why-main-tabs" role="tablist" aria-label={t('why.title')}>
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
                className="why-main-tab"
                onClick={() => {
                  if (index === activeTab) return;
                  setActiveTab(index);
                  setFeatureProgress(0);
                  setPlayedFeatureTabs(
                    Array.from({length: index}, (_, playedIndex) => playedIndex),
                  );
                }}
              >
                <span className={`why-main-track${isPlayed ? ' is-played' : ''}`}>
                  <span
                    className={`why-main-fill${isPlayed ? ' is-played' : ''}`}
                    style={{
                      width: isPlayed ? '100%' : isActive ? `${featureProgress}%` : '0%',
                    }}
                  />
                </span>
              </button>
            );
          })}
        </div>

        <div className="why-main-layout">
          <div className="why-main-media-col">
            <div className="why-main-media">
              <Image
                src={active.image}
                alt={active.title}
                width={600}
                height={400}
                quality={90}
                priority={activeTab === 0}
                className="why-main-image"
              />
            </div>
          </div>

          <div className="why-main-copy-col">
            <div key={activeTab} className="why-main-copy">
              <h3 className="why-main-subtitle">{active.subtitle}</h3>
              <p className="why-main-body">{active.description}</p>
              <div className="why-main-actions">
                <a
                  href={localizedPath(websitePath('/products'), locale)}
                  className="why-main-cta"
                >
                  {t('why.learnMore')}
                  <SiteArrow variant="button" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
