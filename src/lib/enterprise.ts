import productsData from '@/data/enterprise-products.json';
import type {
  Artifact,
  ArtifactType,
  EnterpriseProduct,
  EnterpriseProductsFile,
  Locale,
  Release,
} from '@/types/enterprise';

const OFFLINE_ARTIFACT_TYPES: ArtifactType[] = ['airgap-bundle', 'image-bundle'];

/** Online tab: installation guide only */
const ONLINE_ARTIFACT_TYPES: ArtifactType[] = ['install-doc'];

export function isOfflineArtifactType(type: ArtifactType): boolean {
  return OFFLINE_ARTIFACT_TYPES.includes(type);
}

export function filterArtifactsByDelivery(
  artifacts: Artifact[],
  delivery: 'online' | 'offline',
): Artifact[] {
  if (delivery === 'online') {
    return artifacts.filter((a) => ONLINE_ARTIFACT_TYPES.includes(a.type));
  }
  return artifacts.filter(
    (a) => isOfflineArtifactType(a.type) || a.type === 'helm-chart' || a.type === 'checksum',
  );
}

export function isOfflineDownloadsComingSoon(product: EnterpriseProduct): boolean {
  return product.offlineDownloadsComingSoon === true || product.downloadsComingSoon === true;
}

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
 * the latest release is an install-doc whose URL points to /products/* (local route).
 * Source of truth = JSON, so adding/removing a md+url stays in sync without extra plumbing.
 */
export function hasLocalInstallDoc(product: EnterpriseProduct): boolean {
  const latest = getLatestRelease(product);
  if (!latest) return false;
  return latest.artifacts.some(
    (a) => a.type === 'install-doc' && a.url.startsWith('/products/'),
  );
}
