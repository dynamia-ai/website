'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

import {
  COOKIE_CONSENT_EVENT,
  CookieConsentRecord,
  readCookieConsent,
} from '@/lib/cookieConsent';

const GA_MEASUREMENT_ID = 'G-HHZL7ECT9C';

const ConsentAwareAnalytics: React.FC = () => {
  const [consent, setConsent] = useState<CookieConsentRecord | null>(null);

  useEffect(() => {
    setConsent(readCookieConsent());

    const handleConsentUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<CookieConsentRecord>;
      setConsent(customEvent.detail);
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsentUpdated);

    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsentUpdated);
    };
  }, []);

  if (!consent?.analytics) return null;

  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_MEASUREMENT_ID}');
        `}
      </Script>
      <SpeedInsights />
      <Analytics />
    </>
  );
};

export default ConsentAwareAnalytics;
