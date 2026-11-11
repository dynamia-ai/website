'use client';

import {useEffect, useRef} from 'react';
import {useTranslations} from 'next-intl';
import {HamiLiveStat} from '@/components/layout/HamiLiveStats';

export default function HomeCommunityMetrics() {
  const t = useTranslations('sitePages.home');
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      root.querySelectorAll<HTMLElement>('.community-number-row').forEach((row) => {
        const rect = row.getBoundingClientRect();
        const center = rect.top + rect.height / 2;
        const progress = Math.max(
          0,
          Math.min(1, (window.innerHeight * 0.58 - center) / (window.innerHeight * 0.1)),
        );
        row.style.setProperty('--lit-opacity', progress.toFixed(3));
        row.style.setProperty('--row-opacity', (0.25 + 0.75 * progress).toFixed(3));
        row.classList.toggle('is-lit', progress >= 0.99);
      });
    };
    const queue = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    queue();
    window.addEventListener('scroll', queue, {passive: true});
    window.addEventListener('resize', queue);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener('scroll', queue);
      window.removeEventListener('resize', queue);
    };
  }, []);

  const placeholder = t('ui.emDash');

  return (
    <div className="community-metrics" ref={rootRef}>
      <div className="community-number-row">
        <div className="community-metric-label">
          <svg viewBox="0 0 24 24" aria-hidden={true}><path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1-5.4-2.9-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"></path></svg>
          <span>{t('community.metrics.githubStars')}</span>
        </div>
        <div className="community-number">
          <HamiLiveStat kind="stars" placeholder={placeholder} />
          <HamiLiveStat kind="stars" placeholder={placeholder} className="lit-number" aria-hidden={true} />
        </div>
      </div>
      <div className="community-number-row">
        <div className="community-metric-label">
          <svg viewBox="0 0 24 24" aria-hidden={true}>
            <circle cx="9" cy="7" r="3"></circle>
            <path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v3"></path>
          </svg>
          <span>{t('community.metrics.contributors')}</span>
        </div>
        <div className="community-number">
          <HamiLiveStat kind="contributors" placeholder={placeholder} />
          <HamiLiveStat kind="contributors" placeholder={placeholder} className="lit-number" aria-hidden={true} />
        </div>
      </div>
      <div className="community-number-row">
        <div className="community-metric-label">
          <svg viewBox="0 0 24 24" aria-hidden={true}><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"></path></svg>
          <span>{t('community.metrics.installations')}</span>
        </div>
        <div className="community-number">
          <HamiLiveStat kind="pulls" placeholder={placeholder} />
          <HamiLiveStat kind="pulls" placeholder={placeholder} className="lit-number" aria-hidden={true} />
        </div>
      </div>
      <div className="community-number-row">
        <div className="community-metric-label">
          <svg viewBox="0 0 24 24" aria-hidden={true}>
            <rect x="3" y="4" width="18" height="16" rx="2"></rect>
            <path d="M7 8h4M7 12h4m3 3 2 2 4-4"></path>
          </svg>
          <span>{t('community.metrics.adopters')}</span>
        </div>
        <div className="community-number">
          <span>{t('community.metrics.adoptersValue')}</span>
          <span className="lit-number" aria-hidden={true}>{t('community.metrics.adoptersValue')}</span>
        </div>
      </div>
    </div>
  );
}
