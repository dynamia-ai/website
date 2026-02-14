'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faLinkedin, faRedditAlien, faWhatsapp, faXTwitter } from '@fortawesome/free-brands-svg-icons';

interface BlogShareSectionProps {
  title: string;
  url: string;
}

export default function BlogShareSection({ title, url }: BlogShareSectionProps) {
  const { t } = useTranslation();
  const [fullUrl, setFullUrl] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;
      setFullUrl(currentUrl);
    }
  }, []);

  const displayUrl = fullUrl || (typeof window !== 'undefined' ? window.location.href : url);
  const encodedUrl = encodeURIComponent(displayUrl);
  const encodedTitle = encodeURIComponent(title);

  // Social platforms
  const socialPlatforms = [
    {
      key: 'x',
      icon: faXTwitter,
      label: 'X',
      hoverColors: 'hover:border-gray-800 hover:bg-gray-50 dark:bg-gray-900 hover:text-gray-800 dark:text-gray-200',
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`
    },
    {
      key: 'whatsapp',
      icon: faWhatsapp,
      label: 'WhatsApp',
      hoverColors: 'hover:border-green-600 hover:bg-green-50 hover:text-green-700',
      url: `https://wa.me/?text=${encodedTitle}+${encodedUrl}`
    },
    {
      key: 'linkedin',
      icon: faLinkedin,
      label: 'LinkedIn',
      hoverColors: 'hover:border-blue-600 hover:bg-blue-50 hover:text-blue-700',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`
    },
    {
      key: 'reddit',
      icon: faRedditAlien,
      label: 'Reddit',
      hoverColors: 'hover:border-orange-600 hover:bg-orange-50 hover:text-orange-700',
      url: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`
    },
    {
      key: 'facebook',
      icon: faFacebookF,
      label: 'Facebook',
      hoverColors: 'hover:border-blue-700 hover:bg-blue-50 hover:text-blue-700',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
    }
  ];

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-6 shadow-sm">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="text-gray-600 dark:text-gray-300">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{t('resources.blog.aiShare.shareTitle')}</h4>
      </div>
      <div className="flex flex-wrap gap-2.5">
        {socialPlatforms.map((platform) => (
          <button
            key={platform.key}
            onClick={() => window.open(platform.url, '_blank', 'noopener,noreferrer')}
            className={`group inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 transition-all duration-200 ${platform.hoverColors} hover:shadow-sm hover:-translate-y-0.5`}
          >
            <FontAwesomeIcon
              icon={platform.icon}
              className="h-4 w-4 transition-transform duration-200 group-hover:scale-110"
            />
            {platform.label}
          </button>
        ))}
      </div>
    </div>
  );
}
