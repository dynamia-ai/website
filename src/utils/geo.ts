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
    if (value && /^[A-Z]{2}$/.test(value.trim())) {
      return value.trim();
    }
  }
  return '';
}

/** Countries that require explicit cookie consent by law. */
export const CONSENT_REQUIRED_COUNTRIES = new Set(appConfig.cookieConsent.requiredCountries);
