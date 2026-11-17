'use client';

import {useTranslations} from 'next-intl';

export default function BackToTop() {
  const t = useTranslations('siteShell');

  return (
    <button
      className="top-btn"
      type="button"
      aria-label={t('backToTop')}
      onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
    >
      {t('backToTopIcon')}
    </button>
  );
}
