import appConfig from '../../app.config.json';

/**
 * Provider-independent geo country detection.
 * Checks headers from Vercel, Cloudflare, and AWS CloudFront.
 */

const GEO_HEADERS = [
  'x-vercel-ip-country',       // Vercel
  'cf-ipcountry',               // Cloudflare
  'cloudfront-viewer-country',  // AWS CloudFront / Replit
] as const;

/** Returns the 2-letter ISO country code, or empty string. */
export function getCountry(headers: Headers): string {
  for (const name of GEO_HEADERS) {
    const value = headers.get(name);
    const normalized = value?.trim().toUpperCase();
    if (normalized && /^[A-Z]{2}$/.test(normalized)) {
      return normalized;
    }
  }
  return '';
}

/** Countries that require explicit cookie consent by law. */
export const CONSENT_REQUIRED_COUNTRIES = new Set(appConfig.cookieConsent.requiredCountries);

/** Returns true when the lead should route to the China sales team. */
export function isChinaLead(country: string, locale: string): boolean {
  return country === 'CN' || locale === 'zh';
}
