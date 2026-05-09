import productsData from '@/data/enterprise-products.json';
import type {
  EnterpriseProduct,
  EnterpriseProductsFile,
  Locale,
  Release,
} from '@/types/enterprise';

const data = productsData as EnterpriseProductsFile;

export function getProducts(): EnterpriseProduct[] {
  return data.products;
}

export function getProductById(id: string): EnterpriseProduct | undefined {
  return data.products.find((p) => p.id === id);
}

export function getLatestRelease(product: EnterpriseProduct): Release | undefined {
  const tagged = product.releases.find((r) => r.isLatest);
  return tagged ?? product.releases[0];
}

export function getReleaseByVersion(
  product: EnterpriseProduct,
  version: string,
): Release | undefined {
  return product.releases.find((r) => r.version === version);
}

export function pickI18n(text: { en: string; zh: string }, locale: Locale): string {
  return text[locale] ?? text.en;
}

export function getProductIds(): string[] {
  return data.products.map((p) => p.id);
}

/**
 * Derive "has local install doc" from JSON: returns true iff any artifact in
 * the latest release is an install-doc whose URL points to /enterprise/* (local route).
 * Source of truth = JSON, so adding/removing a md+url stays in sync without extra plumbing.
 */
export function hasLocalInstallDoc(product: EnterpriseProduct): boolean {
  const latest = getLatestRelease(product);
  if (!latest) return false;
  return latest.artifacts.some(
    (a) => a.type === 'install-doc' && a.url.startsWith('/enterprise/'),
  );
}
