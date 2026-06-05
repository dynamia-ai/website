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

type GtagConsentValue = 'granted' | 'denied';

interface GtagConsentUpdate {
  analytics_storage: GtagConsentValue;
  ad_storage: GtagConsentValue;
  functionality_storage: GtagConsentValue;
  personalization_storage: GtagConsentValue;
}

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function getGtagConsentUpdate(consent: CookieConsentRecord | null): GtagConsentUpdate {
  return {
    analytics_storage: (consent?.analytics ?? false) ? 'granted' : 'denied',
    ad_storage: (consent?.marketing ?? false) ? 'granted' : 'denied',
    functionality_storage: (consent?.functional ?? false) ? 'granted' : 'denied',
    personalization_storage: (consent?.functional ?? false) ? 'granted' : 'denied',
  };
}

function expireCookie(name: string, domain?: string) {
  const domainAttribute = domain ? `; domain=${domain}` : '';
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax${domainAttribute}`;
}

function clearGoogleAnalyticsCookies() {
  if (typeof document === 'undefined') return;

  const hostParts = window.location.hostname.split('.');
  const domains: Array<string | undefined> = [undefined];

  for (let index = 0; index < hostParts.length; index += 1) {
    const domain = hostParts.slice(index).join('.');
    domains.push(domain, `.${domain}`);
  }

  document.cookie
    .split(';')
    .map((cookie) => cookie.trim().split('=')[0])
    .filter((name) => name.startsWith('_ga'))
    .forEach((name) => {
      domains.forEach((domain) => expireCookie(name, domain));
    });
}

function updateLoadedGtagConsent(consent: CookieConsentRecord | null) {
  if (typeof window === 'undefined') return;

  window.gtag?.('consent', 'update', getGtagConsentUpdate(consent));

  if (!(consent?.analytics ?? false)) {
    clearGoogleAnalyticsCookies();
  }
}

const ConsentAwareAnalytics: React.FC = () => {
  const [consent, setConsent] = useState<CookieConsentRecord | null>(null);
  const analyticsEnabled = consent?.analytics ?? false;
  const gtagConsentJson = JSON.stringify(getGtagConsentUpdate(consent));

  useEffect(() => {
    const applyConsent = (nextConsent: CookieConsentRecord | null) => {
      setConsent(nextConsent);
      updateLoadedGtagConsent(nextConsent);
    };

    applyConsent(readCookieConsent());

    const handleConsentUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<CookieConsentRecord>;
      applyConsent(customEvent.detail);
    };

    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsentUpdated);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsentUpdated);
    };
  }, []);

  return (
    <>
      {analyticsEnabled && (
        <>
          <Script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){window.dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('consent', 'default', ${gtagConsentJson});
              gtag('js', new Date());
              gtag('config', '${GA_MEASUREMENT_ID}');
            `}
          </Script>
          <SpeedInsights />
          <Analytics />
        </>
      )}
    </>
  );
};

export default ConsentAwareAnalytics;
