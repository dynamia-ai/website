'use client';

import {useState} from 'react';
import {useTranslations} from 'next-intl';

interface ArticleCopyLinkProps {
  url: string;
}

export default function ArticleCopyLink({url}: ArticleCopyLinkProps) {
  const t = useTranslations('sitePages.blog');
  const [status, setStatus] = useState('');

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setStatus(t('detail.linkCopied'));
    } catch {
      setStatus(t('detail.copyFailed'));
    }
    window.setTimeout(() => setStatus(''), 2000);
  }

  return (
    <div className="article-share">
      <button type="button" onClick={onCopy} aria-label={t('detail.copyLink')}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <rect x="8" y="8" width="12" height="13" rx="2" />
          <path d="M16 8V3H3v13h5" />
        </svg>
        {t('detail.copyLink')}
      </button>
      <span className="article-share-status" role="status" aria-live="polite">
        {status}
      </span>
    </div>
  );
}
