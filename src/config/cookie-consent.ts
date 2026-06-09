import appConfig from '../../app.config.json';

export const REQUIRED_COUNTRIES = new Set(appConfig.cookieConsent.requiredCountries);
export const GEO_COOKIE_MAX_AGE = appConfig.cookieConsent.geoCookieMaxAge;
export const CONSENT_MAX_AGE = appConfig.cookieConsent.consentMaxAge;
export const CONFIGURABLE_CATEGORIES = appConfig.cookieConsent.configurableCategories as readonly string[];
