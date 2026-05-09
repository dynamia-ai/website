export type Locale = 'en' | 'zh';

export interface I18nText {
  en: string;
  zh: string;
}

export type ArtifactType =
  | 'image-bundle'
  | 'helm-chart'
  | 'install-doc'
  | 'release-notes'
  | 'checksum';

export type ArchType = 'amd64' | 'arm64' | 'multi';

export type MirrorRegion = 'global' | 'cn' | 'apac' | 'eu' | 'us';

export interface Mirror {
  region: MirrorRegion;
  label: I18nText;
  url: string;
}

export interface Artifact {
  type: ArtifactType;
  arch?: ArchType;
  label: I18nText;
  filename?: string;
  url: string;
  mirrors?: Mirror[];
  size?: string;
  sha256?: string;
  installCommand?: string;
}

export type ReleaseChannel = 'stable' | 'beta' | 'rc' | 'eol';

export interface Release {
  version: string;
  releasedAt: string;
  channel: ReleaseChannel;
  isLatest?: boolean;
  releaseNotesUrl?: string;
  upgradeGuideUrl?: string;
  artifacts: Artifact[];
}

export type ProductStatus = 'ga' | 'beta' | 'eol';

export interface ProductHighlight {
  iconName?: string;
  title: I18nText;
  desc: I18nText;
}

export interface CompatibilityMatrix {
  kubernetes?: string[];
  os?: string[];
  gpu?: string[];
  [key: string]: string[] | undefined;
}

export interface EnterpriseProduct {
  id: string;
  name: I18nText;
  tagline: I18nText;
  description: I18nText;
  logo?: string;
  category?: string;
  status: ProductStatus;
  tags?: string[];
  docsUrl?: string;
  githubRepo?: string;
  highlights?: ProductHighlight[];
  compatibility?: CompatibilityMatrix;
  releases: Release[];
}

export interface EnterpriseProductsFile {
  products: EnterpriseProduct[];
}
