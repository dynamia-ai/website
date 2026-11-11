import type {Metadata} from 'next';
import {routing} from '@/i18n/routing';
import {SITE_URL} from '@/config/app-config';

const DOMAIN = SITE_URL;

function normalizePath(path: string): string {
  if (!path || path === '/') return '';
  const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
  return withLeadingSlash.replace(/\/+$/, '');
}

export function localizedUrl(path: string, locale: string): string {
  const prefix = `/${locale}`;
  const normalizedPath = normalizePath(path);
  if (!prefix && !normalizedPath) return `${DOMAIN}/`;
  return `${DOMAIN}${prefix}${normalizedPath}`;
}

export function localizedPath(path: string, locale: string): string {
  const normalizedPath = normalizePath(path);
  return `/${locale}${normalizedPath}`;
}

export function shortenDescription(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  return `${text.slice(0, maxChars).trimEnd()}…`;
}

export function localizedAlternates(
  path: string,
  locales: readonly string[] = routing.locales,
): Record<string, string> {
  const xDefaultLocale = locales.includes(routing.defaultLocale)
    ? routing.defaultLocale
    : locales[0];

  return {
    ...Object.fromEntries(locales.map((loc) => [loc, localizedUrl(path, loc)])),
    ...(xDefaultLocale ? {'x-default': localizedUrl(path, xDefaultLocale)} : {}),
  };
}

export function pageAlternates(
  path: string,
  locale: string,
  locales: readonly string[] = routing.locales,
): Metadata['alternates'] {
  return {
    canonical: localizedUrl(path, locale),
    languages: localizedAlternates(path, locales),
  };
}
