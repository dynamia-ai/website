'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

export const BAIDU_SITE_ID = '5d906d6f1be2a5ded78abf0091e45a05';
const SCRIPT_ID = 'baidu-analytics';

declare global {
  interface Window {
    _hmt?: { push: (command: unknown[]) => unknown };
  }
}

interface BaiduAnalyticsProps {
  enabled: boolean;
}

export default function BaiduAnalytics({ enabled }: BaiduAnalyticsProps) {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!enabled) {
      if (started.current) {
        // A loaded vendor script keeps listeners alive. Reload after the saved
        // consent change to fully stop collection, not just remove its tag.
        document.cookie.split(';').forEach((cookie) => {
          const name = cookie.trim().split('=')[0];
          if (!name.startsWith('Hm_') && !name.startsWith('HMACCOUNT')) return;
          const parts = window.location.hostname.split('.');
          const domains = ['', ...parts.map((_, index) => parts.slice(index).join('.'))];
          domains.forEach((domain) => {
            const suffix = domain ? `; domain=${domain}` : '';
            document.cookie = `${name}=; path=/; max-age=0${suffix}`;
            if (domain) document.cookie = `${name}=; path=/; max-age=0; domain=.${domain}`;
          });
        });
        window.location.reload();
      }
      return;
    }

    window._hmt = window._hmt || ([] as unknown[][]);
    if (!started.current) {
      // Manual pageviews cover Next.js navigation without counting the first
      // page twice. Query strings are excluded from reported page names.
      window._hmt.push(['_setAutoPageview', false]);
      started.current = true;
    }
    if (pathname && lastPath.current !== pathname) {
      window._hmt.push(['_trackPageview', pathname]);
      lastPath.current = pathname;
    }
    if (!document.getElementById(SCRIPT_ID)) {
      const script = document.createElement('script');
      script.id = SCRIPT_ID;
      script.async = true;
      script.src = `https://hm.baidu.com/hm.js?${BAIDU_SITE_ID}`;
      document.head.appendChild(script);
    }
  }, [enabled, pathname]);

  return null;
}
