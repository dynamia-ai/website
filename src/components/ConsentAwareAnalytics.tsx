'use client';

import React, { useEffect } from 'react';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

import {
  COOKIE_CONSENT_EVENT,
  CookieConsentRecord,
  readCookieConsent,
} from '@/lib/cookieConsent';

const GA_MEASUREMENT_ID = 'G-HHZL7ECT9C';

function updateGtagConsent(consent: CookieConsentRecord | null, isZh: boolean) {
  if (typeof window === 'undefined') return;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  function gtag(...args: unknown[]) { w.dataLayer.push(args); }

  const analyticsGranted = isZh || (consent?.analytics ?? false);

  gtag('consent', 'update', {
    'analytics_storage': analyticsGranted ? 'granted' : 'denied',
    'ad_storage': (consent?.marketing ?? false) ? 'granted' : 'denied',
    'functionality_storage': (consent?.functional ?? false) ? 'granted' : 'denied',
    'personalization_storage': (consent?.functional ?? false) ? 'granted' : 'denied',
  });
}

const ConsentAwareAnalytics: React.FC = () => {
  useEffect(() => {
    const isZh = window.location.pathname.startsWith('/zh');
    const consent = readCookieConsent();

    // Immediately update consent from stored preferences or locale
    updateGtagConsent(consent, isZh);

    const handleConsentUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<CookieConsentRecord>;
      const isZhNow = window.location.pathname.startsWith('/zh');
      updateGtagConsent(customEvent.detail, isZhNow);
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsentUpdated);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsentUpdated);
    };
  }, []);

  // GA scripts ALWAYS render — consent mode controls data collection
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
