import appConfig from '../../app.config.json';

export const SITE_URL = appConfig.site.url;
export const FOUNDING_YEAR = appConfig.site.foundingYear;
export const CONTACT_EMAIL = appConfig.contact.email;
export const SALES_EMAIL = appConfig.contact.salesEmail;
export const NOREPLY_EMAIL = appConfig.contact.noreplyEmail;
export const CONTACT_PHONE_RAW = appConfig.contact.phone.raw;
export const CONTACT_PHONE_DISPLAY = appConfig.contact.phone.display;
export const GA4_MEASUREMENT_ID = appConfig.analytics.ga4MeasurementId;

export default appConfig;
