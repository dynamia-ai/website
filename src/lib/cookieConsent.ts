export type CookieConsentCategory = 'necessary' | 'analytics' | 'marketing' | 'functional';

export interface CookieConsentPreferences {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export interface CookieConsentRecord extends CookieConsentPreferences {
  version: string;
  timestamp: string;
}

export const COOKIE_CONSENT_VERSION = '2026-05-07';
export const COOKIE_CONSENT_STORAGE_KEY = 'dynamia_cookie_consent';
export const COOKIE_CONSENT_EVENT = 'dynamia-cookie-consent-updated';
export const COOKIE_PREFERENCES_EVENT = 'dynamia-cookie-preferences-open';

export const DEFAULT_COOKIE_CONSENT: CookieConsentPreferences = {
  necessary: true,
  analytics: false,
  marketing: false,
  functional: false,
};

const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;

const isValidConsentRecord = (value: unknown): value is CookieConsentRecord => {
  if (!value || typeof value !== 'object') return false;

  const record = value as Partial<CookieConsentRecord>;
  return (
    record.necessary === true &&
    typeof record.analytics === 'boolean' &&
    typeof record.marketing === 'boolean' &&
    typeof record.functional === 'boolean' &&
    typeof record.version === 'string' &&
    typeof record.timestamp === 'string'
  );
};

export const createCookieConsentRecord = (
  preferences: CookieConsentPreferences,
): CookieConsentRecord => ({
  ...preferences,
  necessary: true,
  version: COOKIE_CONSENT_VERSION,
  timestamp: new Date().toISOString(),
});

export const readCookieConsent = (): CookieConsentRecord | null => {
  if (typeof window === 'undefined') return null;

  const storedValue = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
  if (!storedValue) return null;

  try {
    const parsedValue: unknown = JSON.parse(storedValue);
    return isValidConsentRecord(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
};

export const writeCookieConsent = (record: CookieConsentRecord) => {
  if (typeof window === 'undefined') return;

  const serializedRecord = JSON.stringify(record);
  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, serializedRecord);
  document.cookie = `${COOKIE_CONSENT_STORAGE_KEY}=${encodeURIComponent(serializedRecord)}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax`;
  window.dispatchEvent(new CustomEvent<CookieConsentRecord>(COOKIE_CONSENT_EVENT, { detail: record }));
};

export const openCookiePreferences = () => {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new Event(COOKIE_PREFERENCES_EVENT));
};
