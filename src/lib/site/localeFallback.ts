import {routing} from '@/i18n/routing';

/** Prefer current locale, then English, then remaining configured locales. */
export function contentLocaleCandidates(locale: string): string[] {
  const rest = routing.locales.filter((l) => l !== locale);
  rest.sort((a, b) => Number(b === routing.defaultLocale) - Number(a === routing.defaultLocale));
  return [locale, ...rest];
}
